import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { storage } from '../lib/storage/storage';
import { useSanctuary } from '../context/SanctuaryContext';
import {
  SUDOKU_PUZZLE_COLLECTION,
  solveSudoku,
  findBoardConflicts,
  isBoardSolved
} from '../lib/sudoku/sudokuEngine';

export const Games = () => {
  const { recordActivityDate, grantGameReward } = useSanctuary();

  // ==================================================
  // 1. SUDOKU GAME
  // ==================================================
  const [sudokuDifficulty, setSudokuDifficulty] = useState('Easy');
  const [puzzleIndex, setPuzzleIndex] = useState(0);

  const getInitialPuzzle = (diff, idx) => {
    const list = SUDOKU_PUZZLE_COLLECTION[diff] || SUDOKU_PUZZLE_COLLECTION.Easy;
    return list[idx % list.length];
  };

  const [initialBoard, setInitialBoard] = useState(() => getInitialPuzzle('Easy', 0));
  const [grid, setGrid] = useState(() => JSON.parse(JSON.stringify(getInitialPuzzle('Easy', 0))));
  const [selectedCell, setSelectedCell] = useState(null);
  const [isSudokuSolved, setIsSudokuSolved] = useState(false);
  const [sudokuFeedback, setSudokuFeedback] = useState(null);

  // Compute solution grid dynamically for hints & validation
  const solutionGrid = useMemo(() => solveSudoku(initialBoard), [initialBoard]);

  // Compute rule conflicts in real-time
  const boardConflicts = useMemo(() => findBoardConflicts(grid), [grid]);

  // Handle cell click
  const handleCellClick = (r, c) => {
    recordActivityDate('sudoku');
    setSelectedCell({ r, c });
  };

  // Handle number input (1-9 or 0 for erase)
  const handleNumberInput = (num) => {
    if (isSudokuSolved) return;
    recordActivityDate('sudoku');

    if (!selectedCell) {
      setSudokuFeedback('Please click a cell on the grid first.');
      setTimeout(() => setSudokuFeedback(null), 2500);
      return;
    }
    const { r, c } = selectedCell;
    if (initialBoard[r][c] !== 0) {
      setSudokuFeedback('Pre-filled numbers cannot be changed.');
      setTimeout(() => setSudokuFeedback(null), 2000);
      return;
    }

    const nextGrid = JSON.parse(JSON.stringify(grid));
    nextGrid[r][c] = num;
    setGrid(nextGrid);
    setSudokuFeedback(null);

    // Check if puzzle is completed
    if (isBoardSolved(nextGrid, solutionGrid)) {
      setIsSudokuSolved(true);
      grantGameReward('Sudoku');
    }
  };

  // Reset active board
  const handleResetSudoku = () => {
    setGrid(JSON.parse(JSON.stringify(initialBoard)));
    setSelectedCell(null);
    setIsSudokuSolved(false);
    setSudokuFeedback(null);
  };

  // Switch difficulty or get new puzzle
  const handleChangeDifficulty = (diff) => {
    setSudokuDifficulty(diff);
    setPuzzleIndex(0);
    const nextPuzzle = getInitialPuzzle(diff, 0);
    setInitialBoard(nextPuzzle);
    setGrid(JSON.parse(JSON.stringify(nextPuzzle)));
    setSelectedCell(null);
    setIsSudokuSolved(false);
    setSudokuFeedback(null);
  };

  const handleNextPuzzle = () => {
    const nextIdx = puzzleIndex + 1;
    setPuzzleIndex(nextIdx);
    const nextPuzzle = getInitialPuzzle(sudokuDifficulty, nextIdx);
    setInitialBoard(nextPuzzle);
    setGrid(JSON.parse(JSON.stringify(nextPuzzle)));
    setSelectedCell(null);
    setIsSudokuSolved(false);
    setSudokuFeedback(null);
  };

  // Hint feature
  const handleSudokuHint = () => {
    if (isSudokuSolved) return;
    recordActivityDate('sudoku');

    let targetR = selectedCell?.r;
    let targetC = selectedCell?.c;

    // If cell selected is empty or has a mistake
    if (targetR !== undefined && targetC !== undefined && initialBoard[targetR][targetC] === 0) {
      // Good target
    } else {
      // Find first empty cell
      let found = false;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (grid[r][c] === 0 || grid[r][c] !== solutionGrid[r][c]) {
            targetR = r;
            targetC = c;
            found = true;
            break;
          }
        }
        if (found) break;
      }
    }

    if (targetR !== undefined && targetC !== undefined) {
      const correctVal = solutionGrid[targetR][targetC];
      const nextGrid = JSON.parse(JSON.stringify(grid));
      nextGrid[targetR][targetC] = correctVal;
      setGrid(nextGrid);
      setSelectedCell({ r: targetR, c: targetC });
      setSudokuFeedback(`💡 Hint: Placed ${correctVal} at row ${targetR + 1}, col ${targetC + 1}`);

      if (isBoardSolved(nextGrid, solutionGrid)) {
        setIsSudokuSolved(true);
        grantGameReward('Sudoku');
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedCell || isSudokuSolved) return;
      const { r, c } = selectedCell;

      if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
        handleNumberInput(parseInt(e.key, 10));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleNumberInput(0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCell({ r: (r - 1 + 9) % 9, c });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCell({ r: (r + 1) % 9, c });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedCell({ r, c: (c - 1 + 9) % 9 });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedCell({ r, c: (c + 1) % 9 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, grid, initialBoard, isSudokuSolved]);

  // ==================================================
  // 2. PEARL CATCH - MEDIAPIPE HAND LANDMARKER (INDEX FINGER)
  // ==================================================
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'camera-ready' | 'playing' | 'finished' | 'camera-disabled'
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [bestScore, setBestScore] = useState(() => storage.get('pearlCatchBestScore', 0));
  const [isNewBest, setIsNewBest] = useState(false);
  const [catchAnimation, setCatchAnimation] = useState(false);

  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const playerPos = useRef({ x: 180, y: 100 });
  const targetPearl = useRef({ x: 180, y: 100, active: true });

  useEffect(() => {
    let landmarkerInstance = null;

    async function initHandLandmarker() {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        landmarkerInstance = await HandLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 1
        });
        landmarkerRef.current = landmarkerInstance;
      } catch (err) {
        console.warn('[MediaPipe HandLandmarker] GPU init failed, trying CPU delegate:', err);
      }
    }

    initHandLandmarker();

    return () => {
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  const stopWebcamTracks = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleEnableCamera = async () => {
    recordActivityDate('pearlCatch');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setGameState('camera-ready');
    } catch (err) {
      console.warn('[Pearl Catch] Camera access denied:', err);
      setGameState('camera-disabled');
    }
  };

  const handleStopCamera = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    stopWebcamTracks();
    setGameState('idle');
    setScore(0);
    setTimeLeft(30);
  };

  const handleStartGame = () => {
    recordActivityDate('pearlCatch');
    setScore(0);
    setTimeLeft(30);
    setIsNewBest(false);
    setGameState('playing');

    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 360;
    const h = canvas ? canvas.height : 200;
    targetPearl.current = {
      x: Math.random() * (w - 60) + 30,
      y: Math.random() * (h - 60) + 30,
      active: true
    };

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          handleEndGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleEndGame = () => {
    setGameState('finished');
    if (grantGameReward) {
      grantGameReward('Pearl Catch');
    }
    if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);

    setScore((finalScore) => {
      if (finalScore > bestScore) {
        setBestScore(finalScore);
        setIsNewBest(true);
        storage.save('pearlCatchBestScore', finalScore);
      }
      return finalScore;
    });
  };

  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'camera-ready' && gameState !== 'camera-disabled') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let lastVideoTime = -1;

    const renderLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (gameState !== 'camera-disabled' && videoRef.current && videoRef.current.readyState >= 2 && landmarkerRef.current) {
        const video = videoRef.current;
        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;

          try {
            const results = landmarkerRef.current.detectForVideo(video, performance.now());
            if (results.landmarks && results.landmarks.length > 0) {
              // Landmark 8: Index Finger Tip
              const indexTip = results.landmarks[0][8];
              const rawTargetX = (1 - indexTip.x) * canvas.width;
              const rawTargetY = indexTip.y * canvas.height;

              // LERP / Exponential Moving Average Smoothing Filter (alpha = 0.35)
              const alpha = 0.35;
              playerPos.current = {
                x: playerPos.current.x + (rawTargetX - playerPos.current.x) * alpha,
                y: playerPos.current.y + (rawTargetY - playerPos.current.y) * alpha
              };
            }
          } catch (e) {}
        }
      }

      if (gameState !== 'camera-disabled' && videoRef.current && videoRef.current.readyState >= 2) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();

        ctx.fillStyle = 'rgba(0, 107, 88, 0.25)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (gameState === 'playing' && targetPearl.current.active) {
        const p = targetPearl.current;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 24, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 255, 218, 0.35)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(p.x - 4, p.y - 4, 2, p.x, p.y, 16);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.7, '#e0f2f1');
        grad.addColorStop(1, '#80cbc4');
        ctx.fillStyle = grad;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;

        const dist = Math.hypot(playerPos.current.x - p.x, playerPos.current.y - p.y);
        if (dist < 32) {
          setScore((s) => s + 1);
          setCatchAnimation(true);
          setTimeout(() => setCatchAnimation(false), 250);

          targetPearl.current = {
            x: Math.random() * (canvas.width - 60) + 30,
            y: Math.random() * (canvas.height - 60) + 30,
            active: true
          };
        }
      }

      const { x: fx, y: fy } = playerPos.current;

      // Outer Glowing Ring for Index Finger Pointer
      ctx.beginPath();
      ctx.arc(fx, fy, 22, 0, Math.PI * 2);
      ctx.fillStyle = catchAnimation ? 'rgba(100, 255, 218, 0.7)' : 'rgba(255, 255, 255, 0.45)';
      ctx.strokeStyle = catchAnimation ? '#64ffda' : '#006b58';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#64ffda';
      ctx.shadowBlur = catchAnimation ? 18 : 8;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Inner Index Tip Focus Dot
      ctx.beginPath();
      ctx.arc(fx, fy, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#64ffda';
      ctx.fill();

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [gameState, catchAnimation]);

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      stopWebcamTracks();
    };
  }, []);

  const handlePracticeMouseMove = (e) => {
    if (gameState !== 'camera-disabled') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    playerPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // ==================================================
  // 3. QUICK MATH GAME
  // ==================================================
  const [mathDifficulty, setMathDifficulty] = useState('Easy');
  const [mathQuestion, setMathQuestion] = useState({ num1: 3, num2: 4, op: '+', answer: 7 });
  const [userAnswer, setUserAnswer] = useState('');
  const [mathScore, setMathScore] = useState(0);
  const [mathStreak, setMathStreak] = useState(0);
  const [mathFeedback, setMathFeedback] = useState(null);

  const generateQuestion = (difficulty = mathDifficulty) => {
    let num1, num2, op, answer;

    if (difficulty === 'Easy') {
      const isAdd = Math.random() > 0.5;
      op = isAdd ? '+' : '-';
      if (isAdd) {
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 + num2;
      } else {
        num1 = Math.floor(Math.random() * 15) + 5;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
      }
    } else {
      const isMultiply = Math.random() > 0.5;
      op = isMultiply ? '×' : '÷';
      if (isMultiply) {
        num1 = Math.floor(Math.random() * 9) + 2;
        num2 = Math.floor(Math.random() * 9) + 2;
        answer = num1 * num2;
      } else {
        num2 = Math.floor(Math.random() * 8) + 2;
        answer = Math.floor(Math.random() * 9) + 2;
        num1 = num2 * answer;
      }
    }

    setMathQuestion({ num1, num2, op, answer });
    setUserAnswer('');
    setMathFeedback(null);
  };

  const handleMathSubmit = (e) => {
    e.preventDefault();
    recordActivityDate('quickMath');
    const val = parseInt(userAnswer.trim(), 10);
    if (isNaN(val)) return;

    if (val === mathQuestion.answer) {
      setMathScore((s) => s + 10);
      setMathStreak((st) => st + 1);
      setMathFeedback({ type: 'success', text: 'Correct! Gentle +10 points' });
      setTimeout(() => generateQuestion(), 1000);
    } else {
      setMathStreak(0);
      setMathFeedback({ type: 'error', text: `Incorrect. The answer was ${mathQuestion.answer}` });
      setTimeout(() => generateQuestion(), 1500);
    }
  };

  const handleResetMath = () => {
    setMathScore(0);
    setMathStreak(0);
    generateQuestion(mathDifficulty);
  };

  return (
    <main className="max-w-[850px] mx-auto pt-24 pb-32 px-organic-padding flex flex-col gap-8 relative z-10 min-h-[85vh]">
      <header className="text-center">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-1">Serene Play</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant opacity-80">Engage your mind, gently.</p>
      </header>

      {/* Vertical 3-Equal Cards Container */}
      <div className="flex flex-col gap-8 w-full">
        {/* CARD 1: Sudoku */}
        <section className="glass-panel rounded-xl p-6 md:p-8 min-h-[500px] flex flex-col items-center justify-between border border-white/50 dark:border-slate-800 shadow-xl relative overflow-hidden">
          
          {/* Victory Overlay Modal */}
          {isSudokuSolved && (
            <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 ring-4 ring-emerald-500/30">
                <span className="material-symbols-outlined text-4xl">emoji_events</span>
              </div>
              <h3 className="font-headline-lg text-2xl font-bold text-white mb-1">Sudoku Mastered!</h3>
              <p className="font-body-md text-sm text-teal-200 mb-4 max-w-xs">
                Splendid logic! You completed the {sudokuDifficulty} Sudoku puzzle and earned <strong>+5 Sanctuary Pearls</strong>.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleNextPuzzle}
                  className="bg-teal-400 text-slate-950 font-bold px-5 py-2.5 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-1.5 text-xs"
                >
                  <span className="material-symbols-outlined text-base">play_arrow</span>
                  Play Next Puzzle
                </button>
                <button
                  onClick={handleResetSudoku}
                  className="bg-white/20 text-white font-semibold px-4 py-2.5 rounded-full hover:bg-white/30 transition-all text-xs"
                >
                  Replay
                </button>
              </div>
            </div>
          )}

          <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
            <div>
              <h2 className="font-headline-md text-headline-md text-secondary dark:text-teal-300">Sudoku</h2>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-slate-300 text-sm">Gentle 9x9 logic placement</p>
            </div>

            <div className="flex gap-2 items-center flex-wrap">
              <select
                value={sudokuDifficulty}
                onChange={(e) => handleChangeDifficulty(e.target.value)}
                className="font-label-sm text-xs text-primary dark:text-teal-200 bg-white/70 dark:bg-slate-900/80 border border-white/60 dark:border-slate-700 rounded-full px-3 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <button
                onClick={handleSudokuHint}
                className="font-label-sm text-xs text-amber-800 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 rounded-full px-3 py-1.5 font-bold hover:scale-105 transition-all flex items-center gap-1 shadow-xs"
                title="Get a hint for an empty cell"
              >
                <span className="material-symbols-outlined text-sm text-amber-600">lightbulb</span>
                Hint
              </button>

              <button
                onClick={handleNextPuzzle}
                className="font-label-sm text-xs text-primary dark:text-teal-200 bg-white/70 dark:bg-slate-900/80 border border-white/60 dark:border-slate-700 rounded-full px-3 py-1.5 font-bold hover:scale-105 transition-all flex items-center gap-1 shadow-xs"
                title="Load next Sudoku puzzle"
              >
                <span className="material-symbols-outlined text-sm">casino</span>
                New
              </button>

              <button
                onClick={handleResetSudoku}
                className="text-primary dark:text-teal-300 hover:scale-110 transition-transform p-1.5 rounded-full hover:bg-white/40 dark:hover:bg-slate-800"
                title="Reset Active Puzzle"
              >
                <span className="material-symbols-outlined text-xl">refresh</span>
              </button>
            </div>
          </div>

          {/* Feedback Toast */}
          {sudokuFeedback && (
            <div className="w-full max-w-[340px] mb-2 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-slate-800 border border-teal-200 dark:border-teal-700 text-teal-800 dark:text-teal-200 text-xs text-center font-medium animate-pulse">
              {sudokuFeedback}
            </div>
          )}

          {/* 9x9 SUDOKU BOARD WITH CRISP GRID LINES & REAL-TIME CONFLICT HIGHLIGHTING */}
          <div className="w-full max-w-[340px] aspect-square my-auto p-0.5 bg-slate-300/80 dark:bg-slate-900 border-2 border-primary/80 dark:border-teal-400/90 rounded-none shadow-lg">
            <div className="grid grid-cols-9 w-full h-full rounded-none overflow-hidden bg-white dark:bg-slate-950">
              {grid.map((row, r) =>
                row.map((val, c) => {
                  const cellKey = `${r}-${c}`;
                  const isFixed = initialBoard[r][c] !== 0;
                  const isConflict = boardConflicts.has(cellKey);
                  const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                  const isSameRowColBox =
                    selectedCell &&
                    (selectedCell.r === r ||
                      selectedCell.c === c ||
                      (Math.floor(selectedCell.r / 3) === Math.floor(r / 3) && Math.floor(selectedCell.c / 3) === Math.floor(c / 3)));
                  const selectedVal = selectedCell ? grid[selectedCell.r][selectedCell.c] : null;
                  const isSameNumber = selectedVal && selectedVal !== 0 && val === selectedVal;

                  const isThickRowBorder = r === 2 || r === 5;
                  const isThickColBorder = c === 2 || c === 5;

                  const borderClasses = `
                    ${r !== 8 ? (isThickRowBorder ? 'border-b-2 border-b-primary/70 dark:border-b-teal-400/80' : 'border-b border-b-slate-200/90 dark:border-b-slate-800/80') : ''}
                    ${c !== 8 ? (isThickColBorder ? 'border-r-2 border-r-primary/70 dark:border-r-teal-400/80' : 'border-r border-r-slate-200/90 dark:border-r-slate-800/80') : ''}
                  `;

                  let cellStyle = 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100';

                  if (isConflict) {
                    cellStyle = 'bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-300 font-extrabold ring-2 ring-red-500/80 z-20';
                  } else if (isSelected) {
                    cellStyle = 'bg-teal-400/30 dark:bg-teal-500/40 text-primary dark:text-white font-extrabold ring-2 ring-primary dark:ring-teal-300 z-10';
                  } else if (isSameNumber) {
                    cellStyle = 'bg-teal-200/50 dark:bg-teal-900/60 text-primary dark:text-teal-200 font-bold ring-1 ring-teal-400/60';
                  } else if (isSameRowColBox) {
                    cellStyle = 'bg-teal-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100';
                  } else if (isFixed) {
                    cellStyle = 'bg-slate-100/90 dark:bg-slate-800/90 text-primary dark:text-teal-300 font-bold cursor-default';
                  }

                  return (
                    <button
                      key={cellKey}
                      onClick={() => handleCellClick(r, c)}
                      className={`aspect-square flex items-center justify-center font-headline-md text-base md:text-lg transition-all focus:outline-none ${borderClasses} ${cellStyle}`}
                    >
                      {val !== 0 ? val : ''}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* KEYPAD & CONTROLS */}
          <div className="flex flex-col gap-2 w-full max-w-[340px] mt-3">
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberInput(num)}
                  className="glass-panel font-headline-md text-headline-md text-primary dark:text-teal-200 hover:bg-primary/20 dark:hover:bg-teal-900/50 rounded-xl py-2 font-bold hover:scale-105 transition-all shadow-sm active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => handleNumberInput(0)}
                className="glass-panel text-error dark:text-red-400 hover:bg-error/20 rounded-xl py-2 transition-all flex items-center justify-center shadow-sm active:scale-95"
                title="Erase (Backspace)"
              >
                <span className="material-symbols-outlined text-xl">backspace</span>
              </button>
            </div>

            <p className="font-label-sm text-[11px] text-outline dark:text-slate-400 text-center mt-1">
              Tip: Click any cell and use 1-9 or Arrow keys on your keyboard. Red cells indicate Sudoku conflicts.
            </p>
          </div>
        </section>

        {/* CARD 2: Pearl Catch */}
        <section className="glass-panel rounded-xl p-6 md:p-8 min-h-[460px] flex flex-col justify-between border border-white/50 dark:border-slate-800 shadow-xl relative overflow-hidden">
          <div className="w-full flex justify-between items-center mb-2">
            <div>
              <h2 className="font-headline-md text-headline-md text-secondary dark:text-teal-300">Pearl Catch</h2>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-slate-300 text-sm">
                Catch as many pearls as you can in 30 seconds using your index finger.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-label-sm text-xs bg-primary-container text-slate-950 dark:bg-teal-900 dark:text-teal-100 px-3.5 py-1 rounded-full font-bold border border-primary-container/80 dark:border-teal-700 shadow-xs">
                PEARLS: {score}
              </span>
              <span className="font-label-sm text-xs bg-secondary-container text-slate-950 dark:bg-slate-800 dark:text-slate-100 px-3.5 py-1 rounded-full font-bold border border-secondary-container/80 dark:border-slate-700 shadow-xs">
                TIME: {timeLeft}s
              </span>
            </div>
          </div>

          <div className="w-full aspect-video max-h-[260px] rounded-xl bg-slate-900/40 border border-white/40 dark:border-slate-700/60 relative overflow-hidden flex items-center justify-center my-auto shadow-inner">
            <video ref={videoRef} className="hidden" playsInline muted />

            <canvas
              ref={canvasRef}
              width={400}
              height={220}
              onMouseMove={handlePracticeMouseMove}
              className="w-full h-full"
            />

            {gameState === 'idle' && (
              <div className="absolute inset-0 bg-slate-900/15 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center gap-3">
                <p className="font-body-md text-body-md text-white font-medium max-w-sm">
                  Pearl Catch needs camera access to track your index finger movement.
                </p>
                <button
                  onClick={handleEnableCamera}
                  className="bg-primary text-white font-headline-md text-headline-md px-6 py-2.5 rounded-full shadow-lg hover:scale-105 transition-transform"
                >
                  Enable Camera
                </button>
              </div>
            )}

            {gameState === 'camera-ready' && (
              <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 text-center gap-3">
                <span className="font-label-sm text-xs tracking-widest text-primary uppercase bg-white/80 px-3.5 py-1 rounded-full border border-white/60 shadow">
                  Hand Tracking Ready
                </span>
                <button
                  onClick={handleStartGame}
                  className="bg-gradient-to-r from-primary to-secondary text-white font-headline-md text-headline-md px-8 py-3 rounded-full shadow-lg hover:scale-105 transition-transform"
                >
                  Start Game (30s)
                </button>
              </div>
            )}

            {gameState === 'finished' && (
              <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center gap-2 animate-fade-in">
                <span className="font-headline-lg text-headline-lg text-white font-bold tracking-wider">
                  TIME'S UP
                </span>
                <p className="font-body-lg text-body-lg text-white/90">
                  You collected <span className="font-bold text-primary-container text-xl">{score}</span> pearls.
                </p>
                <p className="font-label-sm text-sm text-white/80">
                  Your best: <span className="font-bold text-secondary-container">{bestScore}</span>
                </p>

                {isNewBest && (
                  <span className="bg-amber-400 text-slate-900 font-bold text-xs px-3 py-1 rounded-full shadow-md animate-bounce">
                    NEW BEST!
                  </span>
                )}

                <button
                  onClick={handleStartGame}
                  className="mt-2 bg-gradient-to-r from-primary to-secondary text-white font-headline-md text-headline-md px-8 py-2.5 rounded-full shadow-lg hover:scale-105 transition-transform"
                >
                  Play Again
                </button>
              </div>
            )}

            {gameState === 'camera-disabled' && (
              <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center gap-2">
                <p className="font-body-md text-body-md text-white">
                  Camera access is needed for Pearl Catch. Use your index finger in front of the camera to catch pearls.
                </p>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={handleEnableCamera}
                    className="bg-primary text-white font-label-sm text-xs px-4 py-2 rounded-full shadow"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleStartGame}
                    className="bg-white/60 text-primary font-label-sm text-xs px-4 py-2 rounded-full border border-white/60 shadow"
                  >
                    Start Practice Mode
                  </button>
                </div>
              </div>
            )}

            <div className="absolute bottom-2 left-3">
              <span className="font-label-sm text-xs tracking-wider text-primary uppercase bg-white/60 px-2.5 py-0.5 rounded-full border border-white/40 shadow-sm">
                Best Score: {bestScore}
              </span>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <span className="font-label-sm text-xs text-outline">
              {gameState === 'idle'
                ? 'Camera is off.'
                : gameState === 'camera-disabled'
                ? 'Practice Mode - Camera disabled'
                : 'Index Finger Tracking Active'}
            </span>

            {gameState !== 'idle' && (
              <button
                onClick={handleStopCamera}
                className="bg-error/80 text-white font-label-sm text-xs px-4 py-2 rounded-full hover:bg-error transition-all shadow-sm"
              >
                Stop Camera
              </button>
            )}
          </div>
        </section>

        {/* CARD 3: Quick Math */}
        <section className="glass-panel rounded-xl p-6 md:p-8 min-h-[460px] flex flex-col justify-between border border-white/50 shadow-xl">
          <div className="w-full flex justify-between items-center mb-2">
            <div>
              <h2 className="font-headline-md text-headline-md text-secondary">Quick Math</h2>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                Fast, gentle mental arithmetic to focus your attention.
              </p>
            </div>

            <div className="flex gap-2 items-center">
              <button
                onClick={() => {
                  const nextDiff = mathDifficulty === 'Easy' ? 'Medium' : 'Easy';
                  setMathDifficulty(nextDiff);
                  generateQuestion(nextDiff);
                }}
                className="font-label-sm text-label-sm text-primary glass-panel px-3.5 py-1 rounded-full hover:bg-white/60"
              >
                Diff: {mathDifficulty}
              </button>
              <button
                onClick={handleResetMath}
                className="text-primary p-1 rounded-full hover:bg-white/40"
                title="Restart Game"
              >
                <span className="material-symbols-outlined text-xl">refresh</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-white/40 border border-white/50 shadow-inner my-auto">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <span className="font-label-sm text-xs text-outline block uppercase">Score</span>
                <span className="font-headline-lg text-headline-lg text-primary">{mathScore}</span>
              </div>
              <div className="w-[1px] h-8 bg-outline-variant/40"></div>
              <div className="text-center">
                <span className="font-label-sm text-xs text-outline block uppercase">Streak</span>
                <span className="font-headline-lg text-headline-lg text-secondary">🔥 {mathStreak}</span>
              </div>
            </div>

            <form onSubmit={handleMathSubmit} className="flex flex-col sm:flex-row items-center gap-4">
              <div className="font-display-lg text-display-lg text-primary tracking-wider font-light">
                {mathQuestion.num1} {mathQuestion.op} {mathQuestion.num2} = ?
              </div>

              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="?"
                className="w-24 h-14 text-center font-display-lg text-headline-lg bg-white/80 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-container"
              />

              <button
                type="submit"
                className="px-6 py-3.5 rounded-full bg-primary text-white font-headline-md text-headline-md shadow hover:bg-primary/90 transition-transform active:scale-95"
              >
                Submit
              </button>
            </form>
          </div>

          {mathFeedback && (
            <div
              className={`mt-2 p-3 rounded-xl font-label-sm text-label-sm text-center shadow-sm ${
                mathFeedback.type === 'success'
                  ? 'bg-primary-container text-on-primary-container border border-primary-container'
                  : 'bg-red-100 text-red-900 border border-red-200'
              }`}
            >
              {mathFeedback.text}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

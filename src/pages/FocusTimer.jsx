import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSanctuary } from '../context/SanctuaryContext';
import { EnvironmentBackground } from '../components/EnvironmentBackground';
import { PlaylistLibrary } from '../components/PlaylistLibrary';

export const FocusTimer = () => {
  const { focusCategories, addFocusCategory, recordFocusSession, focusState } = useSanctuary();

  // Mode: 'timer' | 'stopwatch'
  const [focusMode, setFocusMode] = useState('timer');

  const [selectedCategory, setSelectedCategory] = useState('Work');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');

  // Timer State
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [showCustomDurationInput, setShowCustomDurationInput] = useState(false);
  const [customDurationValue, setCustomDurationValue] = useState('30');

  // Stopwatch State
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);

  const [isRunning, setIsRunning] = useState(false);

  // Completion modal state
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionResult, setCompletionResult] = useState(null);
  const [pearlClaimed, setPearlClaimed] = useState(false);

  // Timer Countdown Effect
  useEffect(() => {
    let timer = null;
    if (focusMode === 'timer' && isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (focusMode === 'timer' && isRunning && secondsLeft === 0) {
      setIsRunning(false);
      handleFinishSession(durationMinutes);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [focusMode, isRunning, secondsLeft, durationMinutes]);

  // Stopwatch Count-up Effect
  useEffect(() => {
    let swInterval = null;
    if (focusMode === 'stopwatch' && isRunning) {
      swInterval = setInterval(() => {
        setStopwatchSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (swInterval) clearInterval(swInterval);
    };
  }, [focusMode, isRunning]);

  const handleSwitchMode = (mode) => {
    if (isRunning) return;
    setFocusMode(mode);
    setIsRunning(false);
    setIsCompleted(false);
    setCompletionResult(null);
    setPearlClaimed(false);
    if (mode === 'timer') {
      setSecondsLeft(durationMinutes * 60);
    } else {
      setStopwatchSeconds(0);
    }
  };

  const handleSelectDuration = (mins) => {
    if (isRunning) return;
    setShowCustomDurationInput(false);
    setDurationMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  const handleApplyCustomDuration = (e) => {
    e.preventDefault();
    const parsed = parseInt(customDurationValue, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setDurationMinutes(parsed);
      setSecondsLeft(parsed * 60);
      setShowCustomDurationInput(false);
    }
  };

  const toggleRun = () => {
    setIsRunning(!isRunning);
  };

  const resetSession = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setCompletionResult(null);
    setPearlClaimed(false);
    if (focusMode === 'timer') {
      setSecondsLeft(durationMinutes * 60);
    } else {
      setStopwatchSeconds(0);
    }
  };

  const handleFinishSession = (calculatedMinutes) => {
    setIsRunning(false);
    const mins = Math.max(calculatedMinutes, 1);
    const result = recordFocusSession(mins, selectedCategory, focusMode);
    setCompletionResult(result);
    setIsCompleted(true);
    setPearlClaimed(false);
  };

  const handleStopwatchFinish = () => {
    const elapsedMins = Math.floor(stopwatchSeconds / 60);
    handleFinishSession(elapsedMins);
  };

  const handleAddCustomCategory = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    addFocusCategory(customInput.trim());
    setSelectedCategory(customInput.trim());
    setCustomInput('');
    setShowAddCustom(false);
  };

  const formatTimerTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatStopwatchTime = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerProgressPercent = ((durationMinutes * 60 - secondsLeft) / (durationMinutes * 60)) * 100;
  const stopwatchQualifies = stopwatchSeconds >= 25 * 60;

  return (
    <main className="relative z-10 w-full min-h-[85vh] flex flex-col items-center justify-center pt-24 pb-32 px-organic-padding">
      <div className="w-full max-w-4xl flex flex-col gap-8 items-center">
        {/* FOCUS TIMER & STOPWATCH CARD - ORIGINAL SANCTUARY THEME */}
        <div className="w-full max-w-lg glass-panel rounded-3xl p-8 md:p-10 shadow-2xl border border-white/60 text-center flex flex-col items-center gap-6 relative overflow-hidden">
          
          {/* Header & Aquarium Quick Link */}
          <div className="w-full flex flex-col items-center gap-2">
            <div className="w-full flex justify-between items-center">
              <span className="font-label-sm text-xs text-primary font-semibold uppercase tracking-widest bg-primary-container/40 px-3 py-1 rounded-full border border-primary-container/30">
                Deep Focus
              </span>

              {/* Focus Pearl Aquarium Access Button */}
              <Link
                to="/focus-aquarium"
                className="px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white text-primary border border-white/80 font-label-sm text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 hover:scale-105"
                title="Open Focus Pearl Aquarium"
              >
                <img src="/assets/collectibles/pearl.png" alt="Pearl" className="w-4 h-4 object-contain" />
                Focus Aquarium
              </Link>
            </div>

            <h1 className="font-headline-lg text-headline-lg text-primary text-2xl md:text-3xl mt-1">
              Quiet Presence
            </h1>
          </div>

          {/* Mode Selector */}
          {!isRunning && !isCompleted && (
            <div className="flex glass-panel p-1.5 rounded-full border border-white/60 shadow-sm">
              <button
                onClick={() => handleSwitchMode('timer')}
                className={`px-6 py-2 rounded-full font-label-sm text-xs font-semibold transition-all ${
                  focusMode === 'timer'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-on-surface-variant hover:bg-white/40'
                }`}
              >
                Timer
              </button>
              <button
                onClick={() => handleSwitchMode('stopwatch')}
                className={`px-6 py-2 rounded-full font-label-sm text-xs font-semibold transition-all ${
                  focusMode === 'stopwatch'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-on-surface-variant hover:bg-white/40'
                }`}
              >
                Stopwatch
              </button>
            </div>
          )}

          {/* Category Selector */}
          {!isRunning && !isCompleted && (
            <div className="w-full flex flex-col items-center gap-3">
              <label className="font-label-sm text-xs text-outline uppercase tracking-wider">
                Category
              </label>

              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {focusCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full font-label-sm text-xs transition-all ${
                      selectedCategory === cat
                        ? 'bg-primary text-white shadow-md font-semibold'
                        : 'bg-white/40 text-on-surface-variant hover:bg-white/70'
                    }`}
                  >
                    {cat}
                  </button>
                ))}

                <button
                  onClick={() => setShowAddCustom(true)}
                  className="px-3.5 py-1.5 rounded-full font-label-sm text-xs bg-white/30 text-primary border border-primary/30 hover:bg-white/60 transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">add</span>
                  + Add your own
                </button>
              </div>

              {showAddCustom && (
                <form onSubmit={handleAddCustomCategory} className="flex gap-2 mt-2 w-full max-w-xs">
                  <input
                    type="text"
                    placeholder="Category name..."
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    autoFocus
                    className="flex-1 bg-white/80 border border-white/60 rounded-xl px-3 py-1.5 font-body-md text-xs text-on-surface focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-primary text-white font-label-sm text-xs shadow"
                  >
                    Save
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Selected Category Pill during run */}
          {isRunning && (
            <div className="px-4 py-1 rounded-full bg-secondary-container/60 text-on-secondary-container font-label-sm text-xs border border-secondary/30">
              Focusing on: <span className="font-semibold">{selectedCategory}</span>
            </div>
          )}

          {/* MODE A: TIMER DISPLAY */}
          {focusMode === 'timer' && (
            <>
              {/* Circular Progress Timer Dial */}
              <div className="relative w-56 h-56 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    className="text-white/30 stroke-current"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    className="text-primary stroke-current transition-all duration-1000 ease-linear"
                    strokeWidth="6"
                    strokeDasharray="276.46"
                    strokeDashoffset={276.46 - (276.46 * timerProgressPercent) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute flex flex-col items-center">
                  <span className="font-display-lg text-display-lg text-primary tracking-widest font-light">
                    {formatTimerTime(secondsLeft)}
                  </span>
                  <span className="font-label-sm text-xs text-outline mt-1">
                    {durationMinutes} Minute Session
                  </span>
                </div>
              </div>

              {/* Timer Presets & Custom Duration */}
              {!isRunning && !isCompleted && (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-2 flex-wrap justify-center">
                    {[25, 45].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => handleSelectDuration(mins)}
                        className={`px-5 py-2 rounded-full font-label-sm text-xs font-semibold transition-all ${
                          durationMinutes === mins && !showCustomDurationInput
                            ? 'bg-secondary-container text-on-secondary-container shadow'
                            : 'bg-white/40 text-on-surface-variant hover:bg-white/70'
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}

                    <button
                      onClick={() => setShowCustomDurationInput(!showCustomDurationInput)}
                      className={`px-5 py-2 rounded-full font-label-sm text-xs font-semibold transition-all ${
                        showCustomDurationInput || (durationMinutes !== 25 && durationMinutes !== 45)
                          ? 'bg-secondary-container text-on-secondary-container shadow'
                          : 'bg-white/40 text-on-surface-variant hover:bg-white/70'
                      }`}
                    >
                      Custom
                    </button>
                  </div>

                  {showCustomDurationInput && (
                    <form onSubmit={handleApplyCustomDuration} className="flex gap-2 mt-2 items-center">
                      <input
                        type="number"
                        min="1"
                        max="180"
                        value={customDurationValue}
                        onChange={(e) => setCustomDurationValue(e.target.value)}
                        className="w-20 bg-white/80 border border-white/60 rounded-xl px-3 py-1.5 font-body-md text-xs text-center text-on-surface focus:outline-none"
                      />
                      <span className="font-label-sm text-xs text-outline">minutes</span>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-primary text-white font-label-sm text-xs shadow"
                      >
                        Set
                      </button>
                    </form>
                  )}
                </div>
              )}
            </>
          )}

          {/* MODE B: STOPWATCH DISPLAY */}
          {focusMode === 'stopwatch' && (
            <div className="w-full flex flex-col items-center gap-4 py-4">
              <div className="w-64 h-44 rounded-3xl glass-panel-opaque border border-white/70 flex flex-col items-center justify-center p-6 shadow-inner relative">
                <span className="font-label-sm text-[10px] text-outline uppercase tracking-widest mb-1">
                  Stopwatch Mode
                </span>
                <span className="font-display-lg text-4xl md:text-5xl text-primary tracking-widest font-mono font-light">
                  {formatStopwatchTime(stopwatchSeconds)}
                </span>

                {/* Qualification badge */}
                <div className="mt-3">
                  {stopwatchQualifies ? (
                    <span className="font-label-sm text-[11px] text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-300 font-semibold flex items-center gap-1 shadow-xs">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      Qualifies for 1 Focus Pearl (25m+)
                    </span>
                  ) : (
                    <span className="font-label-sm text-[11px] text-outline bg-white/50 px-3 py-1 rounded-full border border-white/60">
                      Reach 25:00 for 1 Focus Pearl
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          {!isCompleted && (
            <div className="flex gap-4 items-center">
              <button
                onClick={toggleRun}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-headline-md text-headline-md shadow-md hover:scale-105 transition-transform active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isRunning ? 'pause' : 'play_arrow'}
                </span>
                {isRunning ? 'Pause' : 'Start'}
              </button>

              {focusMode === 'stopwatch' && isRunning && (
                <button
                  onClick={handleStopwatchFinish}
                  className="px-6 py-3 rounded-full bg-emerald-600 text-white font-label-sm text-xs font-semibold shadow hover:scale-105 transition-transform"
                >
                  Complete
                </button>
              )}

              <button
                onClick={resetSession}
                className="p-3 rounded-full glass-panel text-on-surface-variant hover:text-primary transition-transform hover:scale-105"
                title="Reset"
              >
                <span className="material-symbols-outlined text-xl">refresh</span>
              </button>
            </div>
          )}

        {/* COMPLETION FLOW MODAL */}
        {isCompleted && completionResult && (
          <div className="w-full p-6 md:p-8 rounded-3xl bg-white/80 border border-white/80 shadow-2xl flex flex-col items-center gap-5 animate-fade-in">
            {/* SPECIAL 7-DAY CONTINUOUS STREAK RARE REWARD MODAL */}
            {completionResult.focusRareUnlocked ? (
              <>
                <span className="font-label-sm text-xs text-amber-800 font-bold uppercase tracking-widest bg-amber-100 px-4 py-1 rounded-full border border-amber-300 shadow-xs">
                  SPECIAL FOCUS REWARD
                </span>

                <div className="w-24 h-24 p-2 rounded-full bg-gradient-to-br from-amber-100 via-yellow-200 to-amber-300 pearl-glow flex items-center justify-center shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
                  <img src="/assets/collectibles/golden-pearl.png" alt="Golden Pearl" className="w-full h-full object-contain" />
                </div>

                <div className="text-center">
                  <h3 className="font-headline-lg text-headline-lg text-primary text-2xl font-bold">
                    Seven days of showing up.
                  </h3>
                  <p className="font-body-md text-sm text-on-surface-variant mt-2 max-w-sm">
                    Your 7 Focus Pearls have converted into a rare collectible!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-center font-semibold text-sm w-full">
                  You earned: <span className="text-amber-800 font-bold">Golden Pearl</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2">
                  <Link
                    to="/world"
                    className="px-6 py-3 rounded-full bg-primary text-white font-headline-md text-xs font-semibold shadow hover:scale-105 transition-transform flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">water_drop</span>
                    Add to Your Little World
                  </Link>

                  <button
                    onClick={resetSession}
                    className="px-6 py-3 rounded-full glass-panel text-primary font-label-sm text-xs font-semibold hover:bg-white/60"
                  >
                    Continue Focus
                  </button>
                </div>
              </>
            ) : completionResult.pearlAwarded ? (
              /* QUALIFYING SESSION FOCUS PEARL AWARD MODAL */
              <>
                <span className="font-label-sm text-xs text-primary uppercase tracking-widest bg-primary-container/40 px-3 py-1 rounded-full border border-primary-container/30">
                  Focus Complete
                </span>

                {!pearlClaimed ? (
                  <>
                    <h3 className="font-headline-lg text-headline-lg text-primary text-xl font-bold">
                      You earned a Focus Pearl.
                    </h3>
                    <p className="font-body-md text-sm text-on-surface-variant">
                      Category: <span className="font-semibold text-primary">{selectedCategory}</span> ({completionResult.session?.duration}m)
                    </p>

                    <div className="w-20 h-20 p-2 rounded-full bg-gradient-to-br from-white/90 to-cyan-100 pearl-glow flex items-center justify-center shadow-md">
                      <img src="/assets/collectibles/pearl.png" alt="Focus Pearl" className="w-14 h-14 object-contain drop-shadow" />
                    </div>

                    <button
                      onClick={() => setPearlClaimed(true)}
                      className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-headline-md text-sm font-semibold shadow-md hover:scale-105 transition-transform active:scale-95 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">water_drop</span>
                      Collect Focus Pearl
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 p-2 rounded-full bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center text-teal-800 shadow">
                      <span className="material-symbols-outlined text-3xl">check</span>
                    </div>

                    <h3 className="font-headline-lg text-headline-lg text-primary text-xl font-bold">
                      Added to your Focus Aquarium.
                    </h3>
                    <p className="font-body-md text-xs text-outline">
                      Your Focus Pearl is safely floating in your peaceful Focus Pearl Aquarium.
                    </p>

                    <div className="flex gap-3 mt-2">
                      <Link
                        to="/focus-aquarium"
                        className="px-6 py-2.5 rounded-full bg-secondary text-white font-label-sm text-xs font-semibold shadow hover:scale-105 transition-transform flex items-center gap-1.5"
                      >
                        <img src="/assets/collectibles/pearl.png" alt="Pearl" className="w-4 h-4 object-contain" />
                        View Focus Aquarium
                      </Link>

                      <button
                        onClick={resetSession}
                        className="px-6 py-2.5 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow hover:bg-primary/90 transition-transform"
                      >
                        Done
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              /* NON-QUALIFYING SESSION MODAL (< 25 mins) */
              <>
                <span className="font-label-sm text-xs text-primary uppercase tracking-widest bg-primary-container/40 px-3 py-1 rounded-full border border-primary-container/30">
                  Focus Complete
                </span>
                <h3 className="font-headline-lg text-headline-lg text-primary text-xl font-bold">
                  {completionResult.session?.duration} Minutes Completed
                </h3>
                <p className="font-body-md text-sm text-on-surface-variant">
                  Category: <span className="font-semibold text-primary">{selectedCategory}</span>
                </p>
                <p className="font-body-md text-xs text-outline max-w-xs">
                  Thank you for spending time in quiet presence. Sessions of 25+ minutes earn a Focus Pearl.
                </p>

                <button
                  onClick={resetSession}
                  className="px-6 py-2.5 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow hover:bg-primary/90 transition-transform mt-2"
                >
                  Done
                </button>
              </>
            )}
          </div>
        )}
        </div>

        {/* OCEAN PLAYLIST LIBRARY COMPONENT */}
        <PlaylistLibrary />
      </div>
    </main>
  );
};

export default FocusTimer;

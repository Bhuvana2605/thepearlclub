import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSanctuary } from '../context/SanctuaryContext';

export const MoodCanvas = () => {
  const navigate = useNavigate();
  const { journalEntries, saveMoodDrawing } = useSanctuary();
  const dateKey = new Date().toISOString().split('T')[0];

  const canvasRef = useRef(null);
  const [activeTool, setActiveTool] = useState('brush'); // 'brush' | 'eraser'
  const [brushColor, setBrushColor] = useState('#006b58');
  const [brushSize, setBrushSize] = useState(12);
  const [saveNotice, setSaveNotice] = useState(false);

  const colors = [
    { name: 'Primary Aqua', hex: '#006b58' },
    { name: 'Turquoise', hex: '#64ffda' },
    { name: 'Pearl Gold', hex: '#eee8b4' },
    { name: 'Warm Sunset', hex: '#ea4335' },
    { name: 'Deep Water', hex: '#4285f4' },
  ];

  // Initialize and restore saved drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth - 32;
    canvas.height = parent.clientHeight - 32;

    const ctx = canvas.getContext('2d');
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Fill canvas background with solid white to match eraser color perfectly
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Restore previous drawing if exists
    const existing = journalEntries[dateKey]?.drawingDataUrl;
    if (existing) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = existing;
    }
  }, [dateKey, journalEntries]);

  // Drawing event handlers
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const getPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    isDrawing.current = true;
    lastPos.current = getPos(e);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const currentPos = getPos(e);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(currentPos.x, currentPos.y);

    if (activeTool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = brushSize * 2.5;
    } else {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
    }

    ctx.stroke();
    lastPos.current = currentPos;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    saveMoodDrawing(dateKey, dataUrl);
    setSaveNotice(true);
    setTimeout(() => {
      setSaveNotice(false);
      navigate('/journal');
    }, 1200);
  };

  return (
    <main className="w-full max-w-[900px] mx-auto pt-24 pb-32 px-organic-padding flex flex-col items-center justify-center min-h-[85vh]">
      <div className="text-center mb-6">
        <h2 className="font-headline-lg text-headline-lg text-primary mb-1">Today's Mood</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Express your feeling visually</p>
      </div>

      {/* Main Canvas Container */}
      <div className="relative w-full aspect-[4/3] max-h-[55vh] glass-panel rounded-xl flex items-center justify-center p-4 shadow-xl border border-white/50">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full rounded-lg shadow-inner cursor-crosshair touch-none"
        />

        {/* Floating Side Tools */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
          <button
            onClick={() => setActiveTool('brush')}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              activeTool === 'brush' ? 'active-tool' : 'pearl-btn text-on-surface-variant'
            }`}
            title="Brush"
          >
            <span className="material-symbols-outlined">brush</span>
          </button>

          <button
            onClick={() => setActiveTool('eraser')}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              activeTool === 'eraser' ? 'active-tool' : 'pearl-btn text-on-surface-variant'
            }`}
            title="Eraser"
          >
            <span className="material-symbols-outlined">ink_eraser</span>
          </button>

          <div className="w-6 h-[1px] bg-outline-variant mx-auto my-1"></div>

          <button
            onClick={handleClear}
            className="pearl-btn w-11 h-11 rounded-full flex items-center justify-center text-error hover:bg-red-50"
            title="Clear Canvas"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>

        {/* Bottom Palette & Brush Size */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2.5 glass-panel rounded-full shadow-md border border-white/60">
          {colors.map((c) => (
            <button
              key={c.hex}
              onClick={() => {
                setBrushColor(c.hex);
                setActiveTool('brush');
              }}
              style={{ backgroundColor: c.hex }}
              className={`w-7 h-7 rounded-full shadow-sm hover:scale-110 transition-transform ${
                brushColor === c.hex && activeTool === 'brush' ? 'ring-2 ring-white scale-110' : ''
              }`}
              title={c.name}
            />
          ))}
          <div className="w-[1px] h-6 bg-outline-variant/40 mx-1"></div>
          <input
            type="range"
            min="4"
            max="30"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-20"
            title="Brush Size"
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-8 relative">
        <button
          onClick={handleSave}
          className="glass-panel text-primary font-headline-md text-headline-md px-8 py-3.5 rounded-full flex items-center gap-3 hover:scale-105 transition-transform hover:bg-white/70 shadow-md border border-white/50"
        >
          <span className="material-symbols-outlined">favorite</span>
          Save to Chronicle
        </button>

        {saveNotice && (
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap animate-bounce">
            Saved to Chronicle! Redirecting...
          </span>
        )}
      </div>
    </main>
  );
};

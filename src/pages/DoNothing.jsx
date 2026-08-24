import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { WebGLWaterShader } from '../components/WebGLWaterShader';
import { EnvironmentBackground } from '../components/EnvironmentBackground';

export const DoNothing = () => {
  const navigate = useNavigate();
  const [isAwake, setIsAwake] = useState(true);
  const [timeStr, setTimeStr] = useState('00:00');
  const timeoutRef = useRef(null);

  // Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${h}:${m}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Wake interface on interaction & auto-sleep after 3.5s
  const wakeInterface = () => {
    setIsAwake(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsAwake(false);
    }, 3500);
  };

  useEffect(() => {
    window.addEventListener('mousemove', wakeInterface);
    window.addEventListener('touchstart', wakeInterface);
    window.addEventListener('keydown', wakeInterface);

    timeoutRef.current = setTimeout(() => {
      setIsAwake(false);
    }, 3000);

    return () => {
      window.removeEventListener('mousemove', wakeInterface);
      window.removeEventListener('touchstart', wakeInterface);
      window.removeEventListener('keydown', wakeInterface);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <main className="fixed inset-0 w-screen h-screen overflow-hidden bg-surface z-50">
      {/* Background WebGL Shader */}
      <WebGLWaterShader className="absolute inset-0 w-full h-full z-0 opacity-70 mix-blend-multiply object-cover" />

      {/* Faint Floating Sound Symbols */}
      <div className="absolute inset-0 pointer-events-none flex justify-between items-start p-safe-area z-10">
        <div className="flex flex-col gap-12 ml-8 mt-8 opacity-25">
          <span className="material-symbols-outlined text-primary text-3xl animate-float-slow">waves</span>
          <span className="material-symbols-outlined text-secondary text-2xl animate-float-fast ml-10">air</span>
        </div>
        <div className="flex flex-col gap-8 mr-8 mt-16 opacity-20">
          <span className="material-symbols-outlined text-primary text-xl animate-float-slow">water_drop</span>
        </div>
      </div>

      {/* Corner Clock */}
      <div className="absolute bottom-safe-area right-safe-area z-10 pointer-events-none">
        <div className="font-label-sm text-label-sm text-primary/30 mix-blend-multiply tracking-widest opacity-40 font-mono">
          {timeStr}
        </div>
      </div>

      {/* Interaction Overlay (Fades in on mouse move) */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out z-50 ${
          isAwake
            ? 'opacity-100 backdrop-blur-md bg-surface/10 pointer-events-auto'
            : 'opacity-0 backdrop-blur-none pointer-events-none'
        }`}
      >
        <p className="font-body-lg text-body-lg text-primary/80 mb-8 animate-pulse text-center px-4 font-light">
          Deep breath. You are safe here.
        </p>

        <button
          onClick={() => navigate(-1)}
          className="group relative flex items-center justify-center px-8 py-4 bg-white/30 hover:bg-white/50 border border-white/40 backdrop-blur-xl rounded-full transition-all duration-500 shadow-lg hover:-translate-y-1"
        >
          <span className="font-body-md text-body-md text-primary font-medium tracking-wide">
            Return to Surface
          </span>
          <span className="material-symbols-outlined text-primary ml-2 group-hover:translate-x-1 transition-transform">
            arrow_outward
          </span>
        </button>
      </div>
    </main>
  );
};

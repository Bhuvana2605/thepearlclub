import React from 'react';
import { useSanctuary } from '../context/SanctuaryContext';

export const GoldenPearlPopup = ({ isOpen, onClose }) => {
  const { collectGoldenPearl, worldState } = useSanctuary();

  if (!isOpen) return null;

  const handleCollect = () => {
    collectGoldenPearl();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm glass-panel-opaque rounded-xl p-8 text-center flex flex-col items-center gap-6 border border-white/60 shadow-2xl relative">
        {/* Glowing Golden Pearl Graphic */}
        <div className="relative w-24 h-24 flex items-center justify-center animate-bounce" style={{ animationDuration: '3s' }}>
          <div className="absolute inset-0 rounded-full bg-tertiary-container blur-xl opacity-80 animate-pulse"></div>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white via-tertiary-container to-tertiary pearl-glow border border-white/60 flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-4xl text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
              stars
            </span>
          </div>
        </div>

        <div>
          <span className="font-label-sm text-label-sm text-tertiary font-semibold uppercase tracking-widest bg-tertiary-container/40 px-3 py-1 rounded-full border border-tertiary-container/30">
            Discovery
          </span>
          <h2 className="font-headline-lg text-headline-lg text-primary mt-3">
            You found a Golden Pearl.
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            A quiet moment of reflection has brought a rare treasure to the surface.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleCollect}
            className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-headline-md text-headline-md shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">water_drop</span>
            Add to Your Little World
          </button>
          <button
            onClick={onClose}
            className="text-on-surface-variant font-label-sm text-label-sm hover:underline py-1"
          >
            Leave in the water for now
          </button>
        </div>
      </div>
    </div>
  );
};

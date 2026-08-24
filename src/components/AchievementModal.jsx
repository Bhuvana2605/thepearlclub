import React from 'react';
import { useSanctuary } from '../context/SanctuaryContext';

export const AchievementModal = ({ achievement, onClose }) => {
  const { claimAchievementReward } = useSanctuary();

  if (!achievement) return null;

  const handleClaim = () => {
    claimAchievementReward(achievement.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/30 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm glass-panel-opaque rounded-2xl p-8 text-center flex flex-col items-center gap-6 border border-white/60 shadow-2xl relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-tertiary-container via-secondary-container to-primary-container pearl-glow flex items-center justify-center text-primary shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
          <span className="material-symbols-outlined text-4xl text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
            {achievement.collectible?.icon || 'stars'}
          </span>
        </div>

        <div>
          <span className="font-label-sm text-xs text-tertiary font-semibold uppercase tracking-widest bg-tertiary-container/40 px-3 py-1 rounded-full border border-tertiary-container/30">
            Achievement Unlocked
          </span>
          <h2 className="font-headline-lg text-headline-lg text-primary mt-2">
            {achievement.title}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            "{achievement.description}"
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-headline-md text-headline-md shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">military_tech</span>
          Claim Collectible
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useSanctuary } from '../context/SanctuaryContext';

export const DailyRewardModal = ({ isOpen, onClose }) => {
  const { claimDailyReward } = useSanctuary();
  const [claimedItem, setClaimedItem] = useState(null);

  if (!isOpen) return null;

  const handleOpenReward = () => {
    const item = claimDailyReward();
    if (item) {
      setClaimedItem(item);
    }
  };

  const handleDone = () => {
    setClaimedItem(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/25 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm glass-panel-opaque rounded-2xl p-8 text-center flex flex-col items-center gap-6 border border-white/60 shadow-2xl relative">
        {!claimedItem ? (
          <>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-container via-secondary-container to-tertiary-container pearl-glow flex items-center justify-center text-primary shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                water_drop
              </span>
            </div>

            <div>
              <span className="font-label-sm text-xs text-primary font-semibold uppercase tracking-widest bg-primary-container/40 px-3 py-1 rounded-full border border-primary-container/30">
                Daily Welcome
              </span>
              <h2 className="font-headline-lg text-headline-lg text-primary mt-2">
                Good to see you.
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Your daily pearl is waiting for you today.
              </p>
            </div>

            <button
              onClick={handleOpenReward}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-headline-md text-headline-md shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">stars</span>
              Open Reward
            </button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white via-primary-container to-secondary-container pearl-glow flex items-center justify-center text-primary shadow-lg">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {claimedItem.icon}
              </span>
            </div>

            <div>
              <span className="font-label-sm text-xs text-secondary font-semibold uppercase tracking-widest bg-secondary-container/40 px-3 py-1 rounded-full border border-secondary-container/30">
                Reward Claimed
              </span>
              <h2 className="font-headline-lg text-headline-lg text-primary mt-2">
                You received a {claimedItem.name}.
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                {claimedItem.description}
              </p>
            </div>

            <button
              onClick={handleDone}
              className="w-full py-3.5 px-6 rounded-full bg-primary text-white font-headline-md text-headline-md shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">water_drop</span>
              Add to Your Little World
            </button>
          </>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useSanctuary } from '../context/SanctuaryContext';
import { RewardRevealModal } from './RewardRevealModal';

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

  if (claimedItem) {
    return (
      <RewardRevealModal
        isOpen={Boolean(claimedItem)}
        onClose={handleDone}
        collectibleId={claimedItem.id || 'pearl'}
        title="Daily Pearl Reward"
        subtitle={`You received a ${claimedItem.name || 'pearl'}. It has been added to your sanctuary.`}
        onClaim={handleDone}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/25 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm glass-panel-opaque rounded-3xl p-8 text-center flex flex-col items-center gap-6 border border-white/60 shadow-2xl relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-container via-secondary-container to-tertiary-container pearl-glow flex items-center justify-center text-primary shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            water_drop
          </span>
        </div>

        <div>
          <span className="font-label-sm text-xs text-primary font-semibold uppercase tracking-widest bg-primary-container/40 px-3 py-1 rounded-full border border-primary-container/30">
            Daily Welcome
          </span>
          <h2 className="font-headline-lg text-headline-lg text-primary mt-2 text-xl font-semibold">
            Good to see you.
          </h2>
          <p className="font-body-md text-xs text-on-surface-variant mt-1">
            Your daily pearl is waiting for you today.
          </p>
        </div>

        <button
          onClick={handleOpenReward}
          className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-label-sm text-xs font-semibold shadow hover:scale-105 transition-transform flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base">stars</span>
          Open Reward
        </button>
      </div>
    </div>
  );
};

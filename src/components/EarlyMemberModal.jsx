import React from 'react';

/**
 * One-Time Welcome Reward Modal for Early Pearl Club Members (First 100 Users)
 */
export const EarlyMemberModal = ({ isOpen, onClose, pearlNumberStr }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center gap-5 border border-amber-200/60 relative overflow-hidden pearl-glow">
        
        {/* Background Ambient Aura */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-300/30 rounded-full blur-3xl pointer-events-none"></div>

        {/* Founding Badge Icon */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300 p-2 shadow-xl flex items-center justify-center border-2 border-amber-300 animate-pulse">
          <img
            src="/assets/collectibles/pearl-club-early-member.png"
            alt="Early Pearl Club Member"
            className="w-full h-full object-contain filter drop-shadow-md"
          />
        </div>

        {/* Header Text */}
        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-xs font-semibold text-amber-900 uppercase tracking-widest bg-amber-100/80 px-3.5 py-1 rounded-full border border-amber-200/80 mx-auto">
            {pearlNumberStr || 'Early Member'} • Founding Member
          </span>
          <h2 className="font-headline-lg text-headline-lg text-primary text-xl sm:text-2xl mt-1">
            Welcome to Pearl Club.
          </h2>
        </div>

        {/* Body Description */}
        <div className="font-body-md text-sm text-on-surface-variant/90 flex flex-col gap-2 max-w-xs">
          <p>You are <strong className="text-primary font-semibold">{pearlNumberStr || 'Pearl #001'}</strong>.</p>
          <p>You are officially one of the first 100 founding members of Pearl Club.</p>
          <p className="text-xs text-outline italic">Your exclusive Early Pearl Club Member collectible is yours forever.</p>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white font-label-sm text-xs font-semibold shadow-lg hover:brightness-110 transition-transform active:scale-95 flex items-center justify-center gap-2 mt-2"
        >
          <span className="material-symbols-outlined text-base">water_drop</span>
          Add to Your Little World
        </button>
      </div>
    </div>
  );
};

export default EarlyMemberModal;

import React, { useEffect } from 'react';
import { getCollectible } from '../data/collectibles';

/**
 * Centered Collectible Detail Modal Component
 * Displays large collectible asset, name, rarity badge, description, and source origin.
 */
export const CollectibleDetailModal = ({ isOpen, item, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const registryData = getCollectible(item.id || item);
  const name = item.name || registryData.name || 'Sanctuary Collectible';
  const image = item.asset || item.image || registryData.asset || registryData.image || '/assets/collectibles/pearl.png';
  const rarity = item.rarity || registryData.rarity || 'common';
  const description = item.description || registryData.description || 'A quiet discovery resting in your haven.';

  const getSourceLabel = (source) => {
    if (source === 'early-member' || source === 'early_member') return 'Early Pearl Club Member';
    if (source === 'focus-7day' || source === 'focus_rare' || source === 'focus') return 'Earned through Focus';
    if (source === 'daily_reward' || source === 'daily') return 'Daily Reward';
    if (source === 'return_milestone') return 'Return Visit Milestone';
    if (source === 'achievement') return 'Achievement Milestone';
    if (source === 'found') return 'Found in Your Little World';
    return 'Haven Collection';
  };

  const getRarityBadgeStyle = (r) => {
    if (r === 'legendary') return 'bg-amber-200 text-slate-950 border-amber-400 font-bold !text-black';
    if (r === 'rare') return 'bg-purple-200 text-slate-950 border-purple-400 font-bold !text-black';
    if (r === 'special') return 'bg-emerald-200 text-slate-950 border-emerald-400 font-bold !text-black';
    return 'bg-cyan-200 text-slate-950 border-cyan-400 font-bold !text-black';
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm sm:max-w-md glass-panel-opaque rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center gap-5 border border-white/70 shadow-2xl relative z-10 my-auto animate-scale-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Close collectible details"
      >
        {/* Top-Right Close Button */}
        <button
          onClick={onClose}
          aria-label="Close collectible details"
          className="absolute top-4 right-4 text-on-surface-variant hover:text-primary p-2 rounded-full glass-panel hover:bg-white/80 transition-all flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Ambient Glow & Large Collectible Image */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-white/90 via-cyan-100/60 to-purple-100/40 pearl-glow flex items-center justify-center p-4 border border-white/80 shadow-inner mt-2">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain filter drop-shadow-xl transition-transform hover:scale-110 duration-300"
            onError={(e) => { e.target.src = '/assets/collectibles/pearl.png'; }}
          />
        </div>

        {/* Collectible Details Header */}
        <div className="flex flex-col items-center gap-1.5 w-full">
          <h2 className="font-headline-lg text-2xl font-bold text-primary tracking-tight">{name}</h2>
          
          <span className={`font-label-sm text-xs uppercase tracking-wider px-3.5 py-1 rounded-full border shadow-xs ${getRarityBadgeStyle(rarity)}`} style={{ color: '#000000' }}>
            {rarity}
          </span>
        </div>

        {/* Description Text */}
        <p className="font-body-md text-sm text-on-surface-variant leading-relaxed max-w-xs px-2 italic">
          "{description}"
        </p>

        {/* Obtained Source Line */}
        <div className="w-full border-t border-white/40 pt-4 flex flex-col items-center gap-1">
          <span className="font-label-sm text-[11px] text-outline uppercase tracking-widest font-semibold">Origin</span>
          <span className="font-label-sm text-xs font-semibold text-primary bg-primary-container/30 px-4 py-1.5 rounded-full border border-primary-container/20">
            {getSourceLabel(item.source)}
          </span>
        </div>
      </div>
    </div>
  );
};

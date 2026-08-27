import React, { useState, useEffect } from 'react';
import { useSanctuary } from '../context/SanctuaryContext';
import { getCollectible } from '../data/collectibles';

export const RewardRevealModal = ({
  isOpen,
  onClose,
  collectibleId,
  title = 'New Discovery',
  subtitle = 'A rare treasure has entered your haven.',
  onClaim
}) => {
  const { settings } = useSanctuary();
  const isReducedMotion = settings?.reducedMotion ?? false;

  const [animStage, setAnimStage] = useState(isReducedMotion ? 'complete' : 'initial');

  useEffect(() => {
    if (!isOpen) {
      setAnimStage(isReducedMotion ? 'complete' : 'initial');
      return;
    }

    if (isReducedMotion) {
      setAnimStage('complete');
      return;
    }

    // Standard Polished Reveal Timeline
    setAnimStage('initial');

    const t1 = setTimeout(() => setAnimStage('settle'), 200);   // 0.2s: Chest settles into position
    const t2 = setTimeout(() => setAnimStage('opening'), 800);  // 0.8s: Chest lid opens smoothly
    const t3 = setTimeout(() => setAnimStage('glowing'), 1200); // 1.2s: Soft warm glow from inside chest
    const t4 = setTimeout(() => setAnimStage('rising'), 1400);  // 1.4s: Collectible rises out of chest
    const t5 = setTimeout(() => setAnimStage('complete'), 2000);// 2.0s: Collectible reaches final position & sparkles settle

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isOpen, isReducedMotion]);

  if (!isOpen || !collectibleId) return null;

  const collectible = getCollectible(collectibleId) || {
    id: collectibleId,
    name: 'Sanctuary Collectible',
    asset: `/assets/collectibles/${collectibleId}.png`
  };

  const handleAction = () => {
    if (onClaim) {
      onClaim();
    }
    onClose();
  };

  const isLidOpen = animStage === 'opening' || animStage === 'glowing' || animStage === 'rising' || animStage === 'complete';
  const isRising = animStage === 'rising' || animStage === 'complete';
  const isGlowing = animStage === 'glowing' || animStage === 'rising' || animStage === 'complete';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm glass-panel-opaque rounded-3xl p-8 text-center flex flex-col items-center gap-6 border border-white/60 shadow-2xl relative overflow-hidden">
        
        {/* REWARD REVEAL CONTAINER */}
        <div className="relative w-48 h-48 flex items-center justify-center my-2">
          
          {/* Background Ambient Glow */}
          <div
            className={`absolute inset-4 rounded-full bg-amber-300/60 blur-2xl transition-opacity duration-700 pointer-events-none ${
              isGlowing ? 'opacity-100 scale-110' : 'opacity-0 scale-90'
            }`}
          />

          {/* Sparkles / Particles Effect */}
          {isGlowing && !isReducedMotion && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center animate-pulse">
              <span className="absolute top-2 left-6 text-amber-400 text-lg animate-ping">✨</span>
              <span className="absolute top-4 right-8 text-amber-300 text-base animate-ping" style={{ animationDelay: '300ms' }}>✨</span>
              <span className="absolute bottom-10 left-8 text-yellow-400 text-sm animate-ping" style={{ animationDelay: '600ms' }}>✨</span>
              <span className="absolute bottom-8 right-6 text-amber-200 text-base animate-ping" style={{ animationDelay: '150ms' }}>✨</span>
            </div>
          )}

          {/* TREASURE CHEST ASSET (BASE CONTAINER) */}
          <div className="absolute bottom-0 w-36 h-28 flex items-center justify-center z-10 transition-transform duration-500">
            <img
              src="/assets/collectibles/treasure-chest.png"
              alt="Treasure Chest"
              className={`w-full h-full object-contain drop-shadow-md transition-transform duration-700 ${
                isLidOpen ? 'scale-105 opacity-90' : 'scale-100'
              }`}
            />
          </div>

          {/* RISING COLLECTIBLE ARTWORK */}
          <div
            className={`absolute z-20 transition-all duration-1000 ease-out flex items-center justify-center ${
              isRising
                ? 'top-2 scale-110 opacity-100'
                : 'bottom-6 scale-50 opacity-0'
            }`}
          >
            <div className="w-24 h-24 rounded-full bg-white/90 border border-white/70 shadow-xl pearl-glow flex items-center justify-center p-3">
              <img
                src={collectible.asset || collectible.image || `/assets/collectibles/${collectibleId}.png`}
                alt=""
                className="w-16 h-16 object-contain"
                onError={(e) => { e.target.src = '/assets/collectibles/pearl.png'; }}
              />
            </div>
          </div>
        </div>

        {/* MODAL HEADING & SUBTITLE */}
        <div>
          <span className="font-label-sm text-xs text-amber-800 font-semibold uppercase tracking-widest bg-amber-100/60 px-3.5 py-1 rounded-full border border-amber-200/50">
            {title}
          </span>
          <p className="font-body-md text-xs text-on-surface-variant mt-3 leading-relaxed max-w-xs mx-auto">
            {subtitle}
          </p>
        </div>

        {/* ACTION BUTTON */}
        <div className="w-full mt-1">
          <button
            onClick={handleAction}
            className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-label-sm text-xs font-semibold shadow hover:scale-105 transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">water_drop</span>
            Add to Your Little World
          </button>
        </div>
      </div>
    </div>
  );
};

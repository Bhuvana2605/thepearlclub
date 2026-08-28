import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSanctuary } from '../context/SanctuaryContext';
import { CollectibleDetailModal } from '../components/CollectibleDetailModal';

export const FocusAquarium = () => {
  const navigate = useNavigate();
  const { focusState } = useSanctuary();
  const [selectedPearl, setSelectedPearl] = useState(null);

  const pearls = (focusState?.pearls || []).filter((p) => p.status === 'available');
  const streakProgress = focusState?.streakProgress || 0;

  // Staggered layout coordinates & sizes for floating pearls
  const getPearlPosition = (index) => {
    const colCount = Math.min(Math.max(pearls.length, 3), 6);
    const row = Math.floor(index / colCount);
    const col = index % colCount;

    // Distribute with organic variance
    const baseX = 15 + ((col * 70) / Math.max(colCount - 1, 1));
    const baseY = 25 + ((row * 20) % 45);

    // Subtle deterministic offset per index
    const offsetX = ((index * 7) % 11) - 5;
    const offsetY = ((index * 13) % 9) - 4;

    const x = Math.min(Math.max(baseX + offsetX, 10), 85);
    const y = Math.min(Math.max(baseY + offsetY, 18), 75);

    const sizeRem = 3.5 + ((index % 3) * 0.5); // 3.5rem to 4.5rem
    const animDelay = (index * 0.7) % 3.5;
    const isAltAnim = index % 2 === 1;

    return { x, y, sizeRem, animDelay, isAltAnim };
  };

  return (
    <div className="fixed inset-0 z-50 w-full h-full min-h-screen overflow-hidden bg-gradient-to-b from-[#40c4ff]/40 via-[#00acc1]/60 to-[#004d40]/90 select-none flex flex-col justify-between">
      {/* Top Ambient Water Light Rays Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/40 via-cyan-100/10 to-transparent pointer-events-none"></div>

      {/* Floating Water Bubbles Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20 backdrop-blur-xs border border-white/40"
            style={{
              width: `${8 + (i % 4) * 6}px`,
              height: `${8 + (i % 4) * 6}px`,
              left: `${(i * 8.5) % 95}%`,
              bottom: '-20px',
              animation: `riseBubble ${10 + (i % 5) * 4}s ease-in-out infinite`,
              animationDelay: `${i * 1.2}s`
            }}
          />
        ))}
      </div>

      {/* Underwater Sea Bed Coral & Stones Details (Bottom) */}
      <div className="absolute bottom-0 inset-x-0 h-32 md:h-44 bg-gradient-to-t from-[#00332c] via-[#004d40]/80 to-transparent flex justify-between items-end px-4 md:px-12 pointer-events-none opacity-90">
        <img
          src="/assets/collectibles/underwater-stone.png"
          alt="Rocks"
          className="w-28 md:w-44 h-16 md:h-24 object-contain filter drop-shadow-lg"
        />
        <img
          src="/assets/collectibles/coral.png"
          alt="Coral"
          className="w-20 md:w-32 h-20 md:h-32 object-contain filter drop-shadow-lg"
        />
        <img
          src="/assets/collectibles/coral.png"
          alt="Coral"
          className="w-24 md:w-36 h-24 md:h-36 object-contain transform scale-x-[-1] filter drop-shadow-lg hidden sm:block"
        />
      </div>

      {/* Top Navigation & Status Bar Header Overlay */}
      <header className="relative z-20 w-full pt-6 md:pt-8 px-6 md:px-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/focus')}
            className="group px-4 py-2 rounded-full glass-panel-opaque border border-white/70 text-primary font-label-sm text-xs font-semibold shadow-md hover:bg-white transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
            Back to Focus
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Pearl Count Badge */}
          <div className="px-4 py-1.5 rounded-full bg-white/75 backdrop-blur-md border border-white/80 text-primary shadow-md flex items-center gap-2 font-label-sm text-xs font-semibold">
            <img src="/assets/collectibles/pearl.png" alt="Pearl" className="w-4 h-4 object-contain" />
            Focus Pearls: <span className="font-headline-md text-sm text-secondary font-bold">{pearls.length}</span>
          </div>

          {/* Golden Pearl Progression Pill */}
          <div className="px-4 py-1.5 rounded-full bg-white/75 backdrop-blur-md border border-white/80 text-primary shadow-md flex items-center gap-2 font-label-sm text-xs font-semibold" title="Accumulates at your own pace whenever you complete focus sessions. Missing a day does not reset your progress.">
            <span className="material-symbols-outlined text-amber-500 text-sm">stars</span>
            Golden Pearl Progress: <span className="font-bold text-amber-800">{streakProgress} / 7 days</span>
          </div>
        </div>
      </header>

      {/* Main Aquarium Content Viewport */}
      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center p-4">
        {pearls.length === 0 ? (
          /* EMPTY FOCUS AQUARIUM STATE */
          <div className="glass-panel-opaque p-8 md:p-12 rounded-3xl max-w-md w-full text-center flex flex-col items-center gap-5 border border-white/70 shadow-2xl animate-fade-in my-auto">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/90 to-cyan-100 pearl-glow flex items-center justify-center text-primary shadow-inner">
              <img src="/assets/collectibles/pearl.png" alt="Focus Pearl" className="w-12 h-12 object-contain opacity-70" />
            </div>

            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary text-2xl font-semibold">
                Your Focus Aquarium is waiting.
              </h2>
              <p className="font-body-md text-sm text-on-surface-variant mt-2 leading-relaxed">
                Complete a focus session to find your first pearl.
              </p>
            </div>

            <Link
              to="/focus"
              className="mt-2 px-8 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-headline-md text-sm font-semibold shadow-lg hover:scale-105 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">center_focus_strong</span>
              Start Focus
            </Link>
          </div>
        ) : (
          /* RENDERING FLOATING FOCUS PEARLS */
          <div className="relative w-full h-full max-w-6xl mx-auto">
            {pearls.map((pearl, idx) => {
              const pos = getPearlPosition(idx);

              return (
                <div
                  key={pearl.id}
                  onClick={() => setSelectedPearl({
                    id: 'pearl',
                    name: 'Focus Pearl',
                    rarity: 'common',
                    asset: '/assets/collectibles/pearl.png',
                    description: `Earned on ${pearl.earnedDate || 'Sanctuary'} through dedicated focus.`,
                    source: 'focus'
                  })}
                  className={`absolute flex flex-col items-center cursor-pointer group transition-transform ${
                    pos.isAltAnim ? 'animate-float-pearl-alt' : 'animate-float-pearl'
                  }`}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    animationDelay: `${pos.animDelay}s`
                  }}
                >
                  {/* Luminous Focus Pearl Container */}
                  <div
                    className="relative rounded-full flex items-center justify-center p-2 transition-transform duration-300 group-hover:scale-125 filter drop-shadow-[0_4px_16px_rgba(255,255,255,0.7)]"
                    style={{ width: `${pos.sizeRem}rem`, height: `${pos.sizeRem}rem` }}
                  >
                    {/* Soft Aqua Ambient Pulse Glow */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/60 via-cyan-200/30 to-purple-200/20 blur-md animate-pearl-pulse"></div>

                    {/* Actual Soft White Pearl PNG Asset */}
                    <img
                      src="/assets/collectibles/pearl.png"
                      alt="Focus Pearl"
                      className="w-full h-full object-contain relative z-10 drop-shadow-md"
                    />
                  </div>

                  {/* Tooltip on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-label-sm text-[11px] bg-white/90 text-primary px-3 py-1 rounded-full shadow-md whitespace-nowrap mt-1 border border-white/80 pointer-events-none font-semibold">
                    Focus Pearl • {pearl.earnedDate || 'Sanctuary'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Bottom Footer Info */}
      <footer className="relative z-20 pb-6 px-6 text-center">
        <p className="font-label-sm text-xs text-white/80 drop-shadow-sm">
          Focus Pearls float quietly in your haven aquarium.
        </p>
      </footer>

      <CollectibleDetailModal
        isOpen={Boolean(selectedPearl)}
        item={selectedPearl}
        onClose={() => setSelectedPearl(null)}
      />
    </div>
  );
};

export default FocusAquarium;

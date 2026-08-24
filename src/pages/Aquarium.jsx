import React, { useState } from 'react';
import { useSanctuary } from '../context/SanctuaryContext';
import { getCollectible } from '../data/collectibles';
import { AchievementModal } from '../components/AchievementModal';
import { CollectibleDetailModal } from '../components/CollectibleDetailModal';

// Explicit Z-Index Layer Structure for the Aquarium Environment
const AQUARIUM_LAYERS = {
  background: 'z-0',
  atmosphere: 'z-10',
  decorations: 'z-20',
  collectibles: 'z-40', // Explicitly higher than decorations (z-20)
  ui: 'z-50',
  modal: 'z-60'
};

// Safe Placement Grid (percentages x, y) keeping items clear of bottom decoration bounds
const SAFE_POSITIONS = [
  { x: 22, y: 35, scale: 1.1 },
  { x: 48, y: 30, scale: 1.15 },
  { x: 75, y: 38, scale: 1.1 },
  { x: 30, y: 52, scale: 1.1 },
  { x: 60, y: 48, scale: 1.15 },
  { x: 18, y: 58, scale: 1.1 },
  { x: 42, y: 60, scale: 1.2 },
  { x: 78, y: 56, scale: 1.1 },
  { x: 35, y: 25, scale: 1.05 },
  { x: 68, y: 26, scale: 1.05 }
];

export const Aquarium = () => {
  const {
    worldState,
    achievementsList,
    achievedState,
    claimAchievementReward,
    pendingUnlockedAchievement,
    setPendingUnlockedAchievement,
    isDailyRewardAvailable,
    claimDailyReward
  } = useSanctuary();

  const [activeTab, setActiveTab] = useState('aquarium'); // 'aquarium' | 'found' | 'achieved'
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [claimedRewardMessage, setClaimedRewardMessage] = useState(null);
  const [selectedCollectible, setSelectedCollectible] = useState(null);

  const ownedItems = worldState.ownedItems || [];
  const foundItems = ownedItems.filter((i) => i.source === 'found' || i.source === 'daily_reward');
  const achievedItems = ownedItems.filter((i) => i.source !== 'found' && i.source !== 'daily_reward');

  const handleClaimDaily = () => {
    const reward = claimDailyReward();
    if (reward) {
      setClaimedRewardMessage(reward);
    }
  };

  const getRarityBadgeStyle = (rarity) => {
    if (rarity === 'legendary') return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
    if (rarity === 'rare') return 'bg-purple-100 text-purple-900 border-purple-300 font-semibold';
    if (rarity === 'special') return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const filterItemMatches = (item) => {
    if (selectedFilter === 'all') return true;
    return item.category === selectedFilter;
  };

  // Safe Position calculation preventing overlap with background coral/rocks
  const getItemCoords = (rawItem, idx) => {
    let x = rawItem.x;
    let y = rawItem.y;

    // If y-position is sitting in the bottom decoration area (> 64%), relocate to safe zone
    if (x === undefined || y === undefined || y > 64) {
      const safe = SAFE_POSITIONS[idx % SAFE_POSITIONS.length];
      x = safe.x;
      y = safe.y;
    }

    return {
      x,
      y,
      scale: rawItem.scale || 1.1
    };
  };

  return (
    <div className="aquarium fixed inset-0 z-30 w-full h-full min-h-screen overflow-hidden bg-gradient-to-b from-[#80deea]/60 via-[#4dd0e1]/50 to-[#00695c]/85 select-none">
      
      {/* LAYER 1: BACKGROUND WATER LIGHT RAYS */}
      <div className={`aquarium-background absolute inset-0 ${AQUARIUM_LAYERS.background} bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/50 via-cyan-100/15 to-transparent pointer-events-none`}></div>

      {/* LAYER 2: ATMOSPHERE & RISING BUBBLES */}
      <div className={`aquarium-atmosphere absolute inset-0 ${AQUARIUM_LAYERS.atmosphere} pointer-events-none overflow-hidden`}>
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/25 backdrop-blur-xs border border-white/40"
            style={{
              width: `${6 + (i % 5) * 6}px`,
              height: `${6 + (i % 5) * 6}px`,
              left: `${(i * 7.5) % 95}%`,
              bottom: '-20px',
              animation: `riseBubble ${9 + (i % 6) * 4}s ease-in-out infinite`,
              animationDelay: `${i * 0.9}s`
            }}
          />
        ))}
      </div>

      {/* LAYER 3: ENVIRONMENTAL DECORATIONS (CORAL / ROCKS / KELP) */}
      <div className={`aquarium-decorations absolute bottom-0 inset-x-0 h-32 md:h-48 ${AQUARIUM_LAYERS.decorations} bg-gradient-to-t from-[#003830] via-[#004d40]/80 to-transparent flex justify-between items-end px-6 md:px-16 pointer-events-none opacity-90`}>
        <img
          src="/assets/collectibles/underwater-stone.png"
          alt="Rocks"
          className="w-32 md:w-52 h-16 md:h-28 object-contain filter drop-shadow-lg"
        />
        <img
          src="/assets/collectibles/coral.png"
          alt="Coral"
          className="w-24 md:w-40 h-24 md:h-40 object-contain filter drop-shadow-lg"
        />
        <img
          src="/assets/collectibles/coral.png"
          alt="Coral"
          className="w-28 md:w-44 h-28 md:h-44 object-contain transform scale-x-[-1] filter drop-shadow-lg hidden sm:block"
        />
      </div>

      {/* LAYER 4: COLLECTIBLES LAYER (EXPLICITLY ABOVE DECORATIONS) */}
      <div className={`aquarium-collectibles absolute inset-0 ${AQUARIUM_LAYERS.collectibles} pointer-events-auto overflow-visible`}>
        {ownedItems.map((rawItem, idx) => {
          const item = getCollectible(rawItem);
          const coords = getItemCoords(rawItem, idx);
          const isMoving = item.category === 'common-fish' || item.category === 'rare-creatures';

          return (
            <div
              key={rawItem.id || idx}
              onClick={() => setSelectedCollectible({ ...item, source: rawItem.source })}
              className={`absolute flex flex-col items-center group cursor-pointer transition-transform hover:scale-125 ${
                isMoving ? 'animate-float-slow' : 'animate-float-slight'
              }`}
              style={{
                left: `${coords.x}%`,
                top: `${coords.y}%`,
                transform: `scale(${coords.scale})`,
                zIndex: 40
              }}
              title={`${item.name} (${item.rarity})`}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 p-1 flex items-center justify-center filter drop-shadow-xl">
                <img
                  src={item.asset || item.image}
                  alt={item.name}
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity font-label-sm text-[11px] bg-white/95 text-primary px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap mt-1 font-semibold border border-white/80">
                {item.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* LAYER 5: UI & NAVIGATION HEADER */}
      <header className={`aquarium-ui relative ${AQUARIUM_LAYERS.ui} pt-20 md:pt-24 px-6 md:px-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pointer-events-auto`}>
        <div>
          <span className="font-label-sm text-xs text-primary font-semibold uppercase tracking-widest bg-white/60 px-3 py-1 rounded-full border border-white/70 shadow-xs">
            SANCTUARY ECOSYSTEM
          </span>
          <h1 className="font-headline-lg text-headline-lg text-primary text-2xl md:text-3xl mt-1 drop-shadow-xs">
            Your Little World
          </h1>
        </div>

        {/* Action Buttons to open collection overlays */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('found')}
            className={`py-2 px-4 rounded-full font-label-sm text-xs font-semibold shadow-md transition-all border ${
              activeTab === 'found'
                ? 'bg-primary text-white border-primary'
                : 'bg-white/75 backdrop-blur-md text-primary border-white/80 hover:bg-white'
            }`}
          >
            Found Things ({foundItems.length})
          </button>
          <button
            onClick={() => setActiveTab('achieved')}
            className={`py-2 px-4 rounded-full font-label-sm text-xs font-semibold shadow-md transition-all border ${
              activeTab === 'achieved'
                ? 'bg-primary text-white border-primary'
                : 'bg-white/75 backdrop-blur-md text-primary border-white/80 hover:bg-white'
            }`}
          >
            Achieved Things ({achievedItems.length})
          </button>
        </div>
      </header>

      {/* LAYER 6: OVERLAY MODAL VIEW 1: FOUND THINGS */}
      {activeTab === 'found' && (
        <div className={`aquarium-modal fixed inset-0 ${AQUARIUM_LAYERS.modal} flex items-center justify-center p-4 md:p-8 bg-slate-950/40 backdrop-blur-md animate-fade-in pointer-events-auto overflow-y-auto`}>
          <div className="w-full max-w-4xl glass-panel-opaque rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col gap-6 border border-white/70 max-h-[85vh] overflow-y-auto my-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/40 pb-4">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary text-2xl font-bold">Found Things</h2>
                <p className="font-body-md text-sm text-on-surface-variant mt-0.5">
                  Collectibles discovered naturally while spending time in Pearl Club.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('aquarium')}
                className="py-2 px-5 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow hover:bg-primary/90 transition-all flex items-center gap-1.5 shrink-0"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Back to Your Little World
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {['all', 'common-fish', 'rare-creatures', 'collectible-objects', 'decorations', 'special'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilter(cat)}
                  className={`py-1 px-3 rounded-full font-label-sm text-[11px] font-semibold transition-all border ${
                    selectedFilter === cat
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white/50 text-on-surface-variant border-white/60 hover:bg-white/80'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat.replace('-', ' ')}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              {foundItems.filter((raw) => filterItemMatches(getCollectible(raw))).map((rawItem) => {
                const item = getCollectible(rawItem);

                return (
                  <div
                    key={rawItem.id}
                    onClick={() => setSelectedCollectible({ ...item, source: rawItem.source })}
                    className="p-4 rounded-2xl bg-white/60 border border-white/70 flex items-center gap-4 shadow-sm relative cursor-pointer hover:bg-white/80 transition-all hover:scale-[1.02]"
                  >
                    <div className="w-16 h-16 p-1 shrink-0">
                      <img src={item.asset || item.image} alt={item.name} className="w-full h-full object-contain drop-shadow-sm" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-headline-md text-headline-md text-base font-semibold">{item.name}</h3>
                        <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full border ${getRarityBadgeStyle(item.rarity)}`}>
                          {item.rarity}
                        </span>
                      </div>
                      <p className="font-label-sm text-xs text-outline leading-tight mt-1">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* LAYER 6: OVERLAY MODAL VIEW 2: ACHIEVED THINGS & DAILY REWARD */}
      {activeTab === 'achieved' && (
        <div className={`aquarium-modal fixed inset-0 ${AQUARIUM_LAYERS.modal} flex items-center justify-center p-4 md:p-8 bg-slate-950/40 backdrop-blur-md animate-fade-in pointer-events-auto overflow-y-auto`}>
          <div className="w-full max-w-4xl glass-panel-opaque rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col gap-6 border border-white/70 max-h-[85vh] overflow-y-auto my-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/40 pb-4">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary text-2xl font-bold">Achieved Things</h2>
                <p className="font-body-md text-sm text-on-surface-variant mt-0.5">
                  Milestones, daily rewards, and Focus rewards earned in sanctuary.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('aquarium')}
                className="py-2 px-5 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow hover:bg-primary/90 transition-all flex items-center gap-1.5 shrink-0"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Back to Your Little World
              </button>
            </div>

            {/* Daily Reward Section */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-primary-container/70 to-secondary-container/70 border border-white/70 shadow-md flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <span className="font-label-sm text-xs text-primary uppercase font-bold tracking-widest">
                  DAILY WELCOME GIFT
                </span>
                <h3 className="font-headline-md text-headline-md text-primary text-xl">Your Daily Pearl</h3>
                <p className="font-body-md text-xs text-on-surface-variant mt-1">
                  {isDailyRewardAvailable
                    ? 'A daily reward is waiting for your return today.'
                    : 'You have claimed your daily reward today. Return tomorrow for another gift!'}
                </p>
              </div>

              {isDailyRewardAvailable ? (
                <button
                  onClick={handleClaimDaily}
                  className="py-3 px-6 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow hover:scale-105 transition-transform shrink-0"
                >
                  Claim Daily Gift
                </button>
              ) : (
                <span className="py-2 px-4 rounded-full bg-white/60 text-outline font-label-sm text-xs font-semibold shrink-0">
                  Claimed Today
                </span>
              )}
            </div>

            {/* Focus Rewards & Rare Unlocks Section */}
            {achievedItems.filter((i) => i.source === 'focus_rare' || i.source === 'focus_reward').length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="font-headline-md text-headline-md text-amber-900 text-lg font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-500">stars</span>
                  Earned Through Focus
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {achievedItems.filter((i) => i.source === 'focus_rare' || i.source === 'focus_reward').map((rawItem) => {
                    const item = getCollectible(rawItem);
                    return (
                      <div key={rawItem.id} className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center gap-4 shadow-sm">
                        <div className="w-14 h-14 p-1 shrink-0">
                          <img src={item.asset || item.image} alt={item.name} className="w-full h-full object-contain drop-shadow-sm" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-headline-md text-headline-md text-base font-bold text-amber-950">{item.name}</h4>
                            <span className="text-[9px] uppercase px-2 py-0.5 rounded-full border bg-amber-100 text-amber-800 border-amber-300 font-bold">
                              Focus Rare
                            </span>
                          </div>
                          <p className="font-label-sm text-[11px] text-amber-800 leading-tight mt-1">
                            Earned through Focus progression
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Milestones & Achievements Grid */}
            <h2 className="font-headline-md text-headline-md text-primary text-xl">Milestones & Achievements</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievementsList.map((ach) => {
                const isUnlocked = achievedState.unlockedIds.includes(ach.id);
                const isClaimed = achievedState.claimedIds.includes(ach.id);
                const item = getCollectible(ach.collectible);

                return (
                  <div
                    key={ach.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      isUnlocked
                        ? 'bg-white/70 border-white/80 shadow-sm'
                        : 'bg-white/30 border-white/40 opacity-70'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 p-1 shrink-0">
                        <img src={item.asset || item.image} alt={item.name} className={`w-full h-full object-contain drop-shadow-sm ${!isUnlocked && 'grayscale opacity-50'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-headline-md text-headline-md text-base font-semibold">{ach.title}</h4>
                          <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full border ${getRarityBadgeStyle(item.rarity)}`}>
                            {item.rarity}
                          </span>
                        </div>
                        <p className="font-label-sm text-xs text-on-surface-variant mt-1">{ach.description}</p>
                      </div>
                    </div>

                    <div className="flex justify-end items-center border-t border-white/30 pt-2">
                      {isClaimed ? (
                        <span className="font-label-sm text-xs text-primary font-semibold">Unlocked & Claimed</span>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => claimAchievementReward(ach.id)}
                          className="py-1.5 px-4 rounded-full bg-secondary text-white font-label-sm text-xs font-semibold shadow hover:scale-105"
                        >
                          Claim Reward
                        </button>
                      ) : (
                        <span className="font-label-sm text-xs text-outline font-semibold">Locked</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Claimed Daily Gift Popup Modal */}
      {claimedRewardMessage && (
        <div className={`aquarium-modal fixed inset-0 ${AQUARIUM_LAYERS.modal} flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in pointer-events-auto`}>
          <div className="w-full max-w-sm glass-panel-opaque rounded-3xl p-6 text-center flex flex-col items-center gap-4 border border-white/70 shadow-2xl">
            <div className="w-20 h-20 p-2 rounded-full bg-gradient-to-br from-primary-container to-secondary-container pearl-glow flex items-center justify-center shadow">
              <img src={claimedRewardMessage.asset || claimedRewardMessage.image} alt="Reward" className="w-full h-full object-contain" />
            </div>
            <h3 className="font-headline-md text-headline-md text-primary text-xl">Daily Gift Claimed!</h3>
            <p className="font-body-md text-sm text-on-surface">
              You received <span className="font-semibold text-primary">{claimedRewardMessage.name}</span> ({claimedRewardMessage.rarity}). It has been added to your sanctuary!
            </p>
            <button
              onClick={() => setClaimedRewardMessage(null)}
              className="py-2.5 px-6 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow"
            >
              Add to Your Little World
            </button>
          </div>
        </div>
      )}

      <AchievementModal
        achievement={pendingUnlockedAchievement}
        onClose={() => setPendingUnlockedAchievement(null)}
      />

      <CollectibleDetailModal
        isOpen={Boolean(selectedCollectible)}
        item={selectedCollectible}
        onClose={() => setSelectedCollectible(null)}
      />
    </div>
  );
};

export default Aquarium;

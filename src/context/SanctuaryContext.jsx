import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../lib/storage/storage';
import { ambientPlayer } from '../lib/audio/ambientPlayer';
import { environmentAudioPlayer } from '../lib/audio/environmentAudioPlayer';
import { supabase } from '../lib/supabase/client';
import { trackSiteVisit } from '../lib/analytics/telemetry';
import { CURATED_AUDIO_REGISTRY } from '../data/curatedAudio';
import { getCollectible, COLLECTIBLE_REGISTRY } from '../data/collectibles';
import { getEnvironment } from '../data/environments';

const SanctuaryContext = createContext(null);

const DEFAULT_ACHIEVEMENTS = [
  {
    id: 'first_reflection',
    title: 'First Reflection',
    description: 'Write your first journal reflection.',
    category: 'journal_total',
    requirement: 1,
    collectible: { id: 'sea-glass', name: 'Sea Glass', source: 'achievement' }
  },
  {
    id: 'finding_your_words',
    title: 'Finding Your Words',
    description: 'Create 5 journal reflections.',
    category: 'journal_total',
    requirement: 5,
    collectible: { id: 'pearl-shell', name: 'Pearl Shell', source: 'achievement' }
  },
  {
    id: 'first_focus',
    title: 'First Focus',
    description: 'Complete your first focus session.',
    category: 'focus_first',
    requirement: 1,
    collectible: { id: 'clownfish', name: 'Clownfish', source: 'achievement' }
  },
  {
    id: '25m_yourself',
    title: '25 Minutes for Yourself',
    description: 'Complete a 25-minute focus session.',
    category: 'focus_25m',
    requirement: 1,
    collectible: { id: 'bluetang', name: 'Blue Tang', source: 'achievement' }
  },
  {
    id: 'focused_explorer',
    title: 'Focus Explorer',
    description: 'Complete 5 focus sessions.',
    category: 'focus_days',
    requirement: 5,
    collectible: { id: 'jellyfish', name: 'Luminous Jellyfish', source: 'achievement' }
  },
  {
    id: 'puzzle_explorer',
    title: 'Mindful Puzzles',
    description: 'Play Sudoku in your sanctuary.',
    category: 'sudoku_days',
    requirement: 1,
    collectible: { id: 'tiny-starfish', name: 'Tiny Starfish', source: 'achievement' }
  },
  {
    id: 'pearl_catcher',
    title: 'Pearl Catcher',
    description: 'Play Pearl Catch.',
    category: 'pearlCatch_days',
    requirement: 1,
    collectible: { id: 'coral', name: 'Azure Coral', source: 'achievement' }
  },
  {
    id: 'quick_thinker',
    title: 'Quick Thinker',
    description: 'Play Quick Math.',
    category: 'quickMath_days',
    requirement: 1,
    collectible: { id: 'seahorse', name: 'Golden Seahorse', source: 'achievement' }
  },
  {
    id: 'fifteen_days_sanctuary',
    title: 'Sanctuary Companion',
    description: 'Visit Pearl Club on 15 distinct days at your own pace.',
    category: 'visited_days',
    requirement: 15,
    collectible: { id: 'glow-pearl', name: 'Luminous Pearl of 15 Days', source: 'achievement' }
  }
];

const COMMON_REWARD_POOL = ['clownfish', 'guppy', 'bluetang', 'yellowtang', 'pearl-shell', 'pearl', 'starfish', 'tiny-starfish', 'sea-glass', 'coral', 'rocks'];
const RARE_REWARD_POOL = ['seahorse', 'jellyfish', 'turtle', 'angelfish', 'rare-shell', 'puzzle-pearl'];

const DEFAULT_FOCUS_CATEGORIES = ['Work', 'Study', 'Reading', 'Rest', 'Cleaning', 'Personal'];

const getAutoPlacementCoords = (index) => {
  const positions = [
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
  return positions[index % positions.length];
};

export const SanctuaryProvider = ({ children }) => {
  const todayKey = new Date().toISOString().split('T')[0];

  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let isSubscribed = true;

    // Safety timer to guarantee authLoading resolves within 3 seconds under all network conditions
    const safetyTimer = setTimeout(() => {
      if (isSubscribed) {
        setAuthLoading(false);
      }
    }, 3000);

    if (supabase) {
      supabase.auth
        .getSession()
        .then(({ data: { session } }) => {
          if (isSubscribed) {
            console.log('[SUPABASE AUTH SESSION DEBUG] INITIAL SESSION EXISTS:', Boolean(session));
            console.log('[SUPABASE AUTH SESSION DEBUG] USER ID:', session?.user?.id ?? 'NONE');
            setCurrentUser(session?.user ?? null);
            setAuthLoading(false);
          }
        })
        .catch((err) => {
          console.warn('[Supabase Auth] getSession error:', err);
          if (isSubscribed) setAuthLoading(false);
        });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (isSubscribed) {
          console.log('[SUPABASE AUTH SESSION DEBUG] EVENT:', event);
          console.log('[SUPABASE AUTH SESSION DEBUG] SESSION EXISTS:', Boolean(session));
          console.log('[SUPABASE AUTH SESSION DEBUG] USER ID:', session?.user?.id ?? 'NONE');
          setCurrentUser(session?.user ?? null);
          setAuthLoading(false);
        }
      });

      return () => {
        isSubscribed = false;
        clearTimeout(safetyTimer);
        subscription.unsubscribe();
      };
    } else {
      setAuthLoading(false);
    }
  }, []);

  const signOutUser = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
  };

  // Visited Calendar Days Tracking (Long-Continuity 15-Day Milestone)
  const [visitedDays, setVisitedDays] = useState(() => {
    const raw = storage.get('visited_days', [todayKey]);
    return raw.includes(todayKey) ? raw : [...raw, todayKey];
  });

  useEffect(() => {
    storage.save('visited_days', visitedDays);
    trackSiteVisit();
  }, [visitedDays]);

  const [focusCategories, setFocusCategories] = useState(() => {
    return storage.get('focus_categories', DEFAULT_FOCUS_CATEGORIES);
  });

  const [activityEvents, setActivityEvents] = useState(() => {
    return storage.get('activity_events', []);
  });

  const [tasks, setTasks] = useState(() => {
    return storage.get('tasks', [
      { id: '1', text: 'Breathe slowly for 5 minutes', completed: false, createdAt: new Date().toISOString(), completedAt: null },
      { id: '2', text: 'Reflect on one positive thought', completed: false, createdAt: new Date().toISOString(), completedAt: null }
    ]);
  });

  const [journalEntries, setJournalEntries] = useState(() => {
    return storage.get('journal_entries', {
      [todayKey]: {
        id: todayKey,
        date: todayKey,
        text: '',
        drawingDataUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  });

  const [focusHistory, setFocusHistory] = useState(() => {
    return storage.get('focus_history', []);
  });

  const [focusState, setFocusState] = useState(() => {
    return storage.get('focus_state', {
      pearls: [],
      sessions: [],
      qualifyingDates: [],
      streakProgress: 0,
      rareRewards: []
    });
  });

  const [activityHistory, setActivityHistory] = useState(() => {
    return storage.get('activity_history', {
      journal: [todayKey],
      focus: [],
      sudoku: [],
      pearlCatch: [],
      quickMath: []
    });
  });

  const [dailyRewardState, setDailyRewardState] = useState({
    lastClaimedDate: null,
    totalClaims: 0
  });

  const [worldState, setWorldState] = useState({
    hasGoldenPearl: false,
    goldenPearlFoundAt: null,
    ownedItems: []
  });

  const [achievedState, setAchievedState] = useState({
    unlockedIds: [],
    claimedIds: []
  });

  const [returnDays, setReturnDays] = useState([]);
  const [returnRewards, setReturnRewards] = useState({ day3: false, day5: false, day7: false });
  const [rewardFlags, setRewardFlags] = useState({ earlyMemberClaimed: false, goldenPearlClaimed: false, goldenPearlRevealPending: false });
  const [pendingSurpriseReward, setPendingSurpriseReward] = useState(null);

  // User Isolation Loader: Runs whenever currentUser session changes
  useEffect(() => {
    const userId = currentUser?.id;
    if (userId) {
      // Load user-specific private local data
      const savedWorld = storage.get('world_state', { hasGoldenPearl: false, goldenPearlFoundAt: null, ownedItems: [] }, userId);
      const savedAchieved = storage.get('achieved_state', { unlockedIds: [], claimedIds: [] }, userId);
      const savedFocusState = storage.get('focus_state', { pearls: [], sessions: [], qualifyingDates: [], streakProgress: 0, rareRewards: [] }, userId);
      const savedFocusHistory = storage.get('focus_history', [], userId);
      const savedJournal = storage.get('journal_entries', {}, userId);
      const savedTasks = storage.get('tasks', [], userId);
      const savedDaily = storage.get('daily_reward_state', { lastClaimedDate: null, totalClaims: 0, history: [] }, userId);
      const savedReturnDays = storage.get('return_days', [], userId);
      const savedReturnRewards = storage.get('return_rewards', { day3: false, day5: false, day7: false }, userId);
      const savedRewardFlags = storage.get('user_reward_flags', { earlyMemberClaimed: false, goldenPearlClaimed: false, goldenPearlRevealPending: false }, userId);
      const savedVisitedDays = storage.get('visited_days', [todayKey], userId);
      const savedFocusCategories = storage.get('focus_categories', DEFAULT_FOCUS_CATEGORIES, userId);
      const savedActivityEvents = storage.get('activity_events', [], userId);
      const savedActivityHistory = storage.get('activity_history', { journal: [todayKey], focus: [], sudoku: [], pearlCatch: [], quickMath: [] }, userId);

      const savedFontSize = storage.get('fontSizePreference', 'default', userId);
      const savedReducedMotion = storage.get('reducedMotion', false, userId);
      const savedAppearance = storage.get('appearance', 'light', userId);

      setWorldState(savedWorld);
      setAchievedState(savedAchieved);
      setFocusState(savedFocusState);
      setFocusHistory(savedFocusHistory);
      setJournalEntries(savedJournal);
      setTasks(savedTasks);
      setDailyRewardState(savedDaily);
      setReturnDays(savedReturnDays);
      setReturnRewards(savedReturnRewards);
      setRewardFlags(savedRewardFlags);
      setVisitedDays(savedVisitedDays.includes(todayKey) ? savedVisitedDays : [...savedVisitedDays, todayKey]);
      setFocusCategories(savedFocusCategories);
      setActivityEvents(savedActivityEvents);
      setActivityHistory(savedActivityHistory);
      setSettings((prev) => ({
        ...prev,
        appearance: savedAppearance,
        fontSize: savedFontSize,
        reducedMotion: savedReducedMotion
      }));
    } else {
      // Unauthenticated / Logout: Reset to clean empty initial defaults
      setWorldState({ hasGoldenPearl: false, goldenPearlFoundAt: null, ownedItems: [] });
      setAchievedState({ unlockedIds: [], claimedIds: [] });
      setFocusState({ pearls: [], sessions: [], qualifyingDates: [], streakProgress: 0, rareRewards: [] });
      setFocusHistory([]);
      setJournalEntries({});
      setTasks([]);
      setDailyRewardState({ lastClaimedDate: null, totalClaims: 0, history: [] });
      setReturnDays([]);
      setReturnRewards({ day3: false, day5: false, day7: false });
      setRewardFlags({ earlyMemberClaimed: false, goldenPearlClaimed: false, goldenPearlRevealPending: false });
      setVisitedDays([todayKey]);
      setFocusCategories(DEFAULT_FOCUS_CATEGORIES);
      setActivityEvents([]);
      setActivityHistory({ journal: [todayKey], focus: [], sudoku: [], pearlCatch: [], quickMath: [] });
    }
  }, [currentUser?.id]);

  // Visited Calendar Days Tracking (Silent tracking, no streak pressure or popups)
  useEffect(() => {
    const userId = currentUser?.id;
    if (!userId) return;

    const savedDays = storage.get('return_days', [], userId);
    let updatedDays = savedDays;
    if (!savedDays.includes(todayKey)) {
      updatedDays = [...savedDays, todayKey];
      storage.save('return_days', updatedDays, userId);
    }
    setReturnDays(updatedDays);
  }, [currentUser?.id, todayKey]);

  // NATURAL DISCOVERY ENGINE (Relaxed, low-pressure, cooldown-based common discoveries)
  const [lastNaturalDiscoveryTime, setLastNaturalDiscoveryTime] = useState(0);

  const triggerNaturalDiscovery = (sourceContext = 'explore') => {
    const userId = currentUser?.id;
    if (!userId) return null;

    const now = Date.now();
    // Cooldown check: minimum 3 minutes between natural discoveries
    if (now - lastNaturalDiscoveryTime < 3 * 60 * 1000) {
      return null;
    }

    // 45% probability roll
    if (Math.random() > 0.45) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * COMMON_REWARD_POOL.length);
    const catId = COMMON_REWARD_POOL[randomIndex];
    const reg = getCollectible(catId);

    addCollectibleToUser(catId, 'natural-discovery');
    setLastNaturalDiscoveryTime(now);

    const softTitles = [
      "A little something washed ashore.",
      "You found something.",
      "There was something waiting for you.",
      "A tiny discovery drifted in."
    ];
    const chosenTitle = softTitles[Math.floor(Math.random() * softTitles.length)];

    const discoveryObj = {
      collectibleId: catId,
      title: chosenTitle,
      subtitle: `A ${reg?.name || 'common discovery'} has entered your sanctuary.`
    };

    setPendingSurpriseReward(discoveryObj);
    return discoveryObj;
  };

  // GAME RARE REWARD DISPATCHER (Optional rewards for intentional game engagement)
  const grantGameReward = (gameType = 'game') => {
    const userId = currentUser?.id;
    if (!userId) return null;

    if (Math.random() < 0.65) {
      const randomIndex = Math.floor(Math.random() * RARE_REWARD_POOL.length);
      const catId = RARE_REWARD_POOL[randomIndex];
      const reg = getCollectible(catId);

      addCollectibleToUser(catId, 'game');
      logActivityEvent('reward', { source: 'game', rewardName: reg?.name || catId });

      const discoveryObj = {
        collectibleId: catId,
        title: "A rare discovery appeared!",
        subtitle: `You found a ${reg?.name || 'rare sea companion'} while playing ${gameType}.`
      };

      setPendingSurpriseReward(discoveryObj);
      return reg;
    }
    return null;
  };

  // Central User-Owned Collectible Reward Dispatcher
  const addCollectibleToUser = (collectibleId, source = 'earned') => {
    const userId = currentUser?.id;
    if (!userId) return;

    setWorldState((prev) => {
      const existing = prev.ownedItems || [];
      const isAlreadyOwned = existing.some((item) => item.id === collectibleId);
      if (isAlreadyOwned && source !== 'focus-pearl' && source !== 'daily_reward' && source !== 'return_milestone') {
        return prev;
      }

      const placementIndex = existing.length;
      const newPlacement = {
        id: collectibleId,
        source: source,
        addedAt: new Date().toISOString(),
        ...getAutoPlacementCoords(placementIndex)
      };

      const updatedOwned = [...existing, newPlacement];
      const updatedState = {
        ...prev,
        ownedItems: updatedOwned,
        hasGoldenPearl: prev.hasGoldenPearl || collectibleId === 'golden-pearl'
      };

      storage.save('world_state', updatedState, userId);
      return updatedState;
    });

    setAchievedState((prev) => {
      const unlocked = prev.unlockedIds || [];
      if (!unlocked.includes(collectibleId)) {
        const updated = {
          ...prev,
          unlockedIds: [...unlocked, collectibleId]
        };
        storage.save('achieved_state', updated, userId);
        return updated;
      }
      return prev;
    });
  };

  const [pendingUnlockedAchievement, setPendingUnlockedAchievement] = useState(null);

  const [soundState, setSoundState] = useState(() => {
    return storage.get('sound_state', {
      waves: { playing: false, volume: 0.7 },
      rain: { playing: false, volume: 0.3 },
      wind: { playing: false, volume: 0.2 },
      underwater: { playing: false, volume: 0.8 },
      activePreset: null,
      isPlayingAll: false,
      isMuted: false
    });
  });

  const [curatedAudioState, setCuratedAudioState] = useState({
    activeCategoryId: 'ocean',
    isPlaying: false
  });

  const [activePanel, setActivePanel] = useState(null);

  const togglePanel = (panelName) => {
    setActivePanel((prev) => (prev === panelName ? null : panelName));
  };

  const [settings, setSettings] = useState(() => {
    const defaultAppearance = (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    const savedEnv = storage.get('pearlClubEnvironment', null);
    const initialSettings = storage.get('settings', {
      appearance: defaultAppearance,
      fontSize: 'default',
      reducedMotion: false,
      theme: 'Ocean',
      autoSave: true
    });
    if (savedEnv) {
      initialSettings.theme = savedEnv;
    }
    return initialSettings;
  });

  // Global Environment Audio Settings State (Decoupled from Music page)
  const [environmentAudioEnabled, setEnvironmentAudioEnabledState] = useState(() => {
    return storage.get('environment_audio_enabled', true, currentUser?.id);
  });

  const [environmentAudioVolume, setEnvironmentAudioVolumeState] = useState(() => {
    return storage.get('environment_audio_volume', 0.12, currentUser?.id);
  });

  const setEnvironmentAudioEnabled = (enabled) => {
    setEnvironmentAudioEnabledState(enabled);
    environmentAudioPlayer.setAudioEnabled(enabled);
    storage.save('environment_audio_enabled', enabled, currentUser?.id);
  };

  const setEnvironmentAudioVolume = (vol) => {
    setEnvironmentAudioVolumeState(vol);
    environmentAudioPlayer.setVolume(vol);
    storage.save('environment_audio_volume', vol, currentUser?.id);
  };

  // Sync Environment Audio with active Theme & User Interactions
  useEffect(() => {
    environmentAudioPlayer.setAudioEnabled(environmentAudioEnabled);
    environmentAudioPlayer.setVolume(environmentAudioVolume);
    environmentAudioPlayer.setTheme(settings.theme || 'Ocean');

    const handleFirstUserInteraction = () => {
      if (environmentAudioEnabled) {
        environmentAudioPlayer.start(settings.theme || 'Ocean');
      }
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
    };

    window.addEventListener('click', handleFirstUserInteraction, { once: true });
    window.addEventListener('keydown', handleFirstUserInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstUserInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
    };
  }, [settings.theme, environmentAudioEnabled, environmentAudioVolume, currentUser?.id]);

  const [bottleSafety, setBottleSafety] = useState(() => {
    return storage.get('bottle_safety', {
      dailyCount: { date: todayKey, count: 0 },
      blockedSenders: [],
      reportedBottleIds: []
    });
  });

  const [profile, setProfile] = useState(() => {
    return storage.get('profile', {
      name: '',
      username: '',
      bio: 'Finding a little quiet space.',
      avatar: 'pearl',
      favoriteEnvironment: 'Cyan Lagoon',
      createdAt: '2026-08',
      role: 'user'
    });
  });

  const [pearlNumber, setPearlNumber] = useState(null);

  const effectivePearlNumber = profile?.pearl_number ?? pearlNumber ?? null;
  const isEarlyMember = Boolean(currentUser && effectivePearlNumber !== null && effectivePearlNumber > 0 && effectivePearlNumber <= 100);
  const formattedPearlNumber = effectivePearlNumber != null ? `Pearl #${String(effectivePearlNumber).padStart(3, '0')}` : 'Pearl number unavailable';
  const [showEarlyMemberWelcomeModal, setShowEarlyMemberWelcomeModal] = useState(false);

  // Clear any legacy stale pearl_club_pearl_number from local storage on mount
  useEffect(() => {
    try {
      localStorage.removeItem('pearl_club_pearl_number');
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (supabase && currentUser) {
      supabase
        .from('profiles')
        .select('id, name, username, bio, avatar_url, pearl_number, role, is_admin, created_at')
        .eq('id', currentUser.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (data) {
            const activePearlNumber = data.pearl_number;
            if (activePearlNumber != null) {
              setPearlNumber(activePearlNumber);
            }

            // Derive a clean fallback username if DB contains legacy member_... string
            const meta = currentUser.user_metadata || {};
            const cleanFallbackName = data.name || meta.full_name || meta.name || (currentUser.email ? currentUser.email.split('@')[0] : 'Pearl Member');
            let resolvedUsername = data.username;
            if (!resolvedUsername || resolvedUsername.startsWith('member_')) {
              const rawSlug = meta.preferred_username || meta.username || meta.full_name || meta.name || (currentUser.email ? currentUser.email.split('@')[0] : '');
              if (rawSlug) {
                const cleanSlug = rawSlug.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
                if (cleanSlug && cleanSlug.length >= 2) {
                  resolvedUsername = cleanSlug;
                  // Asynchronously update legacy member_... username in DB
                  supabase.from('profiles').update({ username: cleanSlug, name: cleanFallbackName }).eq('id', currentUser.id).then(() => {}).catch(() => {});
                }
              }
            }

            setProfile((prev) => ({
              ...prev,
              pearl_number: activePearlNumber != null ? activePearlNumber : prev.pearl_number,
              name: cleanFallbackName,
              username: resolvedUsername || prev.username,
              bio: data.bio || prev.bio,
              avatar: data.avatar_url || prev.avatar,
              role: data.role || (data.is_admin ? 'admin' : 'user'),
              is_admin: Boolean(data.role === 'admin' || data.is_admin),
              createdAt: data.created_at || prev.createdAt
            }));
          } else {
            // Auto-create missing profile row for authenticated user (e.g. Google OAuth or new sign-up)
            const meta = currentUser.user_metadata || {};
            const defaultName = meta.full_name || meta.name || meta.given_name || (currentUser.email ? currentUser.email.split('@')[0] : 'Pearl Member');
            
            const rawSlug = meta.preferred_username || meta.username || meta.full_name || meta.name || (currentUser.email ? currentUser.email.split('@')[0] : 'pearl_member');
            const cleanSlug = rawSlug.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '') || `pearl_${currentUser.id.slice(0, 6)}`;
            const defaultUsername = cleanSlug;
            const defaultAvatar = meta.avatar_url || meta.picture || 'pearl';

            supabase
              .from('profiles')
              .upsert(
                [
                  {
                    id: currentUser.id,
                    name: defaultName,
                    username: defaultUsername,
                    bio: 'Finding a little quiet space.',
                    avatar_url: defaultAvatar,
                    created_at: new Date().toISOString()
                  }
                ],
                { onConflict: 'id', ignoreDuplicates: true }
              )
              .select('id, name, username, bio, avatar_url, pearl_number, role, is_admin')
              .maybeSingle()
              .then(({ data: createdData }) => {
                if (createdData) {
                  if (createdData.pearl_number != null) {
                    setPearlNumber(createdData.pearl_number);
                  }
                  setProfile((prev) => ({
                    ...prev,
                    pearl_number: createdData.pearl_number ?? prev.pearl_number,
                    name: createdData.name || defaultName,
                    username: createdData.username || defaultUsername,
                    bio: createdData.bio || prev.bio,
                    avatar: createdData.avatar_url || defaultAvatar,
                    role: createdData.role || 'user',
                    is_admin: Boolean(createdData.role === 'admin' || createdData.is_admin)
                  }));
                }
              })
              .catch(() => {});
          }
        })
        .catch((err) => {
          console.warn('[Supabase Profile] Fetch catch:', err);
        });
    } else if (!currentUser) {
      // Unauthenticated visitor has no Pearl number
      setPearlNumber(null);
    }
  }, [currentUser]);

  useEffect(() => {
    const userId = currentUser?.id;
    if (userId && isEarlyMember) {
      const savedFlags = storage.get('user_reward_flags', { earlyMemberClaimed: false, goldenPearlClaimed: false, goldenPearlRevealPending: false }, userId);
      if (!savedFlags.earlyMemberClaimed) {
        setWorldState((prev) => {
          const exists = (prev.ownedItems || []).some((item) => item.id === 'pearl-club-early-member');
          if (exists) return prev;
          const updatedWorld = {
            ...prev,
            ownedItems: [
              ...(prev.ownedItems || []),
              { id: 'pearl-club-early-member', source: 'founders', x: 52, y: 48, scale: 1.1 }
            ]
          };
          storage.save('world_state', updatedWorld, userId);
          return updatedWorld;
        });
        setShowEarlyMemberWelcomeModal(true);
      }
    }
  }, [currentUser?.id, isEarlyMember]);

  const claimEarlyMemberModal = () => {
    const userId = currentUser?.id;
    if (userId) {
      const savedFlags = storage.get('user_reward_flags', { earlyMemberClaimed: false, goldenPearlClaimed: false, goldenPearlRevealPending: false }, userId);
      const updatedFlags = { ...savedFlags, earlyMemberClaimed: true };
      storage.save('user_reward_flags', updatedFlags, userId);
      setRewardFlags(updatedFlags);
    }
    setShowEarlyMemberWelcomeModal(false);
  };

  const logAnalyticsEvent = async (eventName) => {
    if (supabase) {
      try {
        await supabase.from('analytics_events').insert({
          event_name: eventName,
          user_id: currentUser?.id || null
        });
      } catch (err) {}
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const mode = settings.appearance === 'dark' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-appearance', mode);
      if (mode === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
      if (currentUser?.id) {
        storage.save('appearance', mode, currentUser.id);
      }
    }
  }, [settings.appearance, currentUser?.id]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const fs = settings.fontSize || 'default';
      document.documentElement.setAttribute('data-font-size', fs);
      if (currentUser?.id) {
        storage.save('fontSizePreference', fs, currentUser.id);
      }
    }
  }, [settings.fontSize, currentUser?.id]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const isReduced = Boolean(settings.reducedMotion);
      if (isReduced) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
      if (currentUser?.id) {
        storage.save('reducedMotion', isReduced, currentUser.id);
      }
    }
  }, [settings.reducedMotion, currentUser?.id]);

  useEffect(() => { storage.save('focus_categories', focusCategories, currentUser?.id); }, [focusCategories, currentUser?.id]);
  useEffect(() => { storage.save('activity_events', activityEvents, currentUser?.id); }, [activityEvents, currentUser?.id]);
  useEffect(() => { storage.save('tasks', tasks, currentUser?.id); }, [tasks, currentUser?.id]);
  useEffect(() => { storage.save('journal_entries', journalEntries, currentUser?.id); }, [journalEntries, currentUser?.id]);
  useEffect(() => { storage.save('focus_history', focusHistory, currentUser?.id); }, [focusHistory, currentUser?.id]);
  useEffect(() => { storage.save('focus_state', focusState, currentUser?.id); }, [focusState, currentUser?.id]);
  useEffect(() => { storage.save('activity_history', activityHistory, currentUser?.id); }, [activityHistory, currentUser?.id]);
  useEffect(() => { storage.save('daily_reward_state', dailyRewardState, currentUser?.id); }, [dailyRewardState, currentUser?.id]);
  useEffect(() => { storage.save('world_state', worldState, currentUser?.id); }, [worldState, currentUser?.id]);
  useEffect(() => { storage.save('achieved_state', achievedState, currentUser?.id); }, [achievedState, currentUser?.id]);
  useEffect(() => { storage.save('sound_state', soundState); }, [soundState]);
  useEffect(() => {
    storage.save('settings', settings);
    storage.save('pearlClubEnvironment', settings.theme);
  }, [settings]);
  useEffect(() => { storage.save('bottle_safety', bottleSafety); }, [bottleSafety]);
  useEffect(() => { storage.save('profile', profile); }, [profile]);
  useEffect(() => { storage.save('pearl_club_pearl_number', pearlNumber); }, [pearlNumber]);

  const selectCuratedCategory = (catId) => {
    const isSame = curatedAudioState.activeCategoryId === catId;
    if (isSame && curatedAudioState.isPlaying) {
      ambientPlayer.stopCuratedAudio();
      setCuratedAudioState({ activeCategoryId: catId, isPlaying: false });
    } else {
      ambientPlayer.playCuratedCategory(catId);
      setCuratedAudioState({ activeCategoryId: catId, isPlaying: true });

      const catConfig = CURATED_AUDIO_REGISTRY[catId];
      if (catConfig && catConfig.ambientLayers) {
        setSoundState((prev) => ({
          ...prev,
          activePreset: null,
          waves: { playing: catConfig.ambientLayers.waves > 0, volume: catConfig.ambientLayers.waves },
          rain: { playing: catConfig.ambientLayers.rain > 0, volume: catConfig.ambientLayers.rain },
          wind: { playing: catConfig.ambientLayers.wind > 0, volume: catConfig.ambientLayers.wind },
          underwater: { playing: catConfig.ambientLayers.underwater > 0, volume: catConfig.ambientLayers.underwater }
        }));
      }
    }
  };

  const addItemToInventory = (item) => {
    setWorldState((prev) => {
      const currentOwned = prev.ownedItems || [];
      const placement = getAutoPlacementCoords(currentOwned.length);
      const reg = getCollectible(item);

      const newItem = {
        id: reg.id,
        name: reg.name,
        source: item.source || 'reward',
        ...placement
      };

      return {
        ...prev,
        ownedItems: [...currentOwned, newItem]
      };
    });
  };

  const logActivityEvent = (type, metadata = {}) => {
    const today = new Date().toISOString().split('T')[0];
    const newEvent = {
      id: `evt_${Date.now()}`,
      type,
      date: today,
      timestamp: new Date().toISOString(),
      metadata
    };
    setActivityEvents((prev) => [newEvent, ...prev]);
  };

  const addFocusCategory = (newCat) => {
    const trimmed = newCat.trim();
    if (!trimmed || focusCategories.includes(trimmed)) return;
    setFocusCategories((prev) => [...prev, trimmed]);
  };

  const recordActivityDate = (category) => {
    const today = new Date().toISOString().split('T')[0];
    logActivityEvent(category);
    setActivityHistory((prev) => {
      const existing = prev[category] || [];
      if (!existing.includes(today)) {
        const next = { ...prev, [category]: [...existing, today] };
        checkAchievements(next, focusHistory, journalEntries, visitedDays);
        return next;
      }
      return prev;
    });
  };

  const checkAchievements = (
    currentHistory = activityHistory,
    currentFocus = focusHistory,
    currentJournal = journalEntries,
    currentVisitedDays = visitedDays
  ) => {
    const journalDays = (currentHistory.journal || []).length;
    const journalTotal = Object.keys(currentJournal).filter(
      (k) => currentJournal[k]?.text?.trim() || currentJournal[k]?.drawingDataUrl
    ).length;

    const focusDays = (currentHistory.focus || []).length;
    const focusTotal = currentFocus.length;
    const has25m = currentFocus.some((f) => f.duration >= 25);

    const sudokuDays = (currentHistory.sudoku || []).length;
    const pearlCatchDays = (currentHistory.pearlCatch || []).length;
    const quickMathDays = (currentHistory.quickMath || []).length;
    const distinctVisitedDays = currentVisitedDays.length;

    DEFAULT_ACHIEVEMENTS.forEach((ach) => {
      if (achievedState.unlockedIds.includes(ach.id)) return;

      let currentProg = 0;
      if (ach.category === 'journal_days') currentProg = journalDays;
      else if (ach.category === 'journal_total') currentProg = journalTotal;
      else if (ach.category === 'focus_first') currentProg = focusTotal;
      else if (ach.category === 'focus_25m') currentProg = has25m ? 1 : 0;
      else if (ach.category === 'focus_days') currentProg = focusDays;
      else if (ach.category === 'sudoku_days') currentProg = sudokuDays;
      else if (ach.category === 'pearlCatch_days') currentProg = pearlCatchDays;
      else if (ach.category === 'quickMath_days') currentProg = quickMathDays;
      else if (ach.category === 'visited_days') currentProg = distinctVisitedDays;

      if (currentProg >= ach.requirement) {
        setAchievedState((prev) => ({
          ...prev,
          unlockedIds: [...prev.unlockedIds, ach.id]
        }));
        setPendingUnlockedAchievement(ach);
        logActivityEvent('achievement', { achievementId: ach.id, title: ach.title });
      }
    });
  };

  // Run achievement check when visitedDays changes
  useEffect(() => {
    checkAchievements(activityHistory, focusHistory, journalEntries, visitedDays);
  }, [visitedDays]);

  const claimAchievementReward = (achievementId) => {
    const ach = DEFAULT_ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!ach) return;

    setAchievedState((prev) => ({
      ...prev,
      claimedIds: [...prev.claimedIds, achievementId]
    }));

    const newItem = {
      ...ach.collectible,
      source: 'achievement',
      unlockedAt: new Date().toISOString(),
      achievementTitle: ach.title
    };

    addItemToInventory(newItem);
    setPendingUnlockedAchievement(null);
  };

  const isDailyRewardAvailable = Boolean(
    currentUser?.id &&
    dailyRewardState?.lastClaimedDate !== todayKey &&
    !(dailyRewardState?.history || []).some((h) => h.date === todayKey)
  );

  const claimDailyReward = () => {
    const userId = currentUser?.id;
    if (!userId) return null;

    // Verify against latest user-scoped storage to prevent double claims or race conditions
    const latestDailyState = storage.get('daily_reward_state', { lastClaimedDate: null, totalClaims: 0, history: [] }, userId);
    const existingHistory = latestDailyState.history || [];

    if (latestDailyState.lastClaimedDate === todayKey || existingHistory.some((h) => h.date === todayKey)) {
      console.log('[Daily Reward] Already claimed today for user:', userId);
      return null;
    }

    const pool = ['starfish', 'sea-glass', 'pearl-shell', 'clownfish', 'guppy', 'coral', 'seahorse'];
    const randomIndex = Math.floor(Math.random() * pool.length);
    const catId = pool[randomIndex];
    const reg = getCollectible(catId);

    const newDailyState = {
      lastClaimedDate: todayKey,
      totalClaims: (latestDailyState?.totalClaims || 0) + 1,
      history: [...existingHistory, { date: todayKey, collectibleId: catId }]
    };

    // Save to user storage BEFORE updating component state
    storage.save('daily_reward_state', newDailyState, userId);
    setDailyRewardState(newDailyState);

    addCollectibleToUser(catId, 'daily_reward');
    logActivityEvent('reward', { source: 'daily_reward', rewardName: reg?.name || catId });

    return reg || { id: catId, name: 'Daily Pearl Reward', asset: '/assets/collectibles/pearl.png' };
  };

  const grantRandomFocusReward = (category, duration) => {
    const randomIndex = Math.floor(Math.random() * RARE_REWARD_POOL.length);
    const catId = RARE_REWARD_POOL[randomIndex];
    const reg = getCollectible(catId);

    const rewardItem = {
      ...reg,
      source: 'focus_rare',
      unlockedAt: new Date().toISOString()
    };

    addCollectibleToUser(catId, 'focus_rare');
    logActivityEvent('reward', { source: 'focus_rare', rewardName: rewardItem.name || catId });

    setPendingSurpriseReward({
      collectibleId: catId,
      title: "A rare discovery emerged.",
      subtitle: `You found a ${reg?.name || 'rare sea companion'} from your completed focus session.`
    });

    return rewardItem;
  };

  const collectGoldenPearl = () => {
    const userId = currentUser?.id;
    if (!userId) return;

    const savedFlags = storage.get('user_reward_flags', { earlyMemberClaimed: false, goldenPearlClaimed: false, goldenPearlRevealPending: false }, userId);

    addCollectibleToUser('golden-pearl', 'found');
    const updatedFlags = { ...savedFlags, goldenPearlClaimed: true, goldenPearlRevealPending: true };
    storage.save('user_reward_flags', updatedFlags, userId);
    setRewardFlags(updatedFlags);

    setWorldState((prev) => ({
      ...prev,
      hasGoldenPearl: true,
      goldenPearlFoundAt: new Date().toISOString()
    }));
  };

  const markGoldenPearlRevealed = () => {
    const userId = currentUser?.id;
    if (!userId) return;

    const savedFlags = storage.get('user_reward_flags', { earlyMemberClaimed: false, goldenPearlClaimed: false, goldenPearlRevealPending: false }, userId);
    const updatedFlags = { ...savedFlags, goldenPearlRevealPending: false };
    storage.save('user_reward_flags', updatedFlags, userId);
    setRewardFlags(updatedFlags);
  };

  const reportBottle = (bottleId, reason) => {
    setBottleSafety((prev) => ({
      ...prev,
      reportedBottleIds: [...prev.reportedBottleIds, bottleId]
    }));
    logActivityEvent('bottle_reported', { bottleId, reason });
  };

  const blockSender = (senderId) => {
    if (!senderId) return;
    setBottleSafety((prev) => ({
      ...prev,
      blockedSenders: [...prev.blockedSenders, senderId]
    }));
  };

  const incrementDailyBottleCount = () => {
    const today = new Date().toISOString().split('T')[0];
    setBottleSafety((prev) => {
      const current = prev.dailyCount.date === today ? prev.dailyCount.count : 0;
      return {
        ...prev,
        dailyCount: { date: today, count: current + 1 }
      };
    });
  };

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const addTask = (text) => {
    if (!text || !text.trim()) return false;
    if (activeTasks.length >= 3) {
      alert('The Rule of 3: You currently have 3 active priorities. Complete one to add another.');
      return false;
    }
    const newTask = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    setTasks((prev) => [...prev, newTask]);
    return true;
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : null
          };
        }
        return t;
      })
    );
  };

  const editTask = (id, newText) => {
    if (!newText.trim()) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: newText.trim() } : t))
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const saveJournalEntry = (dateKey, text) => {
    recordActivityDate('journal');
    setJournalEntries((prev) => {
      const existing = prev[dateKey] || { id: dateKey, date: dateKey, createdAt: new Date().toISOString() };
      const updated = {
        ...prev,
        [dateKey]: {
          ...existing,
          text,
          updatedAt: new Date().toISOString()
        }
      };
      checkAchievements(activityHistory, focusHistory, updated, visitedDays);
      return updated;
    });
  };

  const saveMoodDrawing = (dateKey, dataUrl) => {
    recordActivityDate('journal');
    logActivityEvent('mood_canvas', { date: dateKey });
    setJournalEntries((prev) => {
      const existing = prev[dateKey] || { id: dateKey, date: dateKey, text: '', createdAt: new Date().toISOString() };
      const updated = {
        ...prev,
        [dateKey]: {
          ...existing,
          drawingDataUrl: dataUrl,
          updatedAt: new Date().toISOString()
        }
      };
      checkAchievements(activityHistory, focusHistory, updated, visitedDays);
      return updated;
    });
  };

  const getConsecutiveQualifyingDays = (dates) => {
    if (!dates || dates.length === 0) return 0;
    const unique = Array.from(new Set(dates)).sort();
    if (unique.length === 0) return 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr);

    const latestStr = unique[unique.length - 1];
    const latest = new Date(latestStr);
    const diffDays = Math.round((today - latest) / (1000 * 60 * 60 * 24));

    if (diffDays > 1) return 0;

    let count = 1;
    for (let i = unique.length - 1; i > 0; i--) {
      const dCurr = new Date(unique[i]);
      const dPrev = new Date(unique[i - 1]);
      const diff = Math.round((dCurr - dPrev) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        count++;
      } else {
        break;
      }
    }
    return count;
  };

  const recordFocusSession = (durationMinutes, category = 'Work', mode = 'timer') => {
    const today = new Date().toISOString().split('T')[0];
    recordActivityDate('focus');

    const qualifies = durationMinutes >= 25;
    const pearlAwarded = qualifies;
    const sessionId = Date.now().toString();

    const sessionObj = {
      id: sessionId,
      date: today,
      duration: durationMinutes,
      mode,
      category,
      qualifies,
      pearlAwarded,
      completedAt: new Date().toISOString()
    };

    setFocusHistory((prev) => {
      const next = [sessionObj, ...prev];
      checkAchievements(activityHistory, next, journalEntries, visitedDays);
      return next;
    });

    let rareUnlocked = false;
    let newRareItem = null;

    setFocusState((prev) => {
      const currentPearls = prev.pearls || [];
      const currentSessions = prev.sessions || [];
      const currentDates = prev.qualifyingDates || [];
      const currentRares = prev.rareRewards || [];

      let nextPearls = [...currentPearls];
      let nextDates = [...currentDates];

      if (qualifies) {
        const newPearl = {
          id: `fp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          earnedFromSessionId: sessionId,
          earnedDate: today,
          status: 'available',
          earnedAt: new Date().toISOString()
        };
        nextPearls.push(newPearl);

        if (!nextDates.includes(today)) {
          nextDates.push(today);
          nextDates.sort();
        }
      }

      const totalQualifyingFocusDays = nextDates.length;

      if (totalQualifyingFocusDays >= 7 && qualifies && !worldState?.hasGoldenPearl) {
        let convertedCount = 0;
        nextPearls = nextPearls.map((p) => {
          if (p.status === 'available' && convertedCount < 7) {
            convertedCount++;
            return { ...p, status: 'converted', convertedAt: new Date().toISOString() };
          }
          return p;
        });

        rareUnlocked = true;
        newRareItem = {
          id: 'golden-pearl',
          name: 'Golden Pearl',
          source: 'focus_rare',
          description: 'A glowing Golden Pearl discovered after accumulating 7 days of deep focus.',
          unlockedAt: new Date().toISOString()
        };

        const rareRecord = {
          id: `fr_${Date.now()}`,
          source: 'focus-seven-day',
          unlockedAt: new Date().toISOString(),
          collectibleId: 'golden-pearl'
        };

        addCollectibleToUser('golden-pearl', 'focus_milestone');

        return {
          pearls: nextPearls,
          sessions: [sessionObj, ...currentSessions],
          qualifyingDates: nextDates,
          streakProgress: totalQualifyingFocusDays,
          rareRewards: [rareRecord, ...currentRares]
        };
      }

      return {
        pearls: nextPearls,
        sessions: [sessionObj, ...currentSessions],
        qualifyingDates: nextDates,
        streakProgress: totalQualifyingFocusDays,
        rareRewards: currentRares
      };
    });

    const legacyReward = grantRandomFocusReward(category, durationMinutes);

    return {
      session: sessionObj,
      pearlAwarded,
      qualifies,
      focusRareUnlocked: rareUnlocked,
      rareReward: newRareItem,
      legacyReward
    };
  };

  const toggleSoundTrack = (trackName) => {
    const isNowPlaying = ambientPlayer.toggleTrack(trackName);
    if (isNowPlaying) {
      triggerNaturalDiscovery('music');
    }
    setSoundState((prev) => ({
      ...prev,
      activePreset: null,
      isPlayingAll: false,
      [trackName]: {
        ...prev[trackName],
        playing: isNowPlaying
      }
    }));
  };

  const setSoundVolume = (trackName, volume) => {
    ambientPlayer.setVolume(trackName, volume);
    setSoundState((prev) => ({
      ...prev,
      [trackName]: {
        ...prev[trackName],
        volume
      }
    }));
  };

  const playPreset = (presetName) => {
    if (soundState.activePreset === presetName) {
      ambientPlayer.stopPreset();
      setSoundState((prev) => ({
        ...prev,
        activePreset: null,
        isPlayingAll: false,
        waves: { ...prev.waves, playing: false },
        rain: { ...prev.rain, playing: false },
        wind: { ...prev.wind, playing: false },
        underwater: { ...prev.underwater, playing: false }
      }));
    } else {
      ambientPlayer.playPreset(presetName);
      const config = ambientPlayer.presets[presetName];

      setSoundState((prev) => ({
        ...prev,
        activePreset: presetName,
        isPlayingAll: false,
        waves: { playing: Boolean(config.waves.playing), volume: config.waves.volume },
        rain: { playing: Boolean(config.rain.playing), volume: config.rain.volume },
        wind: { playing: Boolean(config.wind.playing), volume: config.wind.volume },
        underwater: { playing: Boolean(config.underwater.playing), volume: config.underwater.volume }
      }));
    }
  };

  const playAllSounds = () => {
    const startedAny = ambientPlayer.playAll();
    setSoundState((prev) => ({
      ...prev,
      activePreset: null,
      isPlayingAll: startedAny,
      waves: { playing: ambientPlayer.tracks.waves.isPlaying },
      rain: { playing: ambientPlayer.tracks.rain.isPlaying },
      wind: { playing: ambientPlayer.tracks.wind.isPlaying },
      underwater: { playing: ambientPlayer.tracks.underwater.isPlaying }
    }));
  };

  const pauseAllSounds = () => {
    ambientPlayer.pauseAll();
    setSoundState((prev) => ({
      ...prev,
      isPlayingAll: false,
      waves: { ...prev.waves, playing: false },
      rain: { ...prev.rain, playing: false },
      wind: { ...prev.wind, playing: false },
      underwater: { ...prev.underwater, playing: false }
    }));
  };

  const setGlobalMute = (muteState) => {
    ambientPlayer.setMute(muteState);
    setSoundState((prev) => ({
      ...prev,
      isMuted: muteState
    }));
  };

  const getProfileStats = () => {
    const journalCount = Object.keys(journalEntries).filter(
      (k) => journalEntries[k]?.text?.trim() || journalEntries[k]?.drawingDataUrl
    ).length;

    const focusCount = (focusState.sessions || focusHistory).length;
    const focusDays = (focusState.qualifyingDates || []).length;
    const availableFocusPearls = (focusState.pearls || []).filter((p) => p.status === 'available').length;
    const rareFocusRewards = (focusState.rareRewards || []).length;
    const ownedCount = (worldState.ownedItems || []).length;

    return {
      journalEntries: journalCount,
      focusSessions: focusCount,
      focusDays,
      focusPearls: availableFocusPearls,
      rareFocusRewards,
      visitedDaysCount: visitedDays.length,
      goldenPearls: (worldState.ownedItems || []).filter((i) => i.id === 'golden-pearl').length,
      foundThings: (worldState.ownedItems || []).filter((i) => i.source === 'found').length,
      achievedThings: (worldState.ownedItems || []).filter((i) => i.source !== 'found').length,
      totalOwnedItems: ownedCount
    };
  };

  const updateProfile = (fields) => {
    setProfile((prev) => ({ ...prev, ...fields }));
  };

  const resetAllLocalData = () => {
    ambientPlayer.stopAll();
    storage.clear();
    setVisitedDays([todayKey]);
    setFocusCategories(DEFAULT_FOCUS_CATEGORIES);
    setActivityEvents([]);
    setTasks([]);
    setJournalEntries({});
    setFocusHistory([]);
    setFocusState({ pearls: [], sessions: [], qualifyingDates: [], streakProgress: 0, rareRewards: [] });
    setActivityHistory({ journal: [], focus: [], sudoku: [], pearlCatch: [], quickMath: [] });
    setDailyRewardState({ lastClaimedDate: null });
    setWorldState({
      hasGoldenPearl: false,
      goldenPearlFoundAt: null,
      ownedItems: [
        { id: 'pearl-shell', source: 'found', x: 25, y: 70, scale: 1 },
        { id: 'clownfish', source: 'found', x: 45, y: 40, scale: 1 }
      ]
    });
    setAchievedState({ unlockedIds: [], claimedIds: [] });
    setBottleSafety({ dailyCount: { date: todayKey, count: 0 }, blockedSenders: [], reportedBottleIds: [] });
    setSoundState({
      waves: { playing: false, volume: 0.7 },
      rain: { playing: false, volume: 0.3 },
      wind: { playing: false, volume: 0.2 },
      underwater: { playing: false, volume: 0.8 },
      activePreset: null,
      isPlayingAll: false,
      isMuted: false
    });
    setProfile({
      name: '',
      username: '',
      bio: 'Finding a little quiet space.',
      avatar: 'pearl',
      favoriteEnvironment: 'Cyan Lagoon',
      createdAt: '2026-08'
    });
  };

  const selectedEnvironment = getEnvironment(settings.theme || 'Ocean');

  const setEnvironment = (envIdOrName) => {
    const env = getEnvironment(envIdOrName);
    setSettings((prev) => ({ ...prev, theme: env.name }));
  };

  return (
    <SanctuaryContext.Provider
      value={{
        authLoading,
        currentUser,
        signOutUser,
        addCollectibleToUser,
        triggerNaturalDiscovery,
        grantGameReward,
        returnDays,
        returnRewards,
        pendingSurpriseReward,
        setPendingSurpriseReward,
        visitedDays,
        focusCategories,
        addFocusCategory,
        activityEvents,
        logActivityEvent,
        tasks,
        activeTasks,
        completedTasks,
        addTask,
        toggleTask,
        editTask,
        deleteTask,
        journalEntries,
        saveJournalEntry,
        saveMoodDrawing,
        focusHistory,
        focusState,
        recordFocusSession,
        activityHistory,
        recordActivityDate,
        isDailyRewardAvailable,
        claimDailyReward,
        achievementsList: DEFAULT_ACHIEVEMENTS,
        achievedState,
        pendingUnlockedAchievement,
        claimAchievementReward,
        setPendingUnlockedAchievement,
        worldState,
        collectGoldenPearl,
        markGoldenPearlRevealed,
        rewardFlags,
        bottleSafety,
        reportBottle,
        blockSender,
        incrementDailyBottleCount,
        soundState,
        toggleSoundTrack,
        setSoundVolume,
        playPreset,
        playAllSounds,
        pauseAllSounds,
        setGlobalMute,
        curatedAudioState,
        selectCuratedCategory,
        activePanel,
        setActivePanel,
        togglePanel,
        settings,
        setSettings,
        environmentAudioEnabled,
        setEnvironmentAudioEnabled,
        environmentAudioVolume,
        setEnvironmentAudioVolume,
        selectedEnvironment,
        setEnvironment,
        profile,
        updateProfile,
        getProfileStats,
        resetAllLocalData,
        pearlNumber,
        isEarlyMember,
        formattedPearlNumber,
        showEarlyMemberWelcomeModal,
        claimEarlyMemberModal,
        logAnalyticsEvent
      }}
    >
      {children}
    </SanctuaryContext.Provider>
  );
};

export const useSanctuary = () => {
  const ctx = useContext(SanctuaryContext);
  if (!ctx) {
    throw new Error('useSanctuary must be used within a SanctuaryProvider');
  }
  return ctx;
};

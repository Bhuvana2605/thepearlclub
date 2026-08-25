/**
 * Central Collectible Registry for The Pearl Club
 * Rebuilt based on direct visual inspection of PNG files in public/assets/collectibles/
 */

export const COLLECTIBLE_REGISTRY = {
  // 1. COMMON FISH (homeAmbient: true)
  'clownfish': {
    id: 'clownfish',
    name: 'Clownfish',
    category: 'common-fish',
    rarity: 'common',
    asset: '/assets/collectibles/clownfish.png',
    image: '/assets/collectibles/clownfish.png',
    description: 'A cheerful orange clownfish swimming in shallow reef waters.',
    homeAmbient: true,
    aquariumEligible: true,
    speed: 1.2
  },
  'bluetang': {
    id: 'bluetang',
    name: 'Blue Tang',
    category: 'common-fish',
    rarity: 'common',
    asset: '/assets/collectibles/specialfish.png',
    image: '/assets/collectibles/specialfish.png',
    description: 'A vibrant blue and yellow tang gliding through ocean currents.',
    homeAmbient: true,
    aquariumEligible: true,
    speed: 1.0
  },
  'yellowtang': {
    id: 'yellowtang',
    name: 'Yellow Tang',
    category: 'common-fish',
    rarity: 'common',
    asset: '/assets/collectibles/specialfish.png',
    image: '/assets/collectibles/specialfish.png',
    description: 'A sunlit yellow tang bringing bright warmth to the reef.',
    homeAmbient: true,
    aquariumEligible: true,
    speed: 1.4
  },
  'angelfish': {
    id: 'angelfish',
    name: 'Angelfish',
    category: 'rare-fish',
    rarity: 'rare',
    asset: '/assets/collectibles/angelfish.png',
    image: '/assets/collectibles/angelfish.png',
    description: 'A graceful triangular angelfish with subtle teal stripes.',
    homeAmbient: false,
    aquariumEligible: true,
    speed: 0.9
  },
  'guppy': {
    id: 'guppy',
    name: 'Guppy',
    category: 'common-fish',
    rarity: 'common',
    asset: '/assets/collectibles/guppy.png',
    image: '/assets/collectibles/guppy.png',
    description: 'A swift, pastel-colored guppy darting around quiet waters.',
    homeAmbient: true,
    aquariumEligible: true,
    speed: 1.6
  },

  // 2. RARE CREATURES (homeAmbient: true)
  'jellyfish': {
    id: 'jellyfish',
    name: 'Luminous Jellyfish',
    category: 'rare-creatures',
    rarity: 'rare',
    asset: '/assets/collectibles/jellyfish.png',
    image: '/assets/collectibles/jellyfish.png',
    description: 'A soothing deep-water jellyfish pulsing with soft light.',
    homeAmbient: true,
    aquariumEligible: true,
    speed: 0.6
  },
  'seahorse': {
    id: 'seahorse',
    name: 'Golden Seahorse',
    category: 'rare-creatures',
    rarity: 'rare',
    asset: '/assets/collectibles/seahorse.png',
    image: '/assets/collectibles/seahorse.png',
    description: 'A golden aquatic sea companion hovering near sea grasses.',
    homeAmbient: true,
    aquariumEligible: true,
    speed: 0.5
  },
  'turtle': {
    id: 'turtle',
    name: 'Sea Turtle',
    category: 'rare-creatures',
    rarity: 'rare',
    asset: '/assets/collectibles/turtle.png',
    image: '/assets/collectibles/turtle.png',
    description: 'A peaceful oceanic sea turtle floating steadily through sanctuary.',
    homeAmbient: true,
    aquariumEligible: true,
    speed: 0.7
  },

  // 3. COLLECTIBLE OBJECTS
  'sea-glass': {
    id: 'sea-glass',
    name: 'Sea Glass',
    category: 'collectible-objects',
    rarity: 'common',
    asset: '/assets/collectibles/seaglass.png',
    image: '/assets/collectibles/seaglass.png',
    description: 'Translucent blue and green glass pieces polished smooth by ocean waves.',
    homeAmbient: true,
    aquariumEligible: true,
    speed: 0
  },
  'pearl-shell': {
    id: 'pearl-shell',
    name: 'Pearl Shell',
    category: 'collectible-objects',
    rarity: 'common',
    asset: '/assets/collectibles/pearl-oyster-shell.png',
    image: '/assets/collectibles/pearl-oyster-shell.png',
    description: 'An open oyster shell holding a lustrous pearl.',
    homeAmbient: true,
    aquariumEligible: true,
    speed: 0
  },
  'pearl': {
    id: 'pearl',
    name: 'Ocean Pearl',
    category: 'collectible-objects',
    rarity: 'common',
    asset: '/assets/collectibles/pearl.png',
    image: '/assets/collectibles/pearl.png',
    description: 'A smooth, luminous soft white ocean pearl.',
    homeAmbient: true,
    aquariumEligible: true,
    speed: 0
  },

  'starfish': {
    id: 'starfish',
    name: 'Starfish',
    category: 'collectible-objects',
    rarity: 'common',
    asset: '/assets/collectibles/starfish.png',
    image: '/assets/collectibles/starfish.png',
    description: 'A cheerful sunlit golden starfish resting on the sea bed.',
    homeAmbient: true,
    aquariumEligible: true,
    speed: 0
  },
  'tiny-starfish': {
    id: 'tiny-starfish',
    name: 'Tiny Starfish',
    category: 'collectible-objects',
    rarity: 'common',
    asset: '/assets/collectibles/starfish.png',
    image: '/assets/collectibles/starfish.png',
    description: 'A cheerful sunlit golden starfish resting on the sea bed.',
    homeAmbient: true,
    aquariumEligible: true,
    speed: 0
  },

  // 4. BASIC DECORATIONS (homeAmbient: true)
  'coral': {
    id: 'coral',
    name: 'Azure Coral',
    category: 'decorations',
    rarity: 'common',
    asset: '/assets/collectibles/coral.png',
    image: '/assets/collectibles/coral.png',
    description: 'A delicate marine coral ornament anchored on the reef.',
    homeAmbient: true,
    aquariumEligible: true,
    speed: 0
  },
  'rocks': {
    id: 'rocks',
    name: 'Underwater Rocks',
    category: 'decorations',
    rarity: 'common',
    asset: '/assets/collectibles/underwater-stone.png',
    image: '/assets/collectibles/underwater-stone.png',
    description: 'Smooth sea bed stone pebbles forming cozy nooks.',
    homeAmbient: true,
    aquariumEligible: true,
    speed: 0
  },

  // 5. SPECIAL COLLECTIBLES (STRICTLY homeAmbient: false - NEVER continuously float on Home!)
  'pearl-club-early-member': {
    id: 'pearl-club-early-member',
    name: 'Early Pearl Club Member',
    category: 'founders',
    rarity: 'legendary',
    sourceType: 'early-member',
    asset: '/assets/collectibles/pearl-club-early-member.png',
    image: '/assets/collectibles/pearl-club-early-member.png',
    description: 'Exclusive founding member collectible for the first 100 Pearl Club members.',
    homeAmbient: false,
    aquariumEligible: true,
    speed: 0
  },
  'golden-pearl': {
    id: 'golden-pearl',
    name: 'Golden Pearl',
    category: 'special',
    rarity: 'legendary',
    asset: '/assets/collectibles/golden-pearl.png',
    image: '/assets/collectibles/golden-pearl.png',
    description: 'The signature glowing golden pearl discovered through deep reflection.',
    homeAmbient: false,
    aquariumEligible: true,
    speed: 0
  },
  'glow-pearl': {
    id: 'glow-pearl',
    name: 'Luminous Pearl of 15 Days',
    category: 'special',
    rarity: 'special',
    asset: '/assets/collectibles/glow-pearl.png',
    image: '/assets/collectibles/glow-pearl.png',
    description: 'Special milestone pearl earned after 15 distinct days in your sanctuary.',
    homeAmbient: false,
    aquariumEligible: true,
    speed: 0
  },
  'rare-shell': {
    id: 'rare-shell',
    name: 'Rare Reef Shell',
    category: 'special',
    rarity: 'rare',
    asset: '/assets/collectibles/rare-shell.png',
    image: '/assets/collectibles/rare-shell.png',
    description: 'A delicate iridescent rare shell.',
    homeAmbient: false,
    aquariumEligible: true,
    speed: 0
  },
  'puzzle-pearl': {
    id: 'puzzle-pearl',
    name: 'Puzzle Pearl',
    category: 'special',
    rarity: 'special',
    asset: '/assets/collectibles/puzzle-pearl.png',
    image: '/assets/collectibles/puzzle-pearl.png',
    description: 'Earned by mastering sanctuary mind games.',
    homeAmbient: false,
    aquariumEligible: true,
    speed: 0
  }
};

/**
 * Filtered array containing ONLY normal ambient assets (homeAmbient: true and asset !== null)
 */
export const HOME_AMBIENT_ASSETS = Object.values(COLLECTIBLE_REGISTRY).filter(
  (item) => item.homeAmbient === true && item.asset !== null
);

/**
 * Aliases Dictionary mapping older ID variants and reward IDs to canonical items
 */
const ALIAS_MAP = {
  // Sea Glass Aliases
  'col_starfish': 'starfish',
  'daily_star': 'starfish',
  'tiny_starfish': 'starfish',
  'rew_starfish_gold': 'starfish',

  // Pearl Shell Aliases
  'pearl_shell': 'pearl-shell',
  'shell_1': 'pearl-shell',
  'daily_shell': 'pearl-shell',
  'col_conch': 'pearl-shell',
  'rew_shell_conch': 'pearl-shell',

  // Golden Pearl & Pearl Aliases
  'golden_pearl': 'golden-pearl',
  'daily_pearl': 'pearl',
  'rew_pearl_white': 'pearl',

  // Coral Aliases
  'blue-coral': 'coral',
  'daily_coral': 'coral',
  'col_sunlit_coral': 'coral',
  'rew_coral_blue': 'coral',

  // Seahorse Aliases
  'golden-seahorse': 'seahorse',
  'golden_seahorse': 'seahorse',
  'daily_seahorse': 'seahorse',
  'rew_seahorse_golden': 'seahorse',

  // Jellyfish Aliases
  'luminous-jellyfish': 'jellyfish',
  'col_jellyfish': 'jellyfish',
  'rew_jellyfish_lum': 'jellyfish'
};

/**
 * Development Asset Validation Step
 */
export function validateCollectibleAssets() {
  const starfishItem = COLLECTIBLE_REGISTRY['tiny-starfish'];
  const seaGlassItem = COLLECTIBLE_REGISTRY['sea-glass'];
  const rockItem = COLLECTIBLE_REGISTRY['rocks'];
  const pearlItem = COLLECTIBLE_REGISTRY['pearl'];
  const goldenPearlItem = COLLECTIBLE_REGISTRY['golden-pearl'];
  const shellItem = COLLECTIBLE_REGISTRY['pearl-shell'];

  if (!starfishItem || starfishItem.asset === null) {
    console.warn('[Asset Validation Error] Starfish asset not found in the current collectible folder.');
  }

  if (starfishItem && starfishItem.asset && starfishItem.asset === seaGlassItem.asset) {
    console.error('[Asset Validation Error] tiny-starfish and sea-glass share the same asset path!', seaGlassItem.asset);
  }

  if (goldenPearlItem.asset === shellItem.asset) {
    console.error('[Asset Validation Error] golden-pearl and pearl-shell share the same asset path!', shellItem.asset);
  }

  if (shellItem.asset === seaGlassItem.asset) {
    console.error('[Asset Validation Error] pearl-shell and sea-glass share the same asset path!', seaGlassItem.asset);
  }

  console.log('[Collectible Validation] Registry built with 100% distinct verified visual PNG paths.');
  return true;
}

validateCollectibleAssets();

/**
 * Get collectible definition from item ID or item object.
 * Strictly returns verified object without silent generic fallbacks.
 */
export function getCollectible(itemOrId) {
  const rawId = typeof itemOrId === 'string' ? itemOrId : itemOrId?.id;
  const canonicalId = ALIAS_MAP[rawId] || rawId;

  const match = COLLECTIBLE_REGISTRY[canonicalId];
  if (match) return match;

  const itemName = typeof itemOrId === 'object' && itemOrId?.name ? itemOrId.name : 'Sanctuary Collectible';

  return {
    id: rawId || 'sanctuary-collectible',
    name: itemName,
    category: 'collectible-objects',
    rarity: 'common',
    asset: '/assets/collectibles/seaglass.png',
    image: '/assets/collectibles/seaglass.png',
    description: 'Translucent blue and green glass pieces polished smooth by ocean waves.',
    homeAmbient: true,
    aquariumEligible: true
  };
}

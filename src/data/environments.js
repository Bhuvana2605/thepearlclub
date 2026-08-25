/**
 * Centralized Environment Registry for The Pearl Club
 * 
 * V0 Active Environments:
 * 1. Ocean (ocean)
 * 2. Rainy Ocean (rainy-ocean)
 * 3. Underwater (underwater)
 * 
 * Disabled V0 Environments (Preserved in code for future versions):
 * - Beach (beach)
 * - Sunset Beach (sunset-beach)
 * - Grassland (grassland)
 */

export const ENVIRONMENTS = {
  'ocean': {
    id: 'ocean',
    name: 'Ocean',
    sourceFolder: '/assets/backgrounds/the_pearl_club_ocean_theme/',
    background: '/assets/backgrounds/the_pearl_club_ocean_theme/screen.png',
    fallbackBackground: '/assets/backgrounds/ocean.png',
    gradientFallback: 'linear-gradient(to bottom, #80deea 0%, #4dd0e1 35%, #00897b 75%, #004d40 100%)',
    allowedCreatures: ['clownfish', 'guppy'],
    isV0Active: true
  },
  'rainy-ocean': {
    id: 'rainy-ocean',
    name: 'Rainy Ocean',
    sourceFolder: '/assets/backgrounds/the_pearl_club_rainy_ocean_theme/',
    background: '/assets/backgrounds/the_pearl_club_rainy_ocean_theme/screen.png',
    gradientFallback: 'linear-gradient(to bottom, #78909c 0%, #546e7a 40%, #37474f 75%, #263238 100%)',
    allowedCreatures: ['clownfish', 'guppy'],
    isV0Active: true
  },
  'underwater': {
    id: 'underwater',
    name: 'Underwater',
    sourceFolder: '/assets/backgrounds/the_pearl_club_underwater_theme/',
    background: '/assets/backgrounds/the_pearl_club_underwater_theme/screen.png',
    gradientFallback: 'linear-gradient(to bottom, #00b0ff 0%, #00838f 45%, #00695c 75%, #003830 100%)',
    allowedCreatures: ['clownfish', 'guppy'],
    isV0Active: true
  },
  'beach': {
    id: 'beach',
    name: 'Beach',
    sourceFolder: '/assets/backgrounds/the_pearl_club_beach_theme/',
    background: '/assets/backgrounds/the_pearl_club_beach_theme/screen.png',
    gradientFallback: 'linear-gradient(to bottom, #e0f7fa 0%, #b2ebf2 40%, #80deea 65%, #ffe082 100%)',
    allowedCreatures: ['sea-glass', 'pearl-shell'],
    isV0Active: false
  },
  'sunset-beach': {
    id: 'sunset-beach',
    name: 'Sunset Beach',
    sourceFolder: '/assets/backgrounds/the_pearl_club_sunset_beach_theme/',
    background: '/assets/backgrounds/the_pearl_club_sunset_beach_theme/screen.png',
    gradientFallback: 'linear-gradient(to bottom, #ff8a65 0%, #e1bee7 35%, #ba68c8 65%, #3f51b5 100%)',
    allowedCreatures: ['sea-glass'],
    isV0Active: false
  },
  'grassland': {
    id: 'grassland',
    name: 'Grassland',
    sourceFolder: '/assets/backgrounds/the_pearl_club_grassland_theme/',
    background: '/assets/backgrounds/the_pearl_club_grassland_theme/screen.png',
    gradientFallback: 'linear-gradient(to bottom, #e8f5e9 0%, #c8e6c9 35%, #a5d6a7 70%, #2e7d32 100%)',
    allowedCreatures: [],
    isV0Active: false
  }
};

// Active V0 Environment IDs for Settings and Selection UI
export const V0_ENVIRONMENT_IDS = ['ocean', 'rainy-ocean', 'underwater'];

export const GLOBAL_ENVIRONMENT_SYSTEM = {
  sourceFolder: '/assets/backgrounds/the_pearl_club_global_environment_system/',
  background: '/assets/backgrounds/the_pearl_club_global_environment_system/screen.png'
};

export const DEFAULT_ENVIRONMENT_ID = 'ocean';

/**
 * Utility function to resolve environment configuration by ID or Label
 */
export function getEnvironment(envIdOrLabel) {
  if (!envIdOrLabel) return ENVIRONMENTS[DEFAULT_ENVIRONMENT_ID];

  const normalized = envIdOrLabel.toString().toLowerCase().trim().replace(/\s+/g, '-');
  const match = ENVIRONMENTS[normalized];

  if (match) return match;

  // Search by name
  const matchedByName = Object.values(ENVIRONMENTS).find(
    (e) => e.name.toLowerCase() === envIdOrLabel.toString().toLowerCase().trim()
  );

  if (matchedByName) return matchedByName;

  console.error(`[Environment Registry Error] Unknown environment theme "${envIdOrLabel}". Falling back to default Ocean theme.`);
  return ENVIRONMENTS[DEFAULT_ENVIRONMENT_ID];
}

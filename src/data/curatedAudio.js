/**
 * Data-Driven Curated Audio Registry for The Pearl Club
 * Explicit soundscape configurations for all 9 curated audio categories.
 */

export const CURATED_AUDIO_REGISTRY = {
  lofi: {
    id: 'lofi',
    name: 'Lo-fi',
    description: 'Mellow chill beats & soft ocean surf',
    icon: 'headphones',
    source: '/audio/lofi.mp3',
    ambientLayers: {
      waves: 0.35,
      rain: 0.50,
      wind: 0.10,
      underwater: 0.00
    }
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Pure rolling ocean surf and caustics',
    icon: 'waves',
    source: '/audio/ocean.mp3',
    ambientLayers: {
      waves: 0.80,
      rain: 0.00,
      wind: 0.10,
      underwater: 0.20
    }
  },

  rain: {
    id: 'rain',
    name: 'Rain',
    description: 'Soft rainfall on coastal glass',
    icon: 'rainy',
    source: '/audio/rain.mp3',
    ambientLayers: {
      waves: 0.15,
      rain: 0.85,
      wind: 0.20,
      underwater: 0.00
    }
  },

  beach: {
    id: 'beach',
    name: 'Beach',
    description: 'Sunlit shoreline ambient warmth',
    icon: 'beach_access',
    source: '/audio/beach.mp3',
    ambientLayers: {
      waves: 0.75,
      rain: 0.00,
      wind: 0.25,
      underwater: 0.00
    }
  },

  wind: {
    id: 'wind',
    name: 'Wind',
    description: 'Gentle sea breeze through coastal palms',
    icon: 'air',
    source: '/audio/wind.mp3',
    ambientLayers: {
      waves: 0.10,
      rain: 0.00,
      wind: 0.85,
      underwater: 0.00
    }
  },

  underwater: {
    id: 'underwater',
    name: 'Underwater',
    description: 'Deep submersed sanctuary rumble',
    icon: 'scuba_diving',
    source: '/audio/underwater.mp3',
    ambientLayers: {
      waves: 0.05,
      rain: 0.00,
      wind: 0.00,
      underwater: 0.90
    }
  },

  calm: {
    id: 'calm',
    name: 'Calm',
    description: 'Tranquil meditative ambient textures',
    icon: 'spa',
    source: '/audio/calm.mp3',
    ambientLayers: {
      waves: 0.50,
      rain: 0.20,
      wind: 0.10,
      underwater: 0.15
    }
  },

  focus: {
    id: 'focus',
    name: 'Focus',
    description: 'Steady rhythmic backdrop for work',
    icon: 'center_focus_strong',
    source: '/audio/focus.mp3',
    ambientLayers: {
      waves: 0.20,
      rain: 0.60,
      wind: 0.10,
      underwater: 0.15
    }
  },

  ambient: {
    id: 'ambient',
    name: 'Ambient',
    description: 'Layered soundscapes for sanctuary',
    icon: 'equalizer',
    source: '/audio/ambient.mp3',
    ambientLayers: {
      waves: 0.35,
      rain: 0.20,
      wind: 0.10,
      underwater: 0.90
    }
  }
};

/**
 * Startup Validation Function
 * Inspects every preset and curated category entry to ensure valid IDs, names, and numeric float volume layers.
 */
export function validateAudioConfig(presetsObj, curatedRegistryObj) {
  const errors = [];

  // Validate Presets
  if (presetsObj && typeof presetsObj === 'object') {
    Object.keys(presetsObj).forEach((presetKey) => {
      const preset = presetsObj[presetKey];
      ['waves', 'rain', 'wind', 'underwater'].forEach((trackKey) => {
        const layer = preset[trackKey];
        if (!layer || typeof layer.volume !== 'number' || !Number.isFinite(layer.volume) || layer.volume < 0 || layer.volume > 1) {
          errors.push(`Invalid Preset layer: ${presetKey}.${trackKey}.volume (Expected number 0..1, received ${layer?.volume})`);
        }
      });
    });
  }

  // Validate Curated Audio Registry
  if (curatedRegistryObj && typeof curatedRegistryObj === 'object') {
    Object.keys(curatedRegistryObj).forEach((catKey) => {
      const item = curatedRegistryObj[catKey];
      if (!item.id || !item.name) {
        errors.push(`Invalid Curated Audio entry ${catKey}: missing id or name.`);
      }

      if (!item.ambientLayers) {
        errors.push(`Invalid Curated Audio entry ${catKey}: missing ambientLayers.`);
      } else {
        ['waves', 'rain', 'wind', 'underwater'].forEach((trackKey) => {
          const vol = item.ambientLayers[trackKey];
          if (typeof vol !== 'number' || !Number.isFinite(vol) || vol < 0 || vol > 1) {
            errors.push(`Invalid Curated Audio layer: ${catKey}.ambientLayers.${trackKey} (Expected number 0..1, received ${vol})`);
          }
        });
      }
    });
  }

  if (errors.length > 0) {
    console.error('[Audio Validation Error] Data configuration issues detected:', errors);
    return false;
  }

  console.log('[Audio Validation] All presets and curated audio categories verified successfully.');
  return true;
}

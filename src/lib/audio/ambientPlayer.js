import { CURATED_AUDIO_REGISTRY, validateAudioConfig } from '../../data/curatedAudio';

/**
 * Direct volume formatter calculating percentage from valid numeric volume floats (0.0 to 1.0).
 */
export function formatVolume(volume) {
  const num = typeof volume === 'number' && Number.isFinite(volume) ? volume : 0;
  const clamped = Math.max(0, Math.min(1, num));
  return `${Math.round(clamped * 100)}%`;
}

class AmbientPlayer {
  constructor() {
    this.ctx = null;
    this.masterGain = null;

    // Active Curated Category Audio Element
    this.activeCuratedAudioNode = null;
    this.currentCuratedCategoryId = null;

    // Explicit Ambient Sound Tracks Dictionary
    this.tracks = {
      waves: { id: 'waves', name: 'Waves', isPlaying: false, volume: 0.7, node: null, gain: null },
      rain: { id: 'rain', name: 'Rain', isPlaying: false, volume: 0.3, node: null, gain: null },
      wind: { id: 'wind', name: 'Wind', isPlaying: false, volume: 0.2, node: null, gain: null },
      underwater: { id: 'underwater', name: 'Underwater', isPlaying: false, volume: 0.8, node: null, gain: null }
    };

    // Explicit Presets Dictionary with numeric floats (0.0 to 1.0)
    this.presets = {
      Calm: {
        waves: { playing: true, volume: 0.60 },
        rain: { playing: true, volume: 0.35 },
        wind: { playing: true, volume: 0.15 },
        underwater: { playing: true, volume: 0.10 }
      },
      Focus: {
        waves: { playing: true, volume: 0.20 },
        rain: { playing: true, volume: 0.60 },
        wind: { playing: true, volume: 0.10 },
        underwater: { playing: true, volume: 0.15 }
      },
      Ambient: {
        waves: { playing: true, volume: 0.35 },
        rain: { playing: true, volume: 0.20 },
        wind: { playing: true, volume: 0.10 },
        underwater: { playing: true, volume: 0.90 }
      },
      'Lo-fi': {
        waves: { playing: true, volume: 0.35 },
        rain: { playing: true, volume: 0.50 },
        wind: { playing: true, volume: 0.10 },
        underwater: { playing: false, volume: 0.00 }
      }
    };

    // Validate Audio Configuration Data at Startup
    validateAudioConfig(this.presets, CURATED_AUDIO_REGISTRY);
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  createNoiseNode(trackKey) {
    if (!this.ctx) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    if (trackKey === 'waves') {
      filter.type = 'bandpass';
      filter.frequency.value = 400;
      filter.Q.value = 1.0;
    } else if (trackKey === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.value = 1200;
    } else if (trackKey === 'wind') {
      filter.type = 'lowpass';
      filter.frequency.value = 300;
    } else if (trackKey === 'underwater') {
      filter.type = 'lowpass';
      filter.frequency.value = 180;
    }

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    gainNode.gain.setValueAtTime(this.tracks[trackKey].volume, this.ctx.currentTime);
    whiteNoise.start();

    this.tracks[trackKey].node = whiteNoise;
    this.tracks[trackKey].gain = gainNode;
  }

  toggleTrack(trackKey) {
    if (!this.tracks[trackKey]) return false;
    this.initContext();

    const track = this.tracks[trackKey];
    if (track.isPlaying) {
      if (track.node) {
        try { track.node.stop(); } catch (e) {}
        track.node = null;
      }
      track.isPlaying = false;
    } else {
      this.createNoiseNode(trackKey);
      track.isPlaying = true;
    }
    return track.isPlaying;
  }

  setVolume(trackKey, volume) {
    if (!this.tracks[trackKey]) return;
    const num = typeof volume === 'number' && Number.isFinite(volume) ? volume : 0;
    const clamped = Math.max(0, Math.min(1, num));
    this.tracks[trackKey].volume = clamped;

    if (this.tracks[trackKey].gain && this.ctx) {
      this.tracks[trackKey].gain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
  }

  playPreset(presetName) {
    const config = this.presets[presetName];
    if (!config) return;

    this.initContext();

    Object.keys(config).forEach((trackKey) => {
      const setting = config[trackKey];
      this.setVolume(trackKey, setting.volume);

      if (setting.playing && setting.volume > 0) {
        if (!this.tracks[trackKey].isPlaying) {
          this.createNoiseNode(trackKey);
          this.tracks[trackKey].isPlaying = true;
        }
      } else {
        if (this.tracks[trackKey].isPlaying) {
          if (this.tracks[trackKey].node) {
            try { this.tracks[trackKey].node.stop(); } catch (e) {}
            this.tracks[trackKey].node = null;
          }
          this.tracks[trackKey].isPlaying = false;
        }
      }
    });
  }

  // Switch and play Curated Category with clean stop of previous track
  playCuratedCategory(categoryId) {
    const cat = CURATED_AUDIO_REGISTRY[categoryId];
    if (!cat) return;

    this.initContext();

    // Cleanly stop previous active curated category audio
    if (this.activeCuratedAudioNode) {
      try {
        this.activeCuratedAudioNode.pause();
        this.activeCuratedAudioNode.currentTime = 0;
      } catch (e) {}
      this.activeCuratedAudioNode = null;
    }

    this.currentCuratedCategoryId = categoryId;

    // Load category's ambient layers into current soundscape
    if (cat.ambientLayers) {
      Object.keys(cat.ambientLayers).forEach((trackKey) => {
        const vol = cat.ambientLayers[trackKey];
        this.setVolume(trackKey, vol);
        if (vol > 0) {
          if (!this.tracks[trackKey].isPlaying) {
            this.createNoiseNode(trackKey);
            this.tracks[trackKey].isPlaying = true;
          }
        } else {
          if (this.tracks[trackKey].isPlaying) {
            if (this.tracks[trackKey].node) {
              try { this.tracks[trackKey].node.stop(); } catch (e) {}
              this.tracks[trackKey].node = null;
            }
            this.tracks[trackKey].isPlaying = false;
          }
        }
      });
    }
  }

  stopCuratedAudio() {
    if (this.activeCuratedAudioNode) {
      try {
        this.activeCuratedAudioNode.pause();
        this.activeCuratedAudioNode.currentTime = 0;
      } catch (e) {}
      this.activeCuratedAudioNode = null;
    }
    this.currentCuratedCategoryId = null;
  }

  playAll() {
    this.initContext();
    let startedAny = false;
    Object.keys(this.tracks).forEach((trackKey) => {
      const track = this.tracks[trackKey];
      if (track.volume > 0) {
        if (!track.isPlaying) {
          this.createNoiseNode(trackKey);
          track.isPlaying = true;
        }
        startedAny = true;
      }
    });
    return startedAny;
  }

  pauseAll() {
    Object.keys(this.tracks).forEach((trackKey) => {
      const track = this.tracks[trackKey];
      if (track.isPlaying) {
        if (track.node) {
          try { track.node.stop(); } catch (e) {}
          track.node = null;
        }
        track.isPlaying = false;
      }
    });
    this.stopCuratedAudio();
  }

  stopAll() {
    this.pauseAll();
  }

  setMute(isMuted) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(isMuted ? 0 : 1, this.ctx.currentTime);
    }
  }
}

export const ambientPlayer = new AmbientPlayer();

/**
 * Global Environment Audio Manager for The Pearl Club
 * Provides a subtle underwater ambient layer mapped to the active environment theme.
 * Strictly decoupled from the Music page sound mixer.
 */

class EnvironmentAudioPlayer {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isAudioEnabled = true;
    this.volume = 0.12; // Default 12% subtle low volume
    this.currentTheme = 'Ocean';
    this.isStarted = false;

    // Web Audio Nodes
    this.noiseSource = null;
    this.filterNode = null;
    this.gainNode = null;
    this.rainFilterNode = null;
    this.rainGainNode = null;

    this.hasUserInteracted = false;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.updateMasterVolume();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  updateMasterVolume() {
    if (this.masterGain && this.ctx) {
      const targetVol = this.isAudioEnabled ? this.volume : 0;
      this.masterGain.gain.setValueAtTime(targetVol, this.ctx.currentTime);
    }
  }

  setupNoiseNodes() {
    if (!this.ctx || this.isStarted) return;

    try {
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = 3 * sampleRate;
      const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const output = buffer.getChannelData(0);

      // Pink/Brown noise curve for deep underwater feel
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];

        // Soften peak amplitude
        output[i] *= 0.5;
      }

      this.noiseSource = this.ctx.createBufferSource();
      this.noiseSource.buffer = buffer;
      this.noiseSource.loop = true;

      // Primary Lowpass Filter (Underwater Ambience)
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.value = 160;

      // Primary Gain Node
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0.8;

      // Secondary Rain Filter Node (For Rainy Ocean Theme)
      this.rainFilterNode = this.ctx.createBiquadFilter();
      this.rainFilterNode.type = 'bandpass';
      this.rainFilterNode.frequency.value = 1200;
      this.rainFilterNode.Q.value = 0.8;

      this.rainGainNode = this.ctx.createGain();
      this.rainGainNode.gain.value = 0;

      // Connections
      this.noiseSource.connect(this.filterNode);
      this.filterNode.connect(this.gainNode);
      this.gainNode.connect(this.masterGain);

      this.noiseSource.connect(this.rainFilterNode);
      this.rainFilterNode.connect(this.rainGainNode);
      this.rainGainNode.connect(this.masterGain);

      this.noiseSource.start();
      this.isStarted = true;
      this.applyThemeAudio(this.currentTheme);
    } catch (e) {
      console.warn('[EnvironmentAudio] Could not start Web Audio synthesis:', e);
    }
  }

  applyThemeAudio(themeName) {
    this.currentTheme = themeName;
    if (!this.ctx || !this.isStarted) return;

    const time = this.ctx.currentTime;

    if (themeName === 'Rainy Ocean') {
      // Soft underwater low-pass + subtle rain water layer
      this.filterNode.frequency.setValueAtTime(220, time);
      this.gainNode.gain.setValueAtTime(0.6, time);
      this.rainGainNode.gain.setValueAtTime(0.25, time);
    } else if (themeName === 'Underwater') {
      // Deep low-frequency underwater loop
      this.filterNode.frequency.setValueAtTime(140, time);
      this.gainNode.gain.setValueAtTime(1.0, time);
      this.rainGainNode.gain.setValueAtTime(0, time);
    } else {
      // Standard Ocean Theme: Gentle underwater ambient reef curve
      this.filterNode.frequency.setValueAtTime(180, time);
      this.gainNode.gain.setValueAtTime(0.8, time);
      this.rainGainNode.gain.setValueAtTime(0, time);
    }
  }

  start(themeName = 'Ocean') {
    this.currentTheme = themeName;
    this.initContext();

    if (!this.isStarted) {
      this.setupNoiseNodes();
    } else {
      this.applyThemeAudio(themeName);
    }
  }

  setAudioEnabled(enabled) {
    this.isAudioEnabled = Boolean(enabled);
    if (this.isAudioEnabled) {
      this.initContext();
      if (!this.isStarted) {
        this.setupNoiseNodes();
      }
    }
    this.updateMasterVolume();
  }

  setVolume(vol) {
    const num = typeof vol === 'number' && Number.isFinite(vol) ? vol : 0;
    this.volume = Math.max(0, Math.min(1, num));
    this.updateMasterVolume();
  }

  setTheme(themeName) {
    this.currentTheme = themeName;
    this.applyThemeAudio(themeName);
  }
}

export const environmentAudioPlayer = new EnvironmentAudioPlayer();

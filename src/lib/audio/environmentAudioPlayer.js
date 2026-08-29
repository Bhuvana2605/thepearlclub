/**
 * Global Environment Audio Manager for The Pearl Club
 * Provides a rich, soothing site-wide ambient layer mapped to the active environment theme.
 * Strictly decoupled from the Music page sound mixer.
 */

class EnvironmentAudioPlayer {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isAudioEnabled = true;
    this.volume = 0.70; // High clarity audible default (70%)
    this.currentTheme = 'Ocean';
    this.isStarted = false;

    // Web Audio Nodes
    this.noiseSource = null;
    this.filterNode = null;
    this.gainNode = null;
    this.rainFilterNode = null;
    this.rainGainNode = null;
    this.lfoOsc = null;
    this.lfoGain = null;

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
      const bufferSize = 4 * sampleRate; // 4 second seamless loop
      const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const output = buffer.getChannelData(0);

      // High-quality Paul Kellett Pink Noise algorithm for warm, rich acoustic resonance
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;
        output[i] = pink * 0.12; // Normalized RMS ~0.25 (Rich, full-spectrum acoustic energy)
      }

      this.noiseSource = this.ctx.createBufferSource();
      this.noiseSource.buffer = buffer;
      this.noiseSource.loop = true;

      // Primary Lowpass Filter (Warm Ocean / Underwater Ambience)
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.value = 520; // Opened up from 160Hz -> 520Hz for clear audibility
      this.filterNode.Q.value = 1.0;

      // Primary Gain Node
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 1.2;

      // Secondary Rain Filter Node (For Rainy Ocean Theme)
      this.rainFilterNode = this.ctx.createBiquadFilter();
      this.rainFilterNode.type = 'bandpass';
      this.rainFilterNode.frequency.value = 1800; // Bright rain frequency
      this.rainFilterNode.Q.value = 0.7;

      this.rainGainNode = this.ctx.createGain();
      this.rainGainNode.gain.value = 0;

      // Gentle LFO for natural ocean tide / swell dynamics
      this.lfoOsc = this.ctx.createOscillator();
      this.lfoOsc.frequency.value = 0.14; // ~7 second wave swell cycle
      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.value = 120; // Modulates lowpass filter frequency between 400Hz and 640Hz

      this.lfoOsc.connect(this.lfoGain);
      this.lfoGain.connect(this.filterNode.frequency);
      this.lfoOsc.start();

      // Audio Graph Connections
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
      // Warm ocean tide low-pass + crisp rainfall layer
      this.filterNode.frequency.setValueAtTime(580, time);
      this.gainNode.gain.setValueAtTime(1.1, time);
      this.rainGainNode.gain.setValueAtTime(0.80, time);
    } else if (themeName === 'Underwater') {
      // Deep resonant underwater sanctuary loop
      this.filterNode.frequency.setValueAtTime(420, time);
      this.gainNode.gain.setValueAtTime(1.4, time);
      this.rainGainNode.gain.setValueAtTime(0, time);
    } else {
      // Standard Ocean Theme: Clear rolling ocean waves ambience
      this.filterNode.frequency.setValueAtTime(520, time);
      this.gainNode.gain.setValueAtTime(1.2, time);
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

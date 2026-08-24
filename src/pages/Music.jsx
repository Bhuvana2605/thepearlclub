import React, { useState } from 'react';
import { useSanctuary } from '../context/SanctuaryContext';
import { formatVolume } from '../lib/audio/ambientPlayer';
import { CURATED_AUDIO_REGISTRY } from '../data/curatedAudio';

export const Music = () => {
  const {
    soundState,
    toggleSoundTrack,
    setSoundVolume,
    playPreset,
    playAllSounds,
    pauseAllSounds,
    setGlobalMute,
    curatedAudioState,
    selectCuratedCategory
  } = useSanctuary();

  const [spotifyStatus, setSpotifyStatus] = useState('idle');

  const presets = [
    { name: 'Calm', description: 'Gentle ocean swell & deep water resonance', config: 'Waves 60% • Rain 35% • Wind 15% • Underwater 10%' },
    { name: 'Focus', description: 'Rhythmic soft rain & soothing sea rhythm', config: 'Rain 60% • Waves 20% • Underwater 15% • Wind 10%' },
    { name: 'Ambient', description: 'Full immersive submersed sanctuary texture', config: 'Underwater 90% • Waves 35% • Rain 20% • Wind 10%' },
    { name: 'Lo-fi', description: 'Mellow chill beats & soft ocean surf', config: 'Waves 35% • Rain 50% • Wind 10% • Underwater 0%' }
  ];

  const tracks = [
    { id: 'waves', label: 'Waves', icon: 'water' },
    { id: 'rain', label: 'Rain', icon: 'rainy' },
    { id: 'wind', label: 'Wind', icon: 'air' },
    { id: 'underwater', label: 'Underwater', icon: 'scuba_diving' }
  ];

  const isAnyPlaying = tracks.some((t) => soundState[t.id]?.playing);

  const handleConnectSpotify = () => {
    setSpotifyStatus('connecting');
    setTimeout(() => {
      setSpotifyStatus('unavailable');
    }, 800);
  };

  return (
    <main className="relative z-10 w-full min-h-[85vh] flex flex-col items-center justify-center pt-24 pb-32 px-organic-padding md:px-bubble-margin">
      <div className="w-full max-w-2xl bg-white/20 backdrop-blur-xl border border-white/40 rounded-[2rem] p-8 md:p-12 shadow-2xl flex flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-1">Atmosphere</h1>
          <p className="font-body-md text-on-surface-variant/80">Blend your perfect sanctuary soundscape.</p>
        </div>

        {/* SECTION 1: MASTER PRESETS */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-2">
            <h2 className="font-label-sm text-xs text-primary uppercase tracking-widest font-semibold">Presets</h2>
            <button
              onClick={() => setGlobalMute(!soundState.isMuted)}
              className="text-primary font-label-sm text-xs hover:underline flex items-center gap-1 font-semibold"
            >
              <span className="material-symbols-outlined text-sm">
                {soundState.isMuted ? 'volume_off' : 'volume_up'}
              </span>
              {soundState.isMuted ? 'Unmute All' : 'Mute All'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {presets.map((p) => {
              const isActivePreset = soundState.activePreset === p.name;

              return (
                <div
                  key={p.name}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isActivePreset
                      ? 'bg-secondary-container/70 border-secondary text-on-secondary-container shadow-md'
                      : 'bg-white/30 border-white/40 text-on-surface-variant hover:bg-white/40'
                  }`}
                >
                  <div>
                    <h3 className="font-headline-md text-headline-md text-base font-semibold">{p.name}</h3>
                    <p className="font-label-sm text-[11px] opacity-80 mt-0.5">{p.description}</p>
                    <p className="font-label-sm text-[10px] text-primary/80 font-mono mt-1">{p.config}</p>
                  </div>

                  <button
                    onClick={() => playPreset(p.name)}
                    className={`py-2 px-4 rounded-full font-label-sm text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                      isActivePreset
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-white/60 text-primary hover:bg-white/90'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {isActivePreset ? 'pause' : 'play_arrow'}
                    </span>
                    {isActivePreset ? 'Preset Active' : `Play ${p.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <hr className="border-white/20" />

        {/* SECTION 2: INDIVIDUAL AMBIENT SOUND LAYERS */}
        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-center px-2">
            <h2 className="font-label-sm text-xs text-primary uppercase tracking-widest font-semibold">
              Ambient Sound Layers
            </h2>
            {soundState.activePreset && (
              <span className="font-label-sm text-xs text-secondary bg-secondary-container/60 px-3 py-0.5 rounded-full border border-secondary/30 font-semibold">
                Preset: {soundState.activePreset}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {tracks.map((track) => {
              const trackId = track.id;
              const state = soundState[trackId] || { playing: false, volume: 0.5 };
              const displayPercentage = formatVolume(state.volume);

              return (
                <div
                  key={trackId}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    state.playing
                      ? 'bg-white/40 border border-white/50 shadow-sm'
                      : 'hover:bg-white/20'
                  }`}
                >
                  <button
                    onClick={() => toggleSoundTrack(trackId)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${
                      state.playing
                        ? 'bg-primary text-white shadow-inner-glow'
                        : 'bg-white/40 text-on-surface-variant'
                    }`}
                    title={state.playing ? `Pause ${track.label}` : `Play ${track.label}`}
                  >
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: state.playing ? "'FILL' 1" : "'FILL' 0" }}>
                      {state.playing ? 'pause' : 'play_arrow'}
                    </span>
                  </button>

                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className={`font-body-lg text-body-lg ${state.playing ? 'text-primary font-semibold' : 'text-on-surface'}`}>
                        {track.label}
                      </span>
                      <span className="font-label-sm text-xs text-outline font-semibold font-mono">
                        {displayPercentage}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={state.volume}
                      onChange={(e) => setSoundVolume(trackId, Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  <span className={`material-symbols-outlined ${state.playing ? 'text-primary' : 'text-outline'}`}>
                    {track.icon}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Universal Play All / Pause All */}
          <div className="mt-2 flex justify-center">
            {isAnyPlaying || soundState.isPlayingAll ? (
              <button
                onClick={pauseAllSounds}
                className="px-8 py-3 rounded-full bg-secondary text-white font-label-sm text-xs font-semibold shadow-md hover:bg-secondary/90 transition-transform active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  pause
                </span>
                Pause Current Soundscape
              </button>
            ) : (
              <button
                onClick={playAllSounds}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-label-sm text-xs font-semibold shadow-md hover:scale-105 transition-transform active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_arrow
                </span>
                Play Current Soundscape
              </button>
            )}
          </div>
        </div>

        <hr className="border-white/20" />

        {/* SECTION 3: DATA-DRIVEN CURATED AUDIO CATEGORIES */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-2">
            <h2 className="font-label-sm text-xs text-primary uppercase tracking-widest font-semibold">
              Curated Audio Categories
            </h2>
            {curatedAudioState.isPlaying && (
              <span className="font-label-sm text-xs text-emerald-700 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-200 font-semibold animate-pulse">
                Active Category: {CURATED_AUDIO_REGISTRY[curatedAudioState.activeCategoryId]?.name}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5">
            {Object.keys(CURATED_AUDIO_REGISTRY).map((catId) => {
              const cat = CURATED_AUDIO_REGISTRY[catId];
              const isSelected = curatedAudioState.activeCategoryId === catId;
              const isPlayingThis = isSelected && curatedAudioState.isPlaying;

              return (
                <button
                  key={cat.id}
                  onClick={() => selectCuratedCategory(cat.id)}
                  className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all border ${
                    isPlayingThis
                      ? 'bg-primary text-white border-primary shadow-md scale-105 font-semibold'
                      : isSelected
                      ? 'bg-secondary-container/80 text-on-secondary-container border-secondary shadow-sm font-semibold'
                      : 'bg-white/30 text-on-surface-variant border-white/40 hover:bg-white/60'
                  }`}
                  title={cat.description}
                >
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: isPlayingThis ? "'FILL' 1" : "'FILL' 0" }}>
                    {cat.icon}
                  </span>
                  <span className="font-label-sm text-xs">{cat.name}</span>
                  <span className="text-[10px] opacity-75">{isPlayingThis ? 'Playing' : 'Select'}</span>
                </button>
              );
            })}
          </div>
        </div>

        <hr className="border-white/20" />

        {/* SECTION 4: PERSONAL MUSIC (SPOTIFY FALLBACK) */}
        <div className="flex flex-col gap-3 p-5 rounded-2xl bg-white/30 border border-white/40 shadow-inner">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-headline-md text-headline-md text-primary text-base font-semibold">Personal Music</h2>
              <p className="font-label-sm text-xs text-on-surface-variant">
                Optionally connect your personal Spotify audio experience.
              </p>
            </div>
            <span className="material-symbols-outlined text-emerald-600 text-2xl">graphic_eq</span>
          </div>

          {spotifyStatus === 'unavailable' ? (
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 font-label-sm text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">info</span>
              Spotify connection is unavailable right now. (Ambient audio remains fully functional)
            </div>
          ) : (
            <button
              onClick={handleConnectSpotify}
              disabled={spotifyStatus === 'connecting'}
              className="mt-1 py-2.5 px-5 rounded-full bg-emerald-600 text-white font-label-sm text-xs font-semibold shadow hover:bg-emerald-700 transition-transform active:scale-95 flex items-center justify-center gap-2 w-fit"
            >
              <span className="material-symbols-outlined text-sm">radio</span>
              {spotifyStatus === 'connecting' ? 'Checking Connection...' : 'Connect Spotify'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

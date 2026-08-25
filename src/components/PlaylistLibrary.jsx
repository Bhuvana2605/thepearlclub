import React, { useState, useEffect } from 'react';

const DEFAULT_OCEAN_PLAYLISTS = [
  {
    id: 'deep-focus',
    name: 'Deep Focus Lofi',
    icon: '🌊',
    desc: 'Ambient beats for deep immersion',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXbcPC6Vvqudd?utm_source=generator&theme=0'
  },
  {
    id: 'sanctuary-chill',
    name: 'Sanctuary Chill',
    icon: '🦪',
    desc: 'Gentle ocean acoustics & relaxation',
    embedUrl: 'https://open.spotify.com/embed/playlist/11nSleISOWGLboWVWPDuwB?utm_source=generator&theme=0'
  },
  {
    id: 'ocean-waves-beats',
    name: 'Ocean Waves & Beats',
    icon: '🎧',
    desc: 'Submerged rhythms & chill vibes',
    embedUrl: 'https://open.spotify.com/embed/playlist/7o2W8HWWiozS25FZHqSNwQ?utm_source=generator&theme=0'
  },
  {
    id: 'peaceful-study',
    name: 'Peaceful Study',
    icon: '📖',
    desc: 'Calm melodies & quiet focus',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLK5wjKyhVm?utm_source=generator&theme=0'
  }
];

// Helper to convert Spotify or YouTube links into valid embed URLs
export function formatEmbedUrl(rawUrl) {
  if (!rawUrl) return null;
  let url = rawUrl.trim();

  // Spotify Playlist/Track/Album
  if (url.includes('spotify.com')) {
    if (!url.includes('/embed/')) {
      url = url.replace('spotify.com/', 'spotify.com/embed/');
    }
    if (!url.includes('utm_source=')) {
      const sep = url.includes('?') ? '&' : '?';
      url += `${sep}utm_source=generator&theme=0`;
    }
    return url;
  }

  // YouTube Playlist
  if (url.includes('youtube.com/playlist') || url.includes('list=')) {
    const listMatch = url.match(/[?&]list=([^&]+)/);
    if (listMatch) {
      return `https://www.youtube.com/embed/videoseries?list=${listMatch[1]}`;
    }
  }

  // YouTube Video (watch?v= or youtu.be/)
  if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else {
      const vMatch = url.match(/[?&]v=([^&]+)/);
      if (vMatch) videoId = vMatch[1];
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
  }

  // Raw embed / URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return null;
}

export const PlaylistLibrary = () => {
  const [customPlaylists, setCustomPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem('pearl_custom_playlists');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activePlaylist, setActivePlaylist] = useState(DEFAULT_OCEAN_PLAYLISTS[0]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [customNameInput, setCustomNameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('pearl_custom_playlists', JSON.stringify(customPlaylists));
    } catch (e) {
      console.error(e);
    }
  }, [customPlaylists]);

  const allPlaylists = [...DEFAULT_OCEAN_PLAYLISTS, ...customPlaylists];

  const handleAddCustom = (e) => {
    e.preventDefault();
    setErrorMsg(null);
    const formatted = formatEmbedUrl(customUrlInput);

    if (!formatted) {
      setErrorMsg('Please enter a valid Spotify or YouTube link.');
      return;
    }

    const newObj = {
      id: `custom-${Date.now()}`,
      name: customNameInput.trim() || 'My Custom Stream',
      icon: customUrlInput.includes('youtube') || customUrlInput.includes('youtu.be') ? '▶️' : '🎵',
      desc: customUrlInput.includes('youtube') ? 'Custom YouTube Stream' : 'Custom Spotify Stream',
      embedUrl: formatted
    };

    setCustomPlaylists((prev) => [newObj, ...prev]);
    setActivePlaylist(newObj);
    setCustomUrlInput('');
    setCustomNameInput('');
    setShowCustomModal(false);
  };

  const handleDeleteCustom = (idToDelete) => {
    setCustomPlaylists((prev) => prev.filter((p) => p.id !== idToDelete));
    if (activePlaylist.id === idToDelete) {
      setActivePlaylist(DEFAULT_OCEAN_PLAYLISTS[0]);
    }
  };

  return (
    <div className="w-full max-w-lg glass-panel rounded-3xl p-8 md:p-10 shadow-2xl border border-white/60 text-center flex flex-col items-center gap-6 relative overflow-hidden animate-fade-in">
      {/* Header & Title */}
      <div className="w-full flex flex-col items-center gap-2">
        <div className="w-full flex justify-between items-center">
          <span className="font-label-sm text-xs text-primary font-semibold uppercase tracking-widest bg-primary-container/40 px-3.5 py-1 rounded-full border border-primary-container/30">
            SANCTUARY AUDIO
          </span>

          <button
            onClick={() => setShowCustomModal(!showCustomModal)}
            className="px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white text-primary border border-white/80 font-label-sm text-xs font-semibold shadow-sm transition-all flex items-center gap-1 hover:scale-105"
          >
            <span className="material-symbols-outlined text-sm">add_link</span>
            + Connect Link
          </button>
        </div>

        <h2 className="font-headline-lg text-headline-lg text-primary text-2xl md:text-3xl font-bold tracking-tight mt-1">
          Ambient Soundtracks
        </h2>
        <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-xs">
          Select lofi beats or connect your custom Spotify & YouTube playlists.
        </p>
      </div>

      {/* Custom Playlist Modal Drawer */}
      {showCustomModal && (
        <form onSubmit={handleAddCustom} className="w-full p-4 rounded-2xl bg-white/80 border border-white/80 flex flex-col gap-3 shadow-md animate-fade-in text-left">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-primary">link</span>
              Connect Custom Link
            </span>
            <button
              type="button"
              onClick={() => setShowCustomModal(false)}
              className="text-xs text-on-surface-variant hover:text-primary"
            >
              Cancel
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Name (e.g. My Beats)..."
              value={customNameInput}
              onChange={(e) => setCustomNameInput(e.target.value)}
              className="bg-white border border-white/80 rounded-xl px-3 py-1.5 text-xs text-on-surface focus:outline-none"
            />
            <input
              type="url"
              required
              placeholder="Paste Spotify or YouTube URL..."
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              className="flex-1 bg-white border border-white/80 rounded-xl px-3 py-1.5 text-xs text-on-surface focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold shadow hover:bg-primary/90 transition-all active:scale-95 shrink-0"
            >
              Add
            </button>
          </div>
          {errorMsg && <p className="text-[11px] text-error font-medium">{errorMsg}</p>}
        </form>
      )}

      {/* Soundtrack Pill Category Selector */}
      <div className="flex flex-wrap justify-center gap-2 w-full">
        {allPlaylists.map((cat) => {
          const isActive = activePlaylist.id === cat.id;
          const isCustom = cat.id.startsWith('custom-');

          return (
            <div key={cat.id} className="inline-flex items-center">
              <button
                type="button"
                onClick={() => setActivePlaylist(cat)}
                className={`px-4 py-2 rounded-full font-label-sm text-xs transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary text-white shadow-md font-semibold'
                    : 'bg-white/40 text-on-surface-variant hover:bg-white/70 hover:text-primary'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>

                {isCustom && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCustom(cat.id);
                    }}
                    title="Delete playlist"
                    className="ml-1 p-0.5 rounded-full hover:bg-white/30 text-white/80 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Embedded Player Frame */}
      <div className="w-full h-[360px] rounded-2xl overflow-hidden shadow-md bg-slate-900 border border-white/40">
        <iframe
          key={activePlaylist.id}
          src={activePlaylist.embedUrl}
          title={activePlaylist.name}
          width="100%"
          height="360"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="w-full h-full border-0 rounded-2xl"
        />
      </div>
    </div>
  );
};

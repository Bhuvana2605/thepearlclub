import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSanctuary } from '../context/SanctuaryContext';
import { TodoModal } from './TodoModal';

export const BottomNavBar = () => {
  const location = useLocation();
  const { activePanel, togglePanel } = useSanctuary();
  const [shareNotice, setShareNotice] = useState(false);

  if (location.pathname === '/do-nothing' || location.pathname === '/focus-aquarium' || location.pathname.startsWith('/auth') || location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'The Pearl Club - Sanctuary',
        text: 'A calming digital sanctuary when your mind feels messy.',
        url: window.location.origin,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin);
      setShareNotice(true);
      setTimeout(() => setShareNotice(false), 2500);
    }
  };

  const isTodoOpen = activePanel === 'todo';

  return (
    <>
      <nav className="fixed bottom-safe-area left-0 w-full px-4 md:px-bubble-margin flex justify-between items-end z-40 bg-transparent pointer-events-none pb-2">
        {/* Left Cluster */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={() => togglePanel('todo')}
            aria-label="To-Do"
            className={`backdrop-blur-md rounded-full p-3.5 md:p-4 hover:translate-y-[-4px] transition-all flex items-center justify-center border border-white/30 shadow-sm ${
              isTodoOpen ? 'bg-secondary-container text-on-secondary-container' : 'bg-white/30 text-on-surface-variant'
            }`}
            title="Rule of 3 To-Do"
          >
            <span className="material-symbols-outlined">checklist</span>
          </button>

          <NavLink
            to="/journal"
            aria-label="Journal"
            className={({ isActive }) =>
              `backdrop-blur-md rounded-full p-3.5 md:p-4 hover:translate-y-[-4px] transition-transform flex items-center justify-center border border-white/30 shadow-sm ${
                isActive ? 'bg-secondary-container text-on-secondary-container' : 'bg-white/30 text-on-surface-variant'
              }`
            }
            title="Chronicle Journal"
          >
            <span className="material-symbols-outlined">edit_note</span>
          </NavLink>

          <NavLink
            to="/music"
            aria-label="Music"
            className={({ isActive }) =>
              `backdrop-blur-md rounded-full p-3.5 md:p-4 hover:translate-y-[-4px] transition-transform flex items-center justify-center border border-white/30 shadow-sm ${
                isActive ? 'bg-secondary-container text-on-secondary-container' : 'bg-white/30 text-on-surface-variant'
              }`
            }
            title="Music & Sounds"
          >
            <span className="material-symbols-outlined">music_note</span>
          </NavLink>

          <NavLink
            to="/small-things"
            aria-label="Small Things That Help"
            className={({ isActive }) =>
              `backdrop-blur-md rounded-full p-3.5 md:p-4 hover:translate-y-[-4px] transition-transform flex items-center justify-center border border-white/30 shadow-sm ${
                isActive ? 'bg-secondary-container text-on-secondary-container' : 'bg-white/30 text-on-surface-variant'
              }`
            }
            title="Small Things That Help"
          >
            <span className="material-symbols-outlined">self_care</span>
          </NavLink>
        </div>

        {/* Central FAB: Soft White Pearl Home Icon (/assets/collectibles/pearl.png) */}
        <div className="hidden md:flex flex-col items-center justify-center relative -top-1 pointer-events-auto">
          <NavLink
            to="/"
            aria-label="Home"
            className="w-13 h-13 p-2.5 rounded-full bg-gradient-to-br from-white/90 via-sky-100/80 to-white/90 pearl-glow flex items-center justify-center hover:scale-105 transition-transform shadow-lg border border-white/80"
            title="Home"
          >
            <img
              src="/assets/collectibles/pearl.png"
              alt="Home"
              className="w-7 h-7 object-contain drop-shadow-sm"
            />
          </NavLink>
        </div>

        {/* Right Cluster */}
        <div className="flex gap-2 pointer-events-auto">
          <NavLink
            to="/feed"
            aria-label="Pearl Club Feed"
            className={({ isActive }) =>
              `backdrop-blur-md rounded-full p-3.5 md:p-4 hover:translate-y-[-4px] transition-transform flex items-center justify-center border border-white/30 shadow-sm ${
                isActive ? 'bg-secondary-container text-on-secondary-container' : 'bg-white/30 text-on-surface-variant'
              }`
            }
            title="Pearl Club Feed"
          >
            <span className="material-symbols-outlined">forum</span>
          </NavLink>

          <NavLink
            to="/bottle"
            aria-label="Message in a Bottle"
            className={({ isActive }) =>
              `backdrop-blur-md rounded-full p-3.5 md:p-4 hover:translate-y-[-4px] transition-transform flex items-center justify-center border border-white/30 shadow-sm ${
                isActive ? 'bg-secondary-container text-on-secondary-container' : 'bg-white/30 text-on-surface-variant'
              }`
            }
            title="Message in a Bottle"
          >
            <span className="material-symbols-outlined">sailing</span>
          </NavLink>

          <NavLink
            to="/settings"
            aria-label="Settings"
            className={({ isActive }) =>
              `backdrop-blur-md rounded-full p-3.5 md:p-4 hover:translate-y-[-4px] transition-transform flex items-center justify-center border border-white/30 shadow-sm ${
                isActive ? 'bg-secondary-container text-on-secondary-container' : 'bg-white/30 text-on-surface-variant'
              }`
            }
            title="Settings"
          >
            <span className="material-symbols-outlined">settings</span>
          </NavLink>

          <button
            onClick={handleShare}
            aria-label="Share"
            className="bg-white/30 backdrop-blur-md text-on-surface-variant rounded-full p-3.5 md:p-4 hover:translate-y-[-4px] transition-transform flex items-center justify-center border border-white/30 shadow-sm relative"
            title="Share Sanctuary"
          >
            <span className="material-symbols-outlined">share</span>
            {shareNotice && (
              <span className="absolute -top-10 right-0 bg-primary text-white text-xs px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                Link copied!
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Compact To-Do Modal */}
      <TodoModal isOpen={isTodoOpen} onClose={() => togglePanel('todo')} />
    </>
  );
};

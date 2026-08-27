import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export const SideNavBar = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (location.pathname === '/do-nothing') return null;

  const groupedLinks = [
    {
      category: 'Main experiences',
      items: [
        { to: '/', label: 'Home', icon: 'home' },
        { to: '/journal', label: 'Journal', icon: 'edit_note' },
        { to: '/games', label: 'Games', icon: 'videogame_asset' },
      ]
    },
    {
      category: 'Connect & Explore',
      items: [
        { to: '/bottle', label: 'Message in a Bottle', icon: 'sailing' },
        { to: '/feed', label: 'Feed', icon: 'forum' },
      ]
    },
    {
      category: 'Wellbeing',
      items: [
        { to: '/small-things', label: 'Small Things That Help', icon: 'self_care' },
        { to: '/do-nothing', label: 'Do Nothing', icon: 'visibility' },
      ]
    },
    {
      category: 'Personal',
      items: [
        { to: '/settings', label: 'Settings', icon: 'settings' },
      ]
    }
  ];

  return (
    <nav className="hidden md:flex fixed right-float-gap top-1/2 -translate-y-1/2 z-40 items-end">
      {/* CLOSED COMPACT STRIP */}
      {!isExpanded ? (
        <div className="rounded-full py-3 px-2 glass-panel flex flex-col items-center gap-3 border border-white/40 shadow-xl transition-all">
          {/* Menu Toggle / Expand Button */}
          <button
            onClick={() => setIsExpanded(true)}
            className="p-2.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all flex items-center justify-center"
            title="Expand Navigation Menu"
            aria-label="Expand Navigation Menu"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          <div className="w-6 h-[1px] bg-white/40 my-1" />

          {/* Quick Shortcuts in Closed Strip */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `p-2.5 rounded-full flex items-center justify-center transition-all ${
                isActive ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-white/40'
              }`
            }
            title="Home"
          >
            <span className="material-symbols-outlined text-xl">home</span>
          </NavLink>

          <NavLink
            to="/focus"
            className={({ isActive }) =>
              `p-2.5 rounded-full flex items-center justify-center transition-all ${
                isActive ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-white/40'
              }`
            }
            title="Focus"
          >
            <span className="material-symbols-outlined text-xl">center_focus_strong</span>
          </NavLink>

          <NavLink
            to="/world"
            className={({ isActive }) =>
              `p-2.5 rounded-full flex items-center justify-center transition-all ${
                isActive ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-white/40'
              }`
            }
            title="Your Little World"
          >
            <span className="material-symbols-outlined text-xl">waves</span>
          </NavLink>
        </div>
      ) : (
        /* EXPANDED FULL SIDEBAR DRAWER */
        <div className="w-64 glass-panel-opaque rounded-3xl p-5 shadow-2xl flex flex-col gap-4 border border-white/60 dark:border-slate-800 animate-fade-in max-h-[85vh] overflow-y-auto">
          {/* Header & Collapse Toggle */}
          <div className="flex items-center justify-between border-b border-gray-200/50 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2 text-primary dark:text-teal-300 font-semibold text-sm">
              <span className="material-symbols-outlined text-xl">auto_awesome</span>
              <span className="dark:text-white">Haven Navigation</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1.5 rounded-full hover:bg-gray-100/60 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition-colors"
              title="Collapse Menu"
              aria-label="Collapse Navigation Menu"
            >
              <span className="material-symbols-outlined text-xl">menu_open</span>
            </button>
          </div>

          {/* Grouped Link Sections */}
          <div className="flex flex-col gap-4">
            {groupedLinks.map((group) => (
              <div key={group.category} className="flex flex-col gap-1">
                <span className="font-label-sm text-[10px] uppercase tracking-widest text-primary/70 dark:text-teal-400 font-bold px-2">
                  {group.category}
                </span>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsExpanded(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-primary dark:bg-teal-600 text-white shadow-sm font-semibold'
                          : 'text-on-surface-variant dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/80 hover:text-primary dark:hover:text-teal-300'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

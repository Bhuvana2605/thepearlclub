import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export const SideNavBar = () => {
  const location = useLocation();
  if (location.pathname === '/do-nothing') return null;

  const links = [
    { to: '/do-nothing', label: 'Eye', icon: 'visibility' },
    { to: '/focus', label: 'Focus', icon: 'center_focus_strong' },
    { to: '/games', label: 'Games', icon: 'videogame_asset' },
    { to: '/world', label: 'Your Little World', icon: 'waves' },
  ];

  return (
    <nav className="hidden md:flex fixed right-float-gap top-1/2 -translate-y-1/2 rounded-full py-organic-padding bg-surface-container/40 backdrop-blur-xl border border-white/20 shadow-bubble-margin shadow-primary/5 flex-col gap-4 z-40">
      {links.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `p-3 rounded-full flex flex-col items-center gap-1 group transition-all ${
              isActive
                ? 'bg-primary-container text-on-primary-container scale-95 shadow-inner-glow'
                : 'text-on-surface-variant hover:bg-white/30'
            }`
          }
          title={item.label}
        >
          <span
            className="material-symbols-outlined group-hover:scale-110 transition-transform"
            style={{ fontVariationSettings: location.pathname === item.to ? "'FILL' 1" : "'FILL' 0" }}
          >
            {item.icon}
          </span>
          <span className="font-label-sm text-label-sm opacity-0 group-hover:opacity-100 transition-opacity absolute -left-28 bg-white/80 backdrop-blur-md px-2.5 py-1 rounded-full text-primary shadow-sm pointer-events-none whitespace-nowrap">
            {item.label}
          </span>
        </NavLink>
      ))}
    </nav>
  );
};

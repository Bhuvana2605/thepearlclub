import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { PearlClubLogo } from './brand/PearlClubLogo';

export const TopAppBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isDoNothing = location.pathname === '/do-nothing';
  const isAuth = location.pathname.startsWith('/auth') || location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/forgot-password';

  // Close mobile drawer whenever location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (isDoNothing || isAuth) return null;

  const isProfileActive = location.pathname === '/profile';

  const handleProfileClick = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (isProfileActive) {
      navigate(-1);
    } else {
      navigate('/profile');
    }
  };

  const groupedNavLinks = [
    {
      category: 'Main experiences',
      items: [
        { to: '/', label: 'Home', icon: 'home' },
        { to: '/journal', label: 'Journal', icon: 'edit_note' },
        { to: '/games', label: 'Games', icon: 'videogame_asset' },
      ],
    },
    {
      category: 'Connect & Explore',
      items: [
        { to: '/bottle', label: 'Message in a Bottle', icon: 'sailing' },
        { to: '/feed', label: 'Feed', icon: 'forum' },
      ],
    },
    {
      category: 'Wellbeing',
      items: [
        { to: '/small-things', label: 'Small Things That Help', icon: 'self_care' },
        { to: '/do-nothing', label: 'Do Nothing', icon: 'visibility' },
      ],
    },
    {
      category: 'Personal',
      items: [
        { to: '/settings', label: 'Settings', icon: 'settings' },
      ],
    },
  ];

  return (
    <>
      <header className="fixed top-0 inset-x-0 h-16 px-4 md:px-organic-padding flex items-center justify-between z-40 bg-white/20 backdrop-blur-md md:bg-transparent border-b border-white/20 md:border-none transition-all duration-300">
        {/* Left: Brand Identity */}
        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="pointer-events-auto hover:opacity-90 transition-opacity flex items-center shrink-0">
          <PearlClubLogo variant="full" size="md" />
        </Link>

        {/* Center: Mobile Standalone Pearl Home Control */}
        <div className="flex md:hidden items-center justify-center pointer-events-auto">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 flex items-center justify-center hover:scale-105 transition-transform"
            title="Pearl Home"
            aria-label="Pearl Home"
          >
            <img src="/assets/collectibles/pearl.png" alt="Home" className="w-8 h-8 object-contain drop-shadow-sm" />
          </Link>
        </div>

        {/* Right: Hamburger Menu (Mobile) + Profile Shortcut */}
        <div className="flex items-center gap-2 md:gap-3 pointer-events-auto">
          {/* Hamburger Menu (Standalone Icon - Sits immediately to the LEFT of Profile) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex md:hidden p-2 text-primary hover:opacity-80 active:scale-95 transition-opacity items-center justify-center"
            title="Toggle Menu"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-3xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          {/* Profile Toggle Button (Standalone Icon on Mobile) */}
          <button
            onClick={handleProfileClick}
            className={`p-2 transition-all flex items-center justify-center ${
              isProfileActive ? 'text-secondary scale-105' : 'text-primary hover:opacity-80 active:scale-95'
            }`}
            title="Toggle Profile"
            aria-label="Toggle Profile"
          >
            <span className="material-symbols-outlined text-3xl">account_circle</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Slide-Over Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Side Menu Panel */}
          <aside className="relative w-72 max-w-[85vw] h-full bg-white/95 backdrop-blur-2xl border-l border-white/60 shadow-2xl p-6 flex flex-col justify-between z-10 animate-slide-in-right overflow-y-auto">
            <div className="flex flex-col gap-6">
              {/* Menu Header */}
              <div className="flex items-center justify-between border-b border-gray-200/60 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                  <span className="font-headline-md text-primary font-semibold text-base">Sanctuary Menu</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex flex-col gap-4 pb-4">
                {groupedNavLinks.map((group) => (
                  <div key={group.category} className="flex flex-col gap-1">
                    <span className="font-label-sm text-[10px] uppercase tracking-widest text-primary/70 font-bold px-2 py-1">
                      {group.category}
                    </span>
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.to;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all font-label-sm text-sm font-medium ${
                            isActive
                              ? 'bg-primary text-white shadow-sm font-semibold'
                              : 'text-on-surface-variant hover:bg-white/60 hover:text-primary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xl">{item.icon}</span>
                          <span>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </div>

            {/* Bottom Footer Info */}
            <div className="pt-4 border-t border-gray-200/60 flex flex-col items-center">
              <p className="font-label-sm text-[11px] text-gray-400 text-center">
                The Pearl Club Sanctuary
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PearlClubLogo } from './brand/PearlClubLogo';

export const TopAppBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDoNothing = location.pathname === '/do-nothing';
  const isAuth = location.pathname.startsWith('/auth') || location.pathname === '/login' || location.pathname === '/signup';

  if (isDoNothing || isAuth) return null;

  const isProfileActive = location.pathname === '/profile';

  const handleProfileClick = (e) => {
    e.preventDefault();
    if (isProfileActive) {
      navigate(-1); // Toggle close
    } else {
      navigate('/profile'); // Toggle open
    }
  };

  return (
    <header className="fixed top-0 w-full flex justify-between items-center px-organic-padding pt-safe-area z-40 bg-transparent pointer-events-none transition-all duration-500">
      <Link to="/" className="pointer-events-auto hover:opacity-90 transition-opacity">
        <PearlClubLogo variant="full" size="md" />
      </Link>
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          onClick={handleProfileClick}
          className={`p-2.5 rounded-full glass-panel hover:scale-105 transition-all flex items-center justify-center ${
            isProfileActive ? 'bg-secondary-container text-on-secondary-container shadow-md' : 'text-primary'
          }`}
          title="Toggle Profile"
        >
          <span className="material-symbols-outlined text-2xl">account_circle</span>
        </button>
      </div>
    </header>
  );
};

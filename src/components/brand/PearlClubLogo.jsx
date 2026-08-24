import React from 'react';

export const PearlClubLogo = ({ variant = 'full', size = 'md', className = '' }) => {
  let sizeClass = 'h-10';
  if (size === 'sm') sizeClass = 'h-7';
  if (size === 'lg') sizeClass = 'h-14';

  if (variant === 'mark') {
    return (
      <div className={`flex items-center justify-center shrink-0 ${className}`} title="The Pearl Club">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-container to-secondary-container pearl-glow flex items-center justify-center text-primary shadow-sm">
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            water_drop
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 shrink-0 ${className}`}>
      <img
        src="/assets/brand/pearl-club-logo.svg"
        alt="The Pearl Club"
        className={`${sizeClass} w-auto object-contain drop-shadow-sm`}
      />
    </div>
  );
};

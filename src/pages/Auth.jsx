import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase/client';
import { PearlClubLogo } from '../components/brand/PearlClubLogo';

export const Auth = () => {
  return (
    <main className="relative z-20 min-h-screen w-full flex items-center justify-center p-organic-padding py-12 bg-gradient-to-b from-[#e1f5fe] via-[#b2dfdb] to-[#80cbc4]">
      {/* Background ambient water glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/50 via-transparent to-transparent pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel-opaque rounded-[2rem] p-8 md:p-10 text-center flex flex-col items-center gap-6 border border-white/60 shadow-2xl relative z-10 animate-fade-in my-auto">
        {/* Brand Logo */}
        <PearlClubLogo variant="full" size="lg" className="my-1" />

        <p className="font-headline-md text-headline-md text-on-surface-variant text-base font-normal">
          "Find a little space for yourself."
        </p>

        <div className="w-full flex flex-col gap-3.5 mt-2">
          <Link
            to="/login"
            className="w-full py-3.5 px-6 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow hover:bg-primary/90 transition-transform text-center"
          >
            Log in
          </Link>

          <Link
            to="/signup"
            className="w-full py-3.5 px-6 rounded-full bg-white/70 text-primary font-label-sm text-xs font-semibold border border-white/60 hover:bg-white/90 transition-transform text-center"
          >
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
};

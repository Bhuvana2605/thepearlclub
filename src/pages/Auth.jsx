import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase/client';
import { PearlClubLogo } from '../components/brand/PearlClubLogo';

export const Auth = () => {
  const handleGoogleSignIn = async () => {
    if (supabase) {
      try {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/`
          }
        });
      } catch (err) {
        console.warn('[Supabase OAuth] Google Sign-In error:', err);
      }
    }
  };

  return (
    <main className="relative z-20 min-h-screen w-full flex items-center justify-center p-organic-padding py-12 bg-gradient-to-b from-[#e1f5fe] via-[#b2dfdb] to-[#80cbc4] dark:from-[#081110] dark:via-[#0d1f1c] dark:to-[#091514]">
      {/* Background ambient water glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/50 via-transparent to-transparent pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel-opaque rounded-[2rem] p-8 md:p-10 text-center flex flex-col items-center gap-6 border border-white/60 dark:border-slate-700/60 shadow-2xl relative z-10 animate-fade-in my-auto">
        {/* Brand Logo */}
        <PearlClubLogo variant="full" size="lg" className="my-1" />

        <p className="font-headline-md text-headline-md text-on-surface-variant dark:text-slate-300 text-base font-normal">
          "Find a little space for yourself."
        </p>

        <div className="w-full flex flex-col gap-3 mt-2">
          {/* GOOGLE OAUTH BUTTON */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-label-sm text-xs font-semibold shadow hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3 hover:shadow-md active:scale-98"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* DIVIDER */}
          <div className="flex items-center gap-3 my-0.5">
            <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-700/60"></div>
            <span className="font-label-sm text-[11px] text-outline dark:text-slate-400 uppercase">or</span>
            <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-700/60"></div>
          </div>

          <Link
            to="/login"
            className="w-full py-3.5 px-6 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow hover:bg-primary/90 transition-transform text-center"
          >
            Log in with Email
          </Link>

          <Link
            to="/signup"
            className="w-full py-3.5 px-6 rounded-full bg-white/70 dark:bg-slate-800/70 text-primary dark:text-teal-300 font-label-sm text-xs font-semibold border border-white/60 dark:border-slate-700/60 hover:bg-white/90 dark:hover:bg-slate-800 transition-transform text-center"
          >
            Sign up with Email
          </Link>
        </div>
      </div>
    </main>
  );
};

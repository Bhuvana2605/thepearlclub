import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase/client';
import { PearlClubLogo } from '../components/brand/PearlClubLogo';

export const Auth = () => {
  const [errorMsg, setErrorMsg] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  React.useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    const rawParams = hash.startsWith('#') ? hash.slice(1) : (search.startsWith('?') ? search.slice(1) : '');
    if (!rawParams) return;

    const params = new URLSearchParams(rawParams);
    const error = params.get('error');
    const errorDescription = params.get('error_description') || params.get('error_message');

    if (error || errorDescription) {
      let message = errorDescription ? decodeURIComponent(errorDescription.replace(/\+/g, ' ')) : error;
      if (message.includes('Error getting user profile') || error === 'unauthorized_client') {
        message = 'Google Sign-In Authorization Error: Please check Supabase Google provider setup and ensure https://bqfeekkbxcincwlvabdq.supabase.co/auth/v1/callback is added in Google Cloud Console.';
      } else if (error === 'redirect_uri_mismatch' || message.includes('redirect_uri_mismatch')) {
        message = 'Redirect URI mismatch: Add https://bqfeekkbxcincwlvabdq.supabase.co/auth/v1/callback to Authorized Redirect URIs in Google Cloud Console.';
      }
      setErrorMsg(message);
    }
  }, []);

  const handleGoogleSignIn = () => {
    setErrorMsg('');
    setGoogleLoading(true);

    const supabaseUrl = 
      import.meta.env.VITE_SUPABASE_URL || 
      import.meta.env.REACT_APP_SUPABASE_URL || 
      'https://bqfeekkbxcincwlvabdq.supabase.co';

    const redirectUri = encodeURIComponent(`${window.location.origin}/`);
    const directOAuthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${redirectUri}`;

    // Instant browser redirection - ZERO MILLISECONDS delay!
    window.location.href = directOAuthUrl;
  };

  return (
    <main className="relative z-20 min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-[#e1f5fe] via-[#b2dfdb] to-[#80cbc4] dark:from-[#050c0b] dark:via-[#0b1a18] dark:to-[#081513]">
      <div className="w-full max-w-lg bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 text-center flex flex-col items-center gap-6 border border-white/60 dark:border-slate-800/80 shadow-2xl relative z-10 animate-fade-in my-auto">
        <PearlClubLogo variant="full" size="lg" className="my-1" />

        <p className="font-headline-md text-[#006b58] dark:text-teal-300 text-lg font-bold">
          "Find a little space for yourself."
        </p>

        <p className="font-body-md text-slate-600 dark:text-slate-300 text-xs italic max-w-sm leading-relaxed">
          "When your mind feels messy, you may not need another tool. You may need somewhere to be."
        </p>

        <div className="w-full flex flex-col gap-3 mt-2">
          {/* GOOGLE OAUTH BUTTON */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full py-3.5 px-4 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-label-sm text-xs font-semibold shadow hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3 hover:shadow-md active:scale-98 disabled:opacity-75"
          >
            {googleLoading ? (
              <div className="flex items-center gap-2 text-primary dark:text-teal-300">
                <div className="w-4 h-4 border-2 border-primary dark:border-teal-300 border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting to Google...</span>
              </div>
            ) : (
              <>
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
              </>
            )}
          </button>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-100 border border-red-200 text-red-900 dark:bg-red-950/60 dark:border-red-700/50 dark:text-red-200 font-label-sm text-xs text-left">
              {errorMsg}
            </div>
          )}

          {/* DIVIDER */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800"></div>
            <span className="font-label-sm text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">or email options</span>
            <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800"></div>
          </div>

          <Link
            to="/login"
            className="w-full py-3.5 px-6 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow hover:bg-primary/90 transition-transform text-center"
          >
            Log in with Email
          </Link>

          <Link
            to="/signup"
            className="w-full py-3.5 px-6 rounded-full bg-white/80 dark:bg-slate-800/80 text-primary dark:text-teal-300 font-label-sm text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-transform text-center"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    </main>
  );
};

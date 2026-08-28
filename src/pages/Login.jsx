import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase/client';
import { PearlClubLogo } from '../components/brand/PearlClubLogo';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  const [isUnconfirmed, setIsUnconfirmed] = useState(false);
  const [resending, setResending] = useState(false);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setResetMsg('');
    setIsUnconfirmed(false);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message?.toLowerCase().includes('email not confirmed')) {
            setErrorMsg('Your email is not confirmed yet. Please check your inbox or click resend below.');
            setIsUnconfirmed(true);
          } else if (error.message?.toLowerCase().includes('invalid login credentials')) {
            setErrorMsg('Invalid email or password. Please check your credentials or click "Forgot password?".');
          } else {
            setErrorMsg(error.message);
          }
          setLoading(false);
          return;
        }

        if (data?.session) {
          setLoading(false);
          navigate('/');
          return;
        }
      } catch (err) {
        console.warn('[Supabase Auth] Login error:', err);
        setErrorMsg(err.message || 'Authentication error.');
        setLoading(false);
        return;
      }
    } else {
      setErrorMsg('Supabase client is not configured.');
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate('/');
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setErrorMsg('Please enter your email address above to resend confirmation.');
      return;
    }
    setResending(true);
    setErrorMsg('');
    setResetMsg('');

    if (supabase) {
      try {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/login`
          }
        });
        if (error) {
          setErrorMsg(error.message);
        } else {
          setResetMsg('Confirmation link has been resent to your email.');
          setIsUnconfirmed(false);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Failed to resend confirmation email.');
      }
    }
    setResending(false);
  };

  const handleGoogleSignIn = () => {
    setErrorMsg('');
    setResetMsg('');
    setGoogleLoading(true);

    const GOOGLE_CLIENT_ID =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '504816841965-lo4d9e6sjl217tos5t132cm9l579ik25.apps.googleusercontent.com';

    const supabaseUrl = 
      import.meta.env.VITE_SUPABASE_URL || 
      import.meta.env.REACT_APP_SUPABASE_URL || 
      'https://bqfeekkbxcincwlvabdq.supabase.co';

    const supabaseCallback = `${supabaseUrl}/auth/v1/callback`;
    const appRedirect = encodeURIComponent(`${window.location.origin}/`);

    // Direct Google OAuth 2.0 URL - Connects directly to Google's CDN in 0.3s (bypasses 5-min Supabase authorize cold start)
    const directGoogleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(supabaseCallback)}&redirect_to=${appRedirect}&response_type=code&scope=email+profile&prompt=select_account`;

    window.location.href = directGoogleAuthUrl;
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg('Please enter your email address above to reset your password.');
      return;
    }
    setErrorMsg('');
    setResetMsg('');

    if (supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        });
        if (error) {
          setErrorMsg(error.message);
        } else {
          setResetMsg('Password reset instructions sent to your email.');
        }
      } catch (err) {
        setResetMsg('Password reset instructions requested.');
      }
    } else {
      setResetMsg('Password reset email requested.');
    }
  };

  return (
    <main className="relative z-20 min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-[#e1f5fe] via-[#b2dfdb] to-[#80cbc4] dark:from-[#050c0b] dark:via-[#0b1a18] dark:to-[#081513] overflow-hidden">
      {/* Ambient background water glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-teal-400/20 dark:bg-teal-500/10 rounded-full filter blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full filter blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Main Container Card: Stitch Sanctuary Layout */}
      <div className="w-full max-w-5xl rounded-[2.5rem] bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/60 dark:border-slate-800/80 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 animate-fade-in my-auto">
        
        {/* Left Hero Panel (Stitch Reference Design) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#006b58] to-[#004d40] text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle water caustics overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-teal-300/20 via-transparent to-transparent pointer-events-none"></div>

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <PearlClubLogo variant="full" size="md" className="text-white drop-shadow-md" />
            </div>

            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-300/20 text-teal-100 text-xs font-label-sm uppercase tracking-wider font-semibold border border-teal-300/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Private Sanctuary
              </span>
              <h2 className="font-headline-lg text-2xl md:text-3xl font-bold text-white mt-3 leading-snug">
                Somewhere to quiet your mind.
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-teal-50 text-xs font-body-md leading-relaxed italic shadow-inner">
              "When your mind feels messy, you may not need another tool. You may need somewhere to be."
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs font-label-sm text-teal-100">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="material-symbols-outlined text-teal-300 text-base">headphones</span>
                <span>Ambient Sounds</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="material-symbols-outlined text-teal-300 text-base">center_focus_strong</span>
                <span>Focus Timer</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="material-symbols-outlined text-teal-300 text-base">edit_note</span>
                <span>Daily Journal</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="material-symbols-outlined text-teal-300 text-base">water_drop</span>
                <span>Aquarium World</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/15 flex items-center justify-between text-[11px] text-teal-200/80">
            <span>The Pearl Club Haven</span>
            <span>Version 2.0</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-between bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
          <div className="w-full max-w-md mx-auto flex flex-col gap-6">
            
            {/* Header with Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h1 className="font-headline-md text-2xl font-bold text-slate-800 dark:text-teal-300">Welcome Back</h1>
                <p className="font-body-md text-xs text-slate-500 dark:text-slate-400 mt-1">Log in to enter your sanctuary</p>
              </div>

              {/* Navigation Switcher Tab */}
              <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-full text-xs font-label-sm font-semibold">
                <span className="px-3.5 py-1.5 rounded-full bg-primary text-white shadow-xs">Log In</span>
                <Link to="/signup" className="px-3.5 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-teal-300 transition-colors">Sign Up</Link>
              </div>
            </div>

            {/* Instant Responsive GOOGLE OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full py-3.5 px-4 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-label-sm text-xs font-semibold shadow hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3 hover:shadow-md active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {googleLoading ? (
                <div className="flex items-center gap-2 text-primary dark:text-teal-300">
                  <div className="w-4 h-4 border-2 border-primary dark:border-teal-300 border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting to Google...</span>
                </div>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
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

            {/* DIVIDER */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800"></div>
              <span className="font-label-sm text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">or email</span>
              <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800"></div>
            </div>

            {/* LOGIN FORM */}
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="font-label-sm text-xs text-slate-600 dark:text-slate-300 uppercase block mb-1 font-semibold">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined text-slate-400 absolute left-3.5 top-2.5 text-lg">mail</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 font-body-md text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-label-sm text-xs text-slate-600 dark:text-slate-300 uppercase font-semibold">Password</label>
                  <button type="button" onClick={handleForgotPassword} className="text-xs text-primary dark:text-teal-300 hover:underline">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined text-slate-400 absolute left-3.5 top-2.5 text-lg">lock</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 font-body-md text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 dark:bg-red-950/60 dark:border-red-700/50 dark:text-red-200 font-label-sm text-xs flex flex-col gap-2">
                  <span>{errorMsg}</span>
                  {isUnconfirmed && (
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={resending}
                      className="px-3.5 py-1.5 rounded-lg bg-red-800 text-white font-semibold hover:bg-red-900 transition-colors w-fit text-xs mt-1 shadow-xs"
                    >
                      {resending ? 'Resending...' : 'Resend Confirmation Email'}
                    </button>
                  )}
                </div>
              )}

              {resetMsg && (
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 dark:bg-teal-950/60 dark:border-teal-700/50 dark:text-teal-200 font-label-sm text-xs">
                  {resetMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full py-3.5 px-6 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 mt-2 active:scale-98 disabled:opacity-75"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Logging in...</span>
                  </div>
                ) : (
                  <span>Log in</span>
                )}
              </button>
            </form>
          </div>

          <div className="w-full max-w-md mx-auto pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
            <Link to="/signup" className="text-primary dark:text-teal-300 font-semibold hover:underline">
              Don't have an account? Sign up
            </Link>
            <div className="flex gap-3">
              <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
              <span>•</span>
              <Link to="/terms" className="hover:underline">Terms</Link>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase/client';
import { PearlClubLogo } from '../components/brand/PearlClubLogo';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  const [isUnconfirmed, setIsUnconfirmed] = useState(false);
  const [resending, setResending] = useState(false);

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

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setResetMsg('');
    setLoading(true);

    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/`
          }
        });
        if (error) {
          if (error.message?.toLowerCase().includes('provider is not enabled') || error.message?.toLowerCase().includes('unsupported provider')) {
            setErrorMsg('Google Sign-In is currently being configured in Supabase Auth providers.');
          } else {
            setErrorMsg(error.message);
          }
          setLoading(false);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Google sign-in failed.');
        setLoading(false);
      }
    } else {
      setErrorMsg('Supabase authentication is not configured.');
      setLoading(false);
    }
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
    <main className="relative z-20 min-h-screen w-full flex items-center justify-center p-organic-padding py-12 bg-gradient-to-b from-[#e1f5fe] via-[#b2dfdb] to-[#80cbc4] dark:from-[#081110] dark:via-[#0d1f1c] dark:to-[#091514]">
      <div className="w-full max-w-md glass-panel-opaque rounded-[2rem] p-8 md:p-10 flex flex-col gap-6 border border-white/60 dark:border-slate-700/60 shadow-2xl relative z-10 animate-fade-in my-auto">
        <div className="text-center flex flex-col items-center gap-2">
          <PearlClubLogo variant="full" size="md" />
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-slate-300 text-sm mt-1">Log in to enter your haven.</p>
        </div>

        {/* GOOGLE OAUTH SIGN-IN BUTTON */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
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

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="font-label-sm text-xs text-outline dark:text-slate-300 uppercase block mb-1 font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-white/80 dark:bg-slate-900/80 border border-white/60 dark:border-slate-700/60 rounded-xl px-4 py-2.5 font-body-md text-sm text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>

          <div>
            <label className="font-label-sm text-xs text-outline dark:text-slate-300 uppercase block mb-1 font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-white/80 dark:bg-slate-900/80 border border-white/60 dark:border-slate-700/60 rounded-xl px-4 py-2.5 font-body-md text-sm text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-100 border border-red-200 text-red-900 dark:bg-red-950/60 dark:border-red-700/50 dark:text-red-200 font-label-sm text-xs flex flex-col gap-2">
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
            <div className="p-3 rounded-xl bg-teal-100 border border-teal-200 text-teal-900 dark:bg-teal-950/60 dark:border-teal-700/50 dark:text-teal-200 font-label-sm text-xs">
              {resetMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow hover:bg-primary/90 transition-transform mt-2"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="flex justify-between items-center text-xs font-label-sm text-outline dark:text-slate-400 border-t border-white/30 dark:border-slate-700/40 pt-4">
          <Link to="/signup" className="text-primary dark:text-teal-300 hover:underline font-semibold">
            Don't have an account? Sign up
          </Link>
          <button type="button" onClick={handleForgotPassword} className="hover:text-primary dark:hover:text-teal-300 underline">
            Forgot password?
          </button>
        </div>
      </div>
    </main>
  );
};

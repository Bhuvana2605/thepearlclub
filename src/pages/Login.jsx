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

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setResetMsg('');

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
            setErrorMsg('Please confirm your email before logging in.');
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
          redirectTo: `${window.location.origin}/login`
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
    <main className="relative z-20 min-h-screen w-full flex items-center justify-center p-organic-padding py-12 bg-gradient-to-b from-[#e1f5fe] via-[#b2dfdb] to-[#80cbc4]">
      <div className="w-full max-w-md glass-panel-opaque rounded-[2rem] p-8 md:p-10 flex flex-col gap-6 border border-white/60 shadow-2xl relative z-10 animate-fade-in my-auto">
        <div className="text-center flex flex-col items-center gap-2">
          <PearlClubLogo variant="full" size="md" />
          <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">Log in to enter your sanctuary.</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="font-label-sm text-xs text-outline uppercase block mb-1 font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-white/80 border border-white/60 rounded-xl px-4 py-2.5 font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>

          <div>
            <label className="font-label-sm text-xs text-outline uppercase block mb-1 font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-white/80 border border-white/60 rounded-xl px-4 py-2.5 font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-100 border border-red-200 text-red-900 font-label-sm text-xs">
              {errorMsg}
            </div>
          )}

          {resetMsg && (
            <div className="p-3 rounded-xl bg-teal-100 border border-teal-200 text-teal-900 font-label-sm text-xs">
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

        <div className="flex justify-between items-center text-xs font-label-sm text-outline border-t border-white/30 pt-4">
          <Link to="/signup" className="text-primary hover:underline font-semibold">
            Don't have an account? Sign up
          </Link>
          <button type="button" onClick={handleForgotPassword} className="hover:text-primary underline">
            Forgot password?
          </button>
        </div>
      </div>
    </main>
  );
};

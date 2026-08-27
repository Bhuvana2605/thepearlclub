import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase/client';
import { useSanctuary } from '../context/SanctuaryContext';
import { PearlClubLogo } from '../components/brand/PearlClubLogo';

export const SignUp = () => {
  const navigate = useNavigate();
  const { updateProfile } = useSanctuary();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = name.trim();
    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');
    const cleanBio = bio.trim() || 'Finding a little quiet space.';

    if (!cleanName || !cleanUsername || !email || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    if (supabase) {
      try {
        const redirectTo = `${window.location.origin}/login`;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTo,
            data: {
              name: cleanName,
              username: cleanUsername,
              bio: cleanBio
            }
          }
        });

        if (error) {
          if (error.message?.toLowerCase().includes('already registered') || error.message?.toLowerCase().includes('user already exists')) {
            setErrorMsg('An account with this email already exists. Please log in instead.');
          } else {
            setErrorMsg(error.message);
          }
          setLoading(false);
          return;
        }

        if (data?.user) {
          // Attempt profile record creation safely
          try {
            await supabase.from('profiles').upsert(
              [
                {
                  id: data.user.id,
                  name: cleanName,
                  username: cleanUsername,
                  bio: cleanBio,
                  avatar_url: 'pearl',
                  created_at: new Date().toISOString()
                }
              ],
              { onConflict: 'id', ignoreDuplicates: true }
            );
          } catch (pErr) {
            console.warn('[Supabase Profile] Profile creation catch:', pErr);
          }

          // If session returned immediately (email confirmation disabled/auto-confirmed)
          if (data.session) {
            updateProfile({ name: cleanName, bio: cleanBio });
            setLoading(false);
            navigate('/');
            return;
          }
        }
      } catch (err) {
        console.warn('[Supabase Auth] Sign up error:', err);
        setErrorMsg(err.message || 'Authentication service error.');
        setLoading(false);
        return;
      }
    }

    updateProfile({
      name: cleanName,
      bio: cleanBio
    });

    setLoading(false);
    setEmailSent(true);
  };

  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

  const handleResendConfirmation = async () => {
    setResending(true);
    setResendStatus('');

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
          setResendStatus(`Resend error: ${error.message}`);
        } else {
          setResendStatus('Confirmation link has been resent! Check your inbox.');
        }
      } catch (err) {
        setResendStatus('Failed to resend email.');
      }
    }
    setResending(false);
  };

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

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);

    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent'
            }
          }
        });
        if (error) {
          if (error.message?.toLowerCase().includes('provider is not enabled') || error.message?.toLowerCase().includes('unsupported provider')) {
            setErrorMsg('Google Sign-In needs to be enabled in Supabase Dashboard (Authentication -> Providers -> Google).');
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

  if (emailSent) {
    return (
      <main className="relative z-20 min-h-screen w-full flex items-center justify-center p-organic-padding py-12 bg-gradient-to-b from-[#e1f5fe] via-[#b2dfdb] to-[#80cbc4] dark:from-[#081110] dark:via-[#0d1f1c] dark:to-[#091514]">
        <div className="w-full max-w-md glass-panel-opaque rounded-[2rem] p-8 md:p-10 flex flex-col items-center text-center gap-6 border border-white/60 dark:border-slate-700/60 shadow-2xl relative z-10 animate-fade-in my-auto">
          <PearlClubLogo variant="full" size="md" />
          <div className="w-16 h-16 rounded-full bg-primary-container/40 text-primary flex items-center justify-center text-3xl my-2 border border-primary-container/30">
            <span className="material-symbols-outlined text-4xl">mark_email_unread</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-primary dark:text-white text-xl font-semibold">Check your email</h2>
          <p className="font-body-md text-sm text-on-surface-variant dark:text-slate-300 leading-relaxed">
            We sent a confirmation link to <strong className="text-primary dark:text-teal-300">{email}</strong>.
            <br />
            Please confirm your email before continuing to Pearl Club.
          </p>

          {resendStatus && (
            <div className="p-3 rounded-xl bg-teal-100 border border-teal-200 text-teal-900 dark:bg-teal-950/60 dark:border-teal-700/50 dark:text-teal-200 font-label-sm text-xs w-full">
              {resendStatus}
            </div>
          )}

          <div className="flex flex-col gap-2 w-full mt-1">
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={resending}
              className="w-full py-3 px-6 rounded-full bg-white dark:bg-slate-900 text-primary dark:text-teal-300 font-label-sm text-xs font-semibold border border-primary/30 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              {resending ? 'Resending email...' : 'Resend Confirmation Email'}
            </button>

            <Link
              to="/login"
              className="w-full py-3.5 px-6 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow hover:bg-primary/90 transition-transform"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative z-20 min-h-screen w-full flex items-center justify-center p-organic-padding py-12 bg-gradient-to-b from-[#e1f5fe] via-[#b2dfdb] to-[#80cbc4] dark:from-[#081110] dark:via-[#0d1f1c] dark:to-[#091514]">
      <div className="w-full max-w-md glass-panel-opaque rounded-[2rem] p-8 md:p-10 flex flex-col gap-6 border border-white/60 dark:border-slate-700/60 shadow-2xl relative z-10 animate-fade-in my-auto">
        <div className="text-center flex flex-col items-center gap-2">
          <PearlClubLogo variant="full" size="md" />
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-slate-300 text-sm mt-1">Create your private haven account.</p>
        </div>

        {/* GOOGLE OAUTH SIGN-UP BUTTON */}
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
          <span>Sign up with Google</span>
        </button>

        {/* DIVIDER */}
        <div className="flex items-center gap-3 my-0.5">
          <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-700/60"></div>
          <span className="font-label-sm text-[11px] text-outline dark:text-slate-400 uppercase">or</span>
          <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-700/60"></div>
        </div>

        <form onSubmit={handleSignUp} className="flex flex-col gap-3.5">
          <div>
            <label className="font-label-sm text-xs text-outline uppercase block mb-1 font-semibold">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bhuvana"
              required
              className="w-full bg-white/80 border border-white/60 rounded-xl px-4 py-2 font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>

          <div>
            <label className="font-label-sm text-xs text-outline uppercase block mb-1 font-semibold">Username *</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. bhuvana_sanctuary"
              required
              className="w-full bg-white/80 border border-white/60 rounded-xl px-4 py-2 font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>

          <div>
            <label className="font-label-sm text-xs text-outline uppercase block mb-1 font-semibold">Short Bio (Optional)</label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Finding a little quiet space."
              className="w-full bg-white/80 border border-white/60 rounded-xl px-4 py-2 font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>

          <div>
            <label className="font-label-sm text-xs text-outline uppercase block mb-1 font-semibold">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-white/80 border border-white/60 rounded-xl px-4 py-2 font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>

          <div>
            <label className="font-label-sm text-xs text-outline uppercase block mb-1 font-semibold">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-white/80 border border-white/60 rounded-xl px-4 py-2 font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-100 border border-red-200 text-red-900 font-label-sm text-xs">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow hover:bg-primary/90 transition-transform mt-2"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="flex flex-col gap-2 border-t border-white/30 pt-3 text-center text-xs font-label-sm text-outline">
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Already have an account? Log in
          </Link>
          <div className="flex justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <Link to="/privacy" className="hover:underline hover:text-primary dark:hover:text-teal-300">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:underline hover:text-primary dark:hover:text-teal-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </main>
  );
};

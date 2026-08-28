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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // Auto-fill username slug when typing Full Name if username is untouched
  const handleNameChange = (val) => {
    setName(val);
    const suggestedSlug = val.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_');
    if (!username || username === name.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_')) {
      setUsername(suggestedSlug);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = name.trim();
    const cleanUsername = (username.trim() || name.trim()).toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_');
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

  if (emailSent) {
    return (
      <main className="relative z-20 min-h-screen w-full flex items-center justify-center p-6 bg-gradient-to-br from-[#e1f5fe] via-[#b2dfdb] to-[#80cbc4] dark:from-[#050c0b] dark:via-[#0b1a18] dark:to-[#081513]">
        <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 flex flex-col items-center text-center gap-6 border border-white/60 dark:border-slate-700/60 shadow-2xl relative z-10 animate-fade-in my-auto">
          <PearlClubLogo variant="full" size="md" />
          <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 flex items-center justify-center text-3xl my-2 border border-teal-200">
            <span className="material-symbols-outlined text-3xl">mark_email_read</span>
          </div>

          <h1 className="font-headline-md text-2xl font-bold text-primary dark:text-teal-300">Check Your Inbox</h1>
          <p className="font-body-md text-slate-600 dark:text-slate-300 text-xs leading-relaxed max-w-xs">
            We sent a verification link to <strong className="text-slate-800 dark:text-white font-semibold">{email}</strong>. Please click the link to activate your sanctuary membership.
          </p>

          {resendStatus && (
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-label-sm w-full">
              {resendStatus}
            </div>
          )}

          <div className="flex flex-col gap-3 w-full mt-2">
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={resending}
              className="w-full py-3 px-4 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {resending ? 'Resending Link...' : 'Resend Confirmation Email'}
            </button>

            <Link
              to="/login"
              className="w-full py-3 px-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-label-sm text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Proceed to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative z-20 min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-[#e1f5fe] via-[#b2dfdb] to-[#80cbc4] dark:from-[#050c0b] dark:via-[#0b1a18] dark:to-[#081513] overflow-hidden">
      {/* Ambient background water glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-teal-400/20 dark:bg-teal-500/10 rounded-full filter blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full filter blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Main Container Card: Stitch Sanctuary Layout */}
      <div className="w-full max-w-5xl rounded-[2.5rem] bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/60 dark:border-slate-800/80 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 animate-fade-in my-auto">
        
        {/* Left Hero Panel (Stitch Reference Design) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#006b58] to-[#004d40] text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-teal-300/20 via-transparent to-transparent pointer-events-none"></div>

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <PearlClubLogo variant="full" size="md" className="text-white drop-shadow-md" />
            </div>

            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-300/20 text-teal-100 text-xs font-label-sm uppercase tracking-wider font-semibold border border-teal-300/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Join the Sanctuary
              </span>
              <h2 className="font-headline-lg text-2xl md:text-3xl font-bold text-white mt-3 leading-snug">
                Your quiet refuge begins here.
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-teal-50 text-xs font-body-md leading-relaxed italic shadow-inner">
              "Create a space free of noise, customized with your favorite ambient sounds, reflection logs, and collectible pearls."
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs font-label-sm text-teal-100">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="material-symbols-outlined text-teal-300 text-base">verified_user</span>
                <span>Private & Safe</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="material-symbols-outlined text-teal-300 text-base">military_tech</span>
                <span>Pearl Badges</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="material-symbols-outlined text-teal-300 text-base">forum</span>
                <span>Sanctuary Feed</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="material-symbols-outlined text-teal-300 text-base">sailing</span>
                <span>Bottle Messages</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/15 flex items-center justify-between text-[11px] text-teal-200/80">
            <span>The Pearl Club Haven</span>
            <span>Free Membership</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-between bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
          <div className="w-full max-w-md mx-auto flex flex-col gap-6">
            
            {/* Header with Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h1 className="font-headline-md text-2xl font-bold text-slate-800 dark:text-teal-300">Create Account</h1>
                <p className="font-body-md text-xs text-slate-500 dark:text-slate-400 mt-1">Sign up for your personal sanctuary space</p>
              </div>

              {/* Navigation Switcher Tab */}
              <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-full text-xs font-label-sm font-semibold">
                <Link to="/login" className="px-3.5 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-teal-300 transition-colors">Log In</Link>
                <span className="px-3.5 py-1.5 rounded-full bg-primary text-white shadow-xs">Sign Up</span>
              </div>
            </div>

            {/* Instant GOOGLE OAuth Button */}
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
                  <span>Sign up with Google</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800"></div>
              <span className="font-label-sm text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">or email details</span>
              <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800"></div>
            </div>

            {/* SIGN UP FORM */}
            <form onSubmit={handleSignUp} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-label-sm text-xs text-slate-600 dark:text-slate-300 uppercase block mb-1 font-semibold">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Bhuvana C"
                    required
                    className="w-full bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 font-body-md text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                  />
                </div>

                <div>
                  <label className="font-label-sm text-xs text-slate-600 dark:text-slate-300 uppercase block mb-1 font-semibold">Username *</label>
                  <div className="relative">
                    <span className="text-slate-400 absolute left-3 top-2.5 text-xs font-mono">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="bhuvana"
                      required
                      className="w-full bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-7 pr-3 py-2.5 font-body-md text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-label-sm text-xs text-slate-600 dark:text-slate-300 uppercase block mb-1 font-semibold">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 font-body-md text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                />
              </div>

              <div>
                <label className="font-label-sm text-xs text-slate-600 dark:text-slate-300 uppercase block mb-1 font-semibold">Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 font-body-md text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 dark:bg-red-950/60 dark:border-red-700/50 dark:text-red-200 font-label-sm text-xs">
                  {errorMsg}
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
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <span>Create Free Account</span>
                )}
              </button>
            </form>
          </div>

          <div className="w-full max-w-md mx-auto pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
            <Link to="/login" className="text-primary dark:text-teal-300 font-semibold hover:underline">
              Already have an account? Log in
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

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
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        if (data?.user) {
          // Attempt profile record creation safely (upsert with ignoreDuplicates)
          try {
            const { error: profileErr } = await supabase.from('profiles').upsert(
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

            if (profileErr) {
              console.warn('[Supabase Profile] Profile insertion warning:', profileErr.message);
            }
          } catch (pErr) {
            console.warn('[Supabase Profile] Profile creation catch:', pErr);
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

  if (emailSent) {
    return (
      <main className="relative z-20 min-h-screen w-full flex items-center justify-center p-organic-padding py-12 bg-gradient-to-b from-[#e1f5fe] via-[#b2dfdb] to-[#80cbc4]">
        <div className="w-full max-w-md glass-panel-opaque rounded-[2rem] p-8 md:p-10 flex flex-col items-center text-center gap-6 border border-white/60 shadow-2xl relative z-10 animate-fade-in my-auto">
          <PearlClubLogo variant="full" size="md" />
          <div className="w-16 h-16 rounded-full bg-primary-container/40 text-primary flex items-center justify-center text-3xl my-2 border border-primary-container/30">
            <span className="material-symbols-outlined text-4xl">mark_email_unread</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-primary text-xl font-semibold">Check your email</h2>
          <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
            We sent a confirmation link to <strong className="text-primary">{email}</strong>.
            <br />
            Please confirm your email before continuing to Pearl Club.
          </p>
          <Link
            to="/login"
            className="w-full py-3.5 px-6 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow hover:bg-primary/90 transition-transform mt-2"
          >
            Back to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative z-20 min-h-screen w-full flex items-center justify-center p-organic-padding py-12 bg-gradient-to-b from-[#e1f5fe] via-[#b2dfdb] to-[#80cbc4]">
      <div className="w-full max-w-md glass-panel-opaque rounded-[2rem] p-8 md:p-10 flex flex-col gap-6 border border-white/60 shadow-2xl relative z-10 animate-fade-in my-auto">
        <div className="text-center flex flex-col items-center gap-2">
          <PearlClubLogo variant="full" size="md" />
          <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">Create your private sanctuary account.</p>
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

        <div className="text-center text-xs font-label-sm text-outline border-t border-white/30 pt-3">
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </main>
  );
};

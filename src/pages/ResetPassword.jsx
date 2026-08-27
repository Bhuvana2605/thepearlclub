import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase/client';
import { PearlClubLogo } from '../components/brand/PearlClubLogo';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isRecoverySession, setIsRecoverySession] = useState(true);

  useEffect(() => {
    // Check if session or recovery token exists
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          setIsRecoverySession(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsRecoverySession(true);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword || !confirmPassword) {
      setErrorMsg('Please fill in both password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify and try again.');
      return;
    }

    setLoading(true);

    if (supabase) {
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        setSuccessMsg('Your password has been successfully updated! You can now log in with your new password.');
        setLoading(false);

        // Automatically redirect to login after 3 seconds
        setTimeout(() => {
          supabase.auth.signOut().then(() => {
            navigate('/login');
          });
        }, 3000);

      } catch (err) {
        setErrorMsg(err.message || 'Failed to update password. Please try again.');
        setLoading(false);
      }
    } else {
      setErrorMsg('Supabase client is not configured.');
      setLoading(false);
    }
  };

  return (
    <main className="relative z-20 min-h-screen w-full flex items-center justify-center p-organic-padding py-12 bg-gradient-to-b from-[#e1f5fe] via-[#b2dfdb] to-[#80cbc4] dark:from-[#081110] dark:via-[#0d1f1c] dark:to-[#091514]">
      <div className="w-full max-w-md glass-panel-opaque rounded-[2rem] p-8 md:p-10 flex flex-col gap-6 border border-white/60 dark:border-slate-700/60 shadow-2xl relative z-10 animate-fade-in my-auto">
        <div className="text-center flex flex-col items-center gap-2">
          <PearlClubLogo variant="full" size="md" />
          <h1 className="font-headline-md text-xl font-bold text-primary dark:text-white mt-1">Set New Password</h1>
          <p className="font-body-md text-xs text-on-surface-variant dark:text-slate-300">
            Create a new secure password for your Pearl Club account.
          </p>
        </div>

        {!isRecoverySession && !successMsg && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950/60 dark:border-amber-700/50 dark:text-amber-200 font-label-sm text-xs flex flex-col gap-2">
            <span>
              ⚠️ No active password reset link detected. If you arrived here directly, please request a reset email from the login page.
            </span>
            <Link to="/login" className="font-bold underline text-amber-950 dark:text-amber-100 hover:text-primary">
              Return to Login Page
            </Link>
          </div>
        )}

        {successMsg ? (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 flex items-center justify-center text-2xl border border-emerald-300 dark:border-emerald-700">
              <span className="material-symbols-outlined text-3xl">check_circle</span>
            </div>
            <p className="font-body-md text-sm text-emerald-900 dark:text-emerald-200 font-medium">
              {successMsg}
            </p>
            <p className="font-label-sm text-xs text-outline dark:text-slate-400">
              Redirecting to login in 3 seconds...
            </p>
            <Link
              to="/login"
              className="w-full py-3 px-6 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow hover:bg-primary/90 transition-transform mt-2"
            >
              Go to Login Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
            <div>
              <label className="font-label-sm text-xs text-outline dark:text-slate-300 uppercase block mb-1 font-semibold">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter at least 6 characters"
                required
                minLength={6}
                className="w-full bg-white/80 dark:bg-slate-900/80 border border-white/60 dark:border-slate-700/60 rounded-xl px-4 py-2.5 font-body-md text-sm text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>

            <div>
              <label className="font-label-sm text-xs text-outline dark:text-slate-300 uppercase block mb-1 font-semibold">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                minLength={6}
                className="w-full bg-white/80 dark:bg-slate-900/80 border border-white/60 dark:border-slate-700/60 rounded-xl px-4 py-2.5 font-body-md text-sm text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-100 border border-red-200 text-red-900 dark:bg-red-950/60 dark:border-red-700/50 dark:text-red-200 font-label-sm text-xs">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow hover:bg-primary/90 transition-transform mt-2 disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}

        <div className="text-center text-xs font-label-sm text-outline dark:text-slate-400 border-t border-white/30 dark:border-slate-700/40 pt-4">
          <Link to="/login" className="text-primary dark:text-teal-300 hover:underline font-semibold">
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
};

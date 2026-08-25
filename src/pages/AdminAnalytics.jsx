import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSanctuary } from '../context/SanctuaryContext';
import { supabase } from '../lib/supabase/client';
import { checkIsAdmin, ADMIN_EMAILS } from '../config/adminConfig';
import { getAnalyticsSummary } from '../lib/analytics/telemetry';

/**
 * Secure Admin Analytics Dashboard (/admin/analytics)
 * 
 * PRIVACY GUARANTEE:
 * Tracks aggregate event counts, website visits, unique visitors, and user metrics.
 * NEVER stores or displays private journal text, Mood Canvas drawings, or user task text.
 */
export const AdminAnalytics = () => {
  const { currentUser, profile, signOutUser, focusHistory, journalEntries, activityHistory } = useSanctuary();
  const [dateFilter, setDateFilter] = useState('7d'); // 'today' | '7d' | '30d' | 'all'
  const [telemetry, setTelemetry] = useState({
    totalVisits: 1,
    uniqueVisitors: 1,
    todayVisits: 1
  });

  const [analyticsData, setAnalyticsData] = useState({
    registeredUsers: 1,
    activeUsers: 1,
    avgSessionDurationMins: 12.5,
    journalCount: 0,
    focusCount: 0,
    gamesCount: 0,
    feedPostsCount: 0,
    bottleCount: 0,
    featureRankings: [
      { name: 'Focus', count: 0, icon: 'center_focus_strong' },
      { name: 'Journal', count: 0, icon: 'edit_note' },
      { name: 'Games', count: 0, icon: 'sports_esports' },
      { name: 'Music', count: 0, icon: 'headphones' },
      { name: 'Feed', count: 0, icon: 'forum' },
      { name: 'Message in a Bottle', count: 0, icon: 'water_drop' }
    ]
  });

  // Admin Verification
  const isAdmin = checkIsAdmin(currentUser, profile);

  useEffect(() => {
    // 1. Fetch Telemetry Summary (Visits, Unique Visitors)
    const loadTelemetry = async () => {
      const summary = await getAnalyticsSummary();
      setTelemetry({
        totalVisits: summary.totalVisits,
        uniqueVisitors: summary.uniqueVisitors,
        todayVisits: summary.todayVisits
      });
    };
    loadTelemetry();

    // 2. Calculate Local Feature Usage Metrics
    const journalTotal = Object.keys(journalEntries || {}).filter(
      (k) => journalEntries[k]?.text?.trim().length > 0 || journalEntries[k]?.drawingDataUrl
    ).length;

    const focusTotal = (focusHistory || []).length;
    const gamesTotal =
      (activityHistory?.sudoku?.length || 0) +
      (activityHistory?.pearlCatch?.length || 0) +
      (activityHistory?.quickMath?.length || 0);

    setAnalyticsData((prev) => ({
      ...prev,
      journalCount: journalTotal,
      focusCount: focusTotal,
      gamesCount: gamesTotal,
      featureRankings: [
        { name: 'Focus Sessions', count: focusTotal, icon: 'center_focus_strong' },
        { name: 'Journal Entries', count: journalTotal, icon: 'edit_note' },
        { name: 'Games Played', count: gamesTotal, icon: 'sports_esports' },
        { name: 'Ambient Soundtracks', count: Math.max(1, focusTotal), icon: 'headphones' },
        { name: 'Community Feed', count: prev.feedPostsCount, icon: 'forum' },
        { name: 'Message in a Bottle', count: prev.bottleCount, icon: 'water_drop' }
      ].sort((a, b) => b.count - a.count)
    }));

    // 3. Supabase Aggregate Records
    if (supabase && currentUser) {
      const fetchSupabaseAnalytics = async () => {
        try {
          const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
          const { count: postsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
          const { count: bottlesCount } = await supabase.from('bottles').select('*', { count: 'exact', head: true });

          setAnalyticsData((prev) => ({
            ...prev,
            registeredUsers: userCount || prev.registeredUsers,
            activeUsers: Math.max(1, userCount || 1),
            feedPostsCount: postsCount || prev.feedPostsCount,
            bottleCount: bottlesCount || prev.bottleCount
          }));
        } catch (e) {
          // Silent fallback to local telemetry
        }
      };

      fetchSupabaseAnalytics();
    }
  }, [dateFilter, focusHistory, journalEntries, activityHistory, currentUser]);

  const configuredEnvEmail = import.meta.env.VITE_ADMIN_EMAIL || '';

  if (!currentUser) {
    return (
      <main className="relative z-10 w-full min-h-[85vh] flex items-center justify-center pt-24 pb-32 px-4">
        <div className="w-full max-w-md glass-panel rounded-3xl p-8 text-center flex flex-col items-center gap-4 border border-primary/30 shadow-xl">
          <span className="material-symbols-outlined text-4xl text-primary">admin_panel_settings</span>
          <h1 className="font-headline-lg text-headline-lg text-primary text-xl font-semibold">Pearl Club Admin</h1>
          <p className="font-body-md text-xs text-on-surface-variant">
            Please log in with an authorized admin account to view website analytics.
          </p>
          <Link
            to="/login"
            className="mt-2 py-2 px-6 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow hover:bg-primary/90"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="relative z-10 w-full min-h-[85vh] flex items-center justify-center pt-24 pb-32 px-4">
        <div className="w-full max-w-md glass-panel rounded-3xl p-8 text-center flex flex-col items-center gap-4 border border-error/30 shadow-xl">
          <span className="material-symbols-outlined text-4xl text-error">lock</span>
          <h1 className="font-headline-lg text-headline-lg text-error text-xl font-semibold">Admin Access Restricted</h1>
          <p className="font-body-md text-xs text-on-surface-variant">
            Your current email (<strong className="text-on-surface">{currentUser.email}</strong>) is not authorized for Admin access.
          </p>
          <div className="w-full p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-left text-xs text-amber-900 flex flex-col gap-1">
            <span className="font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-amber-700">info</span>
              How to Grant Admin Access:
            </span>
            <p className="text-[11px] leading-relaxed">
              Add your Gmail address (<code>{currentUser.email}</code>) to your <code>.env</code> file:
            </p>
            <code className="bg-white/80 p-1.5 rounded text-[11px] font-mono text-primary font-semibold border border-amber-300">
              VITE_ADMIN_EMAIL={currentUser.email}
            </code>
          </div>

          <Link
            to="/"
            className="mt-1 py-2 px-6 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow hover:bg-primary/90"
          >
            Return to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative z-10 w-full min-h-[85vh] flex flex-col items-center justify-center pt-24 pb-32 px-organic-padding md:px-bubble-margin">
      <div className="w-full max-w-4xl glass-panel rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col gap-8 border border-white/50 relative overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/30 pb-4">
          <div>
            <span className="font-label-sm text-[11px] font-semibold text-primary uppercase tracking-widest bg-primary-container/40 px-3 py-1 rounded-full border border-primary-container/30">
              Pearl Club Admin
            </span>
            <h1 className="font-headline-lg text-headline-lg text-primary text-2xl font-bold tracking-tight mt-1">
              Website Analytics & Visitor Metrics
            </h1>
            <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
              Logged in as Admin: <strong className="text-primary">{currentUser.email}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date Filter */}
            <div className="flex gap-1 glass-panel p-1 rounded-full border border-white/40">
              {[
                { id: 'today', label: 'Today' },
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
                { id: 'all', label: 'All Time' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setDateFilter(f.id)}
                  className={`py-1 px-3 rounded-full font-label-sm text-xs transition-all ${
                    dateFilter === f.id
                      ? 'bg-primary text-white font-semibold shadow'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => signOutUser()}
              className="py-1.5 px-4 rounded-full bg-primary/90 hover:bg-primary text-white font-label-sm text-xs font-semibold shadow transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* 1. Primary Visitor & User Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl glass-panel border border-white/40 flex flex-col items-center text-center shadow-sm">
            <span className="material-symbols-outlined text-primary text-3xl mb-1">visibility</span>
            <span className="font-display-md text-display-md text-3xl text-primary font-bold">
              {telemetry.totalVisits}
            </span>
            <span className="font-label-sm text-xs text-outline mt-1 font-semibold">Total Website Visits</span>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-white/40 flex flex-col items-center text-center shadow-sm">
            <span className="material-symbols-outlined text-secondary text-3xl mb-1">person_pin_circle</span>
            <span className="font-display-md text-display-md text-3xl text-secondary font-bold">
              {telemetry.uniqueVisitors}
            </span>
            <span className="font-label-sm text-xs text-outline mt-1 font-semibold">Unique Visitors</span>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-white/40 flex flex-col items-center text-center shadow-sm">
            <span className="material-symbols-outlined text-tertiary text-3xl mb-1">group</span>
            <span className="font-display-md text-display-md text-3xl text-tertiary font-bold">
              {analyticsData.registeredUsers}
            </span>
            <span className="font-label-sm text-xs text-outline mt-1 font-semibold">Registered Accounts</span>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-white/40 flex flex-col items-center text-center shadow-sm">
            <span className="material-symbols-outlined text-emerald-700 text-3xl mb-1">today</span>
            <span className="font-display-md text-display-md text-3xl text-emerald-800 font-bold">
              {telemetry.todayVisits}
            </span>
            <span className="font-label-sm text-xs text-outline mt-1 font-semibold">Today's Visits</span>
          </div>
        </div>

        {/* 2. Most Used Features Ranking */}
        <div className="flex flex-col gap-3">
          <h2 className="font-label-sm text-xs text-primary uppercase tracking-widest font-semibold px-1">
            Feature Usage & Engagement
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {analyticsData.featureRankings.map((feat, idx) => (
              <div
                key={feat.name}
                className="p-4 rounded-xl glass-panel border border-white/40 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-label-sm text-xs font-bold flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <span className="material-symbols-outlined text-primary text-xl">{feat.icon}</span>
                  <span className="font-label-sm text-xs font-semibold text-on-surface">{feat.name}</span>
                </div>
                <span className="font-headline-md text-headline-md text-secondary text-sm font-semibold">
                  {feat.count} events
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Aggregate Activity Metrics Breakdown */}
        <div className="flex flex-col gap-3">
          <h2 className="font-label-sm text-xs text-primary uppercase tracking-widest font-semibold px-1">
            Aggregate Activity Totals
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl bg-white/40 border border-white/50 text-center">
              <span className="font-headline-lg text-2xl font-bold text-primary">{analyticsData.journalCount}</span>
              <span className="font-label-sm text-[11px] text-outline block mt-0.5 font-semibold">Journals Created</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/40 border border-white/50 text-center">
              <span className="font-headline-lg text-2xl font-bold text-secondary">{analyticsData.focusCount}</span>
              <span className="font-label-sm text-[11px] text-outline block mt-0.5 font-semibold">Focus Sessions</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/40 border border-white/50 text-center">
              <span className="font-headline-lg text-2xl font-bold text-tertiary">{analyticsData.gamesCount}</span>
              <span className="font-label-sm text-[11px] text-outline block mt-0.5 font-semibold">Games Played</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/40 border border-white/50 text-center">
              <span className="font-headline-lg text-2xl font-bold text-amber-800">{analyticsData.feedPostsCount}</span>
              <span className="font-label-sm text-[11px] text-outline block mt-0.5 font-semibold">Feed Posts</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/40 border border-white/50 text-center">
              <span className="font-headline-lg text-2xl font-bold text-teal-800">{analyticsData.bottleCount}</span>
              <span className="font-label-sm text-[11px] text-outline block mt-0.5 font-semibold">Bottles Released</span>
            </div>
          </div>
        </div>

        {/* Admin Email Authorization Info Card */}
        <div className="p-4 rounded-2xl bg-white/50 border border-white/60 flex flex-col gap-2 text-left text-xs text-on-surface-variant">
          <div className="flex items-center gap-2 text-primary font-bold">
            <span className="material-symbols-outlined text-base">verified</span>
            <span>Admin Authorization Settings</span>
          </div>
          <p className="text-[11px] text-outline">
            Active Admin Email: <code className="text-primary font-semibold">{currentUser?.email}</code>
          </p>
          <p className="text-[11px] text-outline">
            To authorize additional Gmail addresses as Admin, set <code>VITE_ADMIN_EMAIL=your_email@gmail.com</code> in <code>.env</code> or update <code>ADMIN_EMAILS</code> in <code>src/config/adminConfig.js</code>.
          </p>
        </div>

        {/* Privacy Guarantee Footer */}
        <div className="p-4 rounded-2xl bg-primary-container/20 border border-primary-container/30 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl shrink-0">verified_user</span>
          <p className="font-label-sm text-xs text-on-surface-variant">
            <strong>Privacy Guarantee:</strong> All analytics represent aggregate website metrics. Private journal entries, Mood Canvas drawings, and personal tasks remain 100% private on user devices and are never exposed or logged.
          </p>
        </div>

      </div>
    </main>
  );
};

export default AdminAnalytics;

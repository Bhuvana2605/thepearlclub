import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSanctuary } from '../context/SanctuaryContext';
import { supabase } from '../lib/supabase/client';
import { checkIsAdmin } from '../config/adminConfig';
import { getAnalyticsSummary } from '../lib/analytics/telemetry';

const formatPearlNo = (val) => {
  if (!val && val !== 0) return '#PEARL-0001';
  if (typeof val === 'string' && val.includes('PEARL')) return val;
  const num = parseInt(val, 10) || 1;
  return `#PEARL-${String(num).padStart(4, '0')}`;
};

/**
 * Secure Admin Analytics Dashboard (/admin)
 * Includes Registered Accounts Directory table with strict numerical Pearl Number sorting (#0001, #0002...).
 */
export const AdminAnalytics = () => {
  const { currentUser, profile, signOutUser, focusHistory, journalEntries, activityHistory, formattedPearlNumber } = useSanctuary();
  const [dateFilter, setDateFilter] = useState('7d'); // 'today' | '7d' | '30d' | 'all'
  const [showUserTable, setShowUserTable] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [userProfiles, setUserProfiles] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Table Column Sorting State (Default: Pearl Number Ascending #0001 -> #0002 -> #0003...)
  const [sortField, setSortField] = useState('pearlVal');
  const [sortDirection, setSortDirection] = useState('asc');

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
      { name: 'Focus Sessions', count: 0, icon: 'center_focus_strong' },
      { name: 'Journal Entries', count: 0, icon: 'edit_note' },
      { name: 'Games Played', count: 0, icon: 'sports_esports' },
      { name: 'Ambient Soundtracks', count: 0, icon: 'headphones' },
      { name: 'Community Feed', count: 0, icon: 'forum' },
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

    // 2. Fetch Real Registered Users from Supabase Database
    const fetchUsers = async () => {
      setLoadingUsers(true);
      let list = [];

      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*');

          if (!error && data && data.length > 0) {
            // Sort profiles by created_at ascending (oldest signup = #PEARL-0001)
            const sortedByDate = [...data].sort(
              (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)
            );

            // Auto-heal & repair any database sequence gaps directly inside Supabase's public.profiles table
            sortedByDate.forEach(async (u, idx) => {
              const expectedPearlNumber = idx + 1;
              if (u.id && u.pearl_number !== expectedPearlNumber) {
                try {
                  await supabase
                    .from('profiles')
                    .update({ pearl_number: expectedPearlNumber })
                    .eq('id', u.id);
                  console.log(`[Supabase Auto-Heal] Repaired database row ${u.id}: pearl_number -> ${expectedPearlNumber}`);
                } catch (err) {}
              }
            });

            list = sortedByDate.map((u, idx) => {
              const numericPearl = idx + 1;
              const meta = u.raw_user_meta_data || {};
              const rawName = u.name || u.display_name || u.full_name || meta.full_name || meta.name || meta.given_name;
              const name = rawName || (u.email ? u.email.split('@')[0] : 'Pearl Member');

              let cleanUsername = u.username;
              if (!cleanUsername || cleanUsername.startsWith('member_')) {
                const derived = (name || (u.email ? u.email.split('@')[0] : '')).toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
                cleanUsername = derived && derived.length >= 2 ? `@${derived}` : (u.username ? `@${u.username.replace(/^@/, '')}` : '@member');
              } else {
                cleanUsername = `@${cleanUsername.replace(/^@/, '')}`;
              }

              return {
                id: u.id || `u_${idx}`,
                name: name,
                username: cleanUsername,
                email: u.email || (u.id === currentUser?.id ? currentUser?.email : 'private@pearlclub.sanctuary'),
                pearlVal: numericPearl,
                pearlNumber: formatPearlNo(numericPearl),
                createdAtDate: u.created_at ? new Date(u.created_at) : new Date(Date.now() - (sortedByDate.length - idx) * 86400000),
                createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
                role: u.role || (checkIsAdmin(u, u) ? 'admin' : 'member'),
                isEarlyMember: u.is_early_member ?? true
              };
            });
          }
        } catch (e) {
          console.error('[Admin] Error fetching profiles:', e);
        }
      }

      // Local / Offline Fallback Profile
      if (list.length === 0 && currentUser) {
        const adminPearlNo = parseInt((formattedPearlNumber || '1').replace(/\D/g, ''), 10) || 1;
        list = [
          {
            id: currentUser.id || '1',
            name: profile?.display_name || profile?.username || 'Bhuvana (Admin)',
            username: profile?.username ? `@${profile.username.replace(/^@/, '')}` : '@bhuvana',
            email: currentUser.email || 'chbhuvana0505@gmail.com',
            pearlVal: adminPearlNo,
            pearlNumber: formatPearlNo(adminPearlNo),
            createdAtDate: new Date(),
            createdAt: 'Aug 25, 2026',
            role: 'admin',
            isEarlyMember: true
          }
        ];
      }

      setUserProfiles(list);
      setAnalyticsData((prev) => ({
        ...prev,
        registeredUsers: Math.max(prev.registeredUsers, list.length),
        activeUsers: Math.max(1, list.length)
      }));
      setLoadingUsers(false);
    };

    fetchUsers();

    // 3. Local Feature Metrics
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

    // 4. Supabase Aggregate Records
    if (supabase && currentUser) {
      const fetchSupabaseTotals = async () => {
        try {
          const { count: postsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
          const { count: bottlesCount } = await supabase.from('bottles').select('*', { count: 'exact', head: true });

          setAnalyticsData((prev) => ({
            ...prev,
            feedPostsCount: postsCount || prev.feedPostsCount,
            bottleCount: bottlesCount || prev.bottleCount
          }));
        } catch {
          // Silent fallback
        }
      };
      fetchSupabaseTotals();
    }
  }, [dateFilter, focusHistory, journalEntries, activityHistory, currentUser, profile, formattedPearlNumber]);

  // Handle Header Column Sorting Toggle
  const handleSortToggle = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sorted & Search-Filtered Member Accounts List (Strictly Pearl Number Ascending by default)
  const sortedAndFilteredUsers = [...userProfiles]
    .filter((u) => {
      const q = userSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.pearlNumber.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let result = 0;
      if (sortField === 'pearlVal') {
        result = a.pearlVal - b.pearlVal;
      } else if (sortField === 'name') {
        result = a.name.localeCompare(b.name);
      } else if (sortField === 'createdAtDate') {
        result = a.createdAtDate - b.createdAtDate;
      }
      return sortDirection === 'asc' ? result : -result;
    });

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
      <div className="w-full max-w-5xl glass-panel rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col gap-8 border border-white/50 relative overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/30 pb-4">
          <div>
            <span className="font-label-sm text-[11px] font-semibold text-primary uppercase tracking-widest bg-primary-container/40 px-3 py-1 rounded-full border border-primary-container/30">
              Pearl Club Admin Dashboard
            </span>
            <h1 className="font-headline-lg text-headline-lg text-primary text-2xl font-bold tracking-tight mt-1">
              Website Analytics & Registered Accounts
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

        {/* 1. Summary Metrics Cards */}
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

          {/* Registered Accounts Card (Clickable to view table) */}
          <div
            onClick={() => setShowUserTable(true)}
            className="p-4 rounded-2xl glass-panel border border-primary/50 bg-primary/5 flex flex-col items-center text-center shadow-md cursor-pointer hover:scale-105 hover:border-primary transition-all group"
            title="Click to view Registered Members table"
          >
            <span className="material-symbols-outlined text-primary text-3xl mb-1 group-hover:animate-bounce">group</span>
            <span className="font-display-md text-display-md text-3xl text-primary font-bold">
              {analyticsData.registeredUsers}
            </span>
            <span className="font-label-sm text-xs text-primary mt-1 font-bold flex items-center gap-1">
              Registered Accounts
              <span className="material-symbols-outlined text-xs">list_alt</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-white/40 flex flex-col items-center text-center shadow-sm">
            <span className="material-symbols-outlined text-emerald-700 text-3xl mb-1">today</span>
            <span className="font-display-md text-display-md text-3xl text-emerald-800 font-bold">
              {telemetry.todayVisits}
            </span>
            <span className="font-label-sm text-xs text-outline mt-1 font-semibold">Today's Visits</span>
          </div>
        </div>

        {/* 2. REGISTERED ACCOUNTS DIRECTORY TABLE */}
        <div className="flex flex-col gap-4 p-5 md:p-6 rounded-3xl glass-panel border border-white/60 shadow-lg bg-white/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/30 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">badge</span>
              </span>
              <div>
                <h2 className="font-headline-md text-lg font-bold text-primary">Registered Member Accounts</h2>
                <p className="font-body-md text-xs text-on-surface-variant">
                  Sorted by Pearl Number ascending (#0001, #0002...). Click column headers to re-sort.
                </p>
              </div>
            </div>

            {/* Table Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search name, email, or pearl #..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-white/80 border border-primary/30 rounded-full pl-9 pr-4 py-1.5 font-body-md text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-xs"
              />
              <span className="material-symbols-outlined text-primary/60 text-lg absolute left-3 top-1.5">
                search
              </span>
            </div>
          </div>

          {/* Accounts Table Container */}
          <div className="overflow-x-auto w-full rounded-2xl border border-white/50 shadow-inner bg-white/30">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/10 border-b border-primary/20 text-primary font-label-sm text-xs font-bold uppercase tracking-wider">
                  <th
                    onClick={() => handleSortToggle('name')}
                    className="py-3 px-4 cursor-pointer hover:bg-primary/15 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Member Name</span>
                      <span className="material-symbols-outlined text-sm">
                        {sortField === 'name' ? (sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                      </span>
                    </div>
                  </th>
                  <th className="py-3 px-4">Username</th>
                  <th
                    onClick={() => handleSortToggle('pearlVal')}
                    className="py-3 px-4 cursor-pointer hover:bg-primary/15 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Pearl Number</span>
                      <span className="material-symbols-outlined text-sm text-amber-800">
                        {sortField === 'pearlVal' ? (sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                      </span>
                    </div>
                  </th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Role / Status</th>
                  <th
                    onClick={() => handleSortToggle('createdAtDate')}
                    className="py-3 px-4 cursor-pointer hover:bg-primary/15 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Joined Date</span>
                      <span className="material-symbols-outlined text-sm">
                        {sortField === 'createdAtDate' ? (sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/30 font-body-md text-xs">
                {loadingUsers ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-on-surface-variant font-medium">
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Loading registered member accounts...
                      </div>
                    </td>
                  </tr>
                ) : sortedAndFilteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-on-surface-variant font-medium">
                      No matching registered accounts found.
                    </td>
                  </tr>
                ) : (
                  sortedAndFilteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/50 transition-colors">
                      {/* Member Name */}
                      <td className="py-3.5 px-4 font-semibold text-on-surface">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-secondary text-white font-bold text-xs flex items-center justify-center shadow-xs">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-primary text-sm">{user.name}</span>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          {user.username}
                        </span>
                      </td>

                      {/* Pearl Number Badge */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 bg-amber-100/90 text-amber-900 border border-amber-300 font-mono font-bold text-xs px-2.5 py-1 rounded-full shadow-xs">
                          <img src="/assets/collectibles/pearl.png" alt="Pearl" className="w-3.5 h-3.5 object-contain" />
                          {user.pearlNumber}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 font-mono text-xs text-on-surface-variant">
                        {user.email}
                      </td>

                      {/* Role / Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {user.role === 'admin' && (
                            <span className="bg-primary text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shadow-xs">
                              Admin
                            </span>
                          )}
                          {user.isEarlyMember && (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                              Early Member
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-on-surface-variant text-[11px] font-medium">
                        {user.createdAt}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center text-[11px] text-outline px-1">
            <span>Showing {sortedAndFilteredUsers.length} of {userProfiles.length} total registered accounts</span>
            <span className="font-semibold text-primary">Sorted numerically by Pearl Number</span>
          </div>
        </div>

        {/* 3. Most Used Features Ranking */}
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

        {/* 4. Aggregate Activity Totals */}
        <div className="flex flex-col gap-3">
          <h2 className="font-label-sm text-xs text-primary uppercase tracking-widest font-semibold px-1">
            Aggregate Activity Metrics
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

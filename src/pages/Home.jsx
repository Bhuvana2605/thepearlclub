import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSanctuary } from '../context/SanctuaryContext';
import { GoldenPearlPopup } from '../components/GoldenPearlPopup';
import { AchievementModal } from '../components/AchievementModal';
import { PearlClubLogo } from '../components/brand/PearlClubLogo';
import { getQuoteForDateAndTime } from '../data/quotes';

export const Home = () => {
  const {
    worldState,
    rewardFlags,
    pendingUnlockedAchievement,
    setPendingUnlockedAchievement,
    tasks,
    activeTasks,
    addTask,
    toggleTask,
    togglePanel
  } = useSanctuary();

  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [greeting, setGreeting] = useState('Good afternoon.');
  const [currentQuote, setCurrentQuote] = useState({ text: 'Nothing needs to be solved all at once.' });
  const [showPearlDiscovery, setShowPearlDiscovery] = useState(false);
  const [isAddingPriority, setIsAddingPriority] = useState(false);
  const [inlineInput, setInlineInput] = useState('');
  const [inlineError, setInlineError] = useState('');

  const handleInlineAdd = (e) => {
    e.preventDefault();
    if (!inlineInput.trim()) return;
    const ok = addTask(inlineInput);
    if (ok) {
      setInlineInput('');
      setIsAddingPriority(false);
      setInlineError('');
    } else {
      setInlineError('Rule of 3 limit reached (max 3 active). Complete one to add a new priority.');
    }
  };

  useEffect(() => {
    const updateClockAndGreeting = () => {
      const now = new Date();

      // Automatically detect user's system/device location timezone (e.g., 'America/New_York', 'Asia/Kolkata', 'Europe/London')
      let userTimeZone;
      try {
        userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch (err) {
        userTimeZone = undefined; // Fallback to system local if unsupported
      }

      // 1. Format Time according to user's location & timezone
      const timeFormatter = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        ...(userTimeZone ? { timeZone: userTimeZone } : {})
      });
      setTimeStr(timeFormatter.format(now));

      // 2. Format Date according to user's location & timezone
      const dateFormatter = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        ...(userTimeZone ? { timeZone: userTimeZone } : {})
      });
      setDateStr(dateFormatter.format(now));

      // 3. Extract local hour (0-23) in user's timezone for accurate location-based greeting
      const hourFormatter = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: false,
        ...(userTimeZone ? { timeZone: userTimeZone } : {})
      });
      const hours = parseInt(hourFormatter.format(now), 10);

      // 4. ISO Date key in user timezone for curated daily quote
      const isoFormatter = new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        ...(userTimeZone ? { timeZone: userTimeZone } : {})
      });
      const dateKey = isoFormatter.format(now);

      let tod = 'afternoon';
      let greet = 'Good afternoon.';

      if (hours >= 5 && hours < 10) {
        tod = 'morning';
        greet = 'Good morning.';
      } else if (hours >= 10 && hours < 12) {
        tod = 'late_morning';
        greet = 'Take your time.';
      } else if (hours >= 12 && hours < 17) {
        tod = 'afternoon';
        greet = 'Good afternoon.';
      } else if (hours >= 17 && hours < 21) {
        tod = 'evening';
        greet = 'Good evening.';
      } else {
        tod = 'night';
        greet = 'Good night.';
      }

      setGreeting(greet);
      const selectedQuote = getQuoteForDateAndTime(dateKey, tod);
      setCurrentQuote(selectedQuote);
    };

    updateClockAndGreeting();
    const interval = setInterval(updateClockAndGreeting, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="homeViewport relative w-full min-h-screen overflow-hidden">
      {/* UI Content Layer (z-10, relative, pointer-events-auto) */}
      <main className="homeUI relative z-10 min-h-[88vh] flex flex-col items-center justify-center p-organic-padding pt-20 sm:pt-24 md:pt-24 pb-16 max-w-[900px] mx-auto pointer-events-auto">
        {/* Floating Interactive Treasure Chest for Pending Reward Reveal */}
        {rewardFlags?.goldenPearlRevealPending && (
          <button
            onClick={() => setShowPearlDiscovery(true)}
            className="absolute bottom-1/3 left-1/4 z-30 group p-2.5 rounded-full glass-panel border border-amber-300/80 shadow-xl animate-bounce hover:scale-110 transition-transform"
            style={{ animationDuration: '3.5s' }}
            title="Unclaimed Treasure"
            aria-label="Open Reward Treasure Chest"
          >
            <img
              src="/assets/collectibles/treasure-chest.png"
              alt="Reward Treasure Chest"
              className="w-10 h-10 object-contain drop-shadow-md"
            />
          </button>
        )}

        {/* 1. Time / Greeting Card (Compact Padding, Prominent Time Digits, Minimal Whitespace) */}
        <div className="text-center flex flex-col items-center gap-1 glass-panel px-4 py-3 sm:py-3.5 rounded-3xl pearl-glow max-w-xs sm:max-w-sm w-full shadow-lg relative z-10">
          {/* Official Brand Logo */}
          <PearlClubLogo variant="full" size="md" className="my-0" />

          <h2 className="font-headline-md text-headline-md text-primary text-lg sm:text-xl font-semibold tracking-tight my-0">
            {greeting}
          </h2>

          {/* Live Clock & Local Date (Prominently Sized Time with Compact Layout) */}
          <div className="flex flex-col items-center gap-0 my-0.5">
            <div className="font-display-md text-4xl sm:text-5xl md:text-5xl text-secondary tracking-wider font-normal">
              {timeStr || '12:00 PM'}
            </div>
            <div className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold mt-0.5">
              {dateStr || 'August 22, 2026'}
            </div>
          </div>

          <div className="w-12 h-[1px] bg-primary/20 my-0.5"></div>

          {/* Deterministic Curated Quote */}
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-xs italic font-normal text-center leading-snug">
            "{currentQuote.text}"
          </p>
        </div>

        {/* Home Quick Utilities Section (Compact Rhythm Stack) */}
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mt-2.5 sm:mt-3 z-10 flex flex-col gap-2 sm:gap-2.5">
          {/* 2. Today's Priorities Card (Medium Prominence) */}
          <div className="glass-panel-opaque p-3 sm:p-3.5 rounded-2xl shadow-md flex flex-col gap-2">
            <div className="flex justify-between items-center border-b border-white/25 pb-1.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">checklist</span>
                <h3 className="font-label-sm text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
                  Today's Priorities
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsAddingPriority(!isAddingPriority);
                    setInlineError('');
                  }}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-white hover:bg-primary/90 transition-all flex items-center justify-center shadow-xs active:scale-95"
                  title="Add Priority directly from Home"
                  aria-label="Add Priority directly from Home"
                >
                  <span className="material-symbols-outlined text-sm sm:text-base">
                    {isAddingPriority ? 'close' : 'add'}
                  </span>
                </button>
                <button
                  onClick={() => togglePanel('todo')}
                  className="text-xs font-label-sm text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  <span>View All</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Inline Add Priority Form */}
            {isAddingPriority && (
              <form onSubmit={handleInlineAdd} className="flex flex-col gap-1.5 my-1 animate-fade-in">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="What's your priority?"
                    value={inlineInput}
                    onChange={(e) => {
                      setInlineInput(e.target.value);
                      setInlineError('');
                    }}
                    autoFocus
                    className="flex-1 bg-white/80 border border-primary/30 rounded-xl px-3 py-1.5 font-body-md text-xs sm:text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    type="submit"
                    className="bg-primary text-white px-3.5 py-1.5 rounded-xl font-label-sm text-xs font-semibold hover:bg-primary/90 transition-all active:scale-95 shadow-xs"
                  >
                    Add
                  </button>
                </div>
                {inlineError && (
                  <p className="font-label-sm text-[11px] text-amber-700 font-medium px-1">
                    {inlineError}
                  </p>
                )}
              </form>
            )}

            {activeTasks && activeTasks.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {activeTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center gap-2.5 cursor-pointer group p-1.5 rounded-xl hover:bg-white/40 transition-colors"
                  >
                    <span className={`material-symbols-outlined text-lg ${task.completed ? 'text-primary' : 'text-outline group-hover:text-primary'}`}>
                      {task.completed ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                    <span className={`font-body-md text-xs sm:text-sm md:text-sm text-on-surface-variant line-clamp-1 ${task.completed ? 'line-through opacity-60' : 'font-medium'}`}>
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-1">
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant/70 italic">All priorities completed. Click + to add one.</p>
              </div>
            )}
          </div>

          {/* 3. Chronicle / Journal Shortcut Card (Higher Opacity for 100% Legibility) */}
          <div className="flex items-center justify-between glass-panel-opaque bg-white/70 dark:bg-slate-900/80 p-3 sm:p-3.5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">edit_note</span>
              </div>
              <div>
                <h4 className="font-label-sm text-xs sm:text-sm font-semibold text-primary">Chronicle Journal</h4>
                <p className="font-body-md text-xs sm:text-xs text-on-surface-variant font-medium">Reflect on your day in quiet space.</p>
              </div>
            </div>

            <Link
              to="/journal"
              className="py-1.5 px-3.5 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow-xs hover:bg-primary/90 transition-transform active:scale-95 flex items-center gap-1 shrink-0"
            >
              <span>Write</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>
        </div>
        <GoldenPearlPopup
          isOpen={showPearlDiscovery}
          onClose={() => setShowPearlDiscovery(false)}
        />

        <AchievementModal
          achievement={pendingUnlockedAchievement}
          onClose={() => setPendingUnlockedAchievement(null)}
        />
      </main>
    </div>
  );
};

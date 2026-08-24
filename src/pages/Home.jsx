import React, { useState, useEffect } from 'react';
import { useSanctuary } from '../context/SanctuaryContext';
import { GoldenPearlPopup } from '../components/GoldenPearlPopup';
import { AchievementModal } from '../components/AchievementModal';
import { LivingOceanCanvas } from '../components/LivingOceanCanvas';
import { EnvironmentBackground } from '../components/EnvironmentBackground';
import { PearlClubLogo } from '../components/brand/PearlClubLogo';
import { getQuoteForDateAndTime } from '../data/quotes';

export const Home = () => {
  const {
    worldState,
    pendingUnlockedAchievement,
    setPendingUnlockedAchievement
  } = useSanctuary();

  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [greeting, setGreeting] = useState('Good afternoon.');
  const [currentQuote, setCurrentQuote] = useState({ text: 'Nothing needs to be solved all at once.' });
  const [showPearlDiscovery, setShowPearlDiscovery] = useState(false);
  const [pearlFloatingOnScreen, setPearlFloatingOnScreen] = useState(false);

  useEffect(() => {
    const updateClockAndGreeting = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const dateKey = now.toISOString().split('T')[0];

      const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
      setDateStr(now.toLocaleDateString('en-US', dateOptions));

      let displayHours = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayMins = minutes < 10 ? '0' + minutes : minutes;
      setTimeStr(`${displayHours}:${displayMins} ${ampm}`);

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

  useEffect(() => {
    if (!worldState.hasGoldenPearl) {
      const timer = setTimeout(() => {
        setPearlFloatingOnScreen(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [worldState.hasGoldenPearl]);

  return (
    <main className="relative z-20 min-h-[82vh] flex flex-col items-center justify-center p-organic-padding pt-20 pb-28 md:pb-36 max-w-[900px] mx-auto">
      {/* Living Ocean Marine Life Animation Canvas */}
      <LivingOceanCanvas />

      {/* Floating Interactive Golden Pearl */}
      {pearlFloatingOnScreen && !worldState.hasGoldenPearl && (
        <button
          onClick={() => setShowPearlDiscovery(true)}
          className="absolute bottom-1/3 left-1/4 z-30 group flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-amber-300 text-amber-900 shadow-lg animate-bounce"
          style={{ animationDuration: '4s' }}
          title="Click to inspect Golden Pearl"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-white to-amber-200 pearl-glow"></div>
          <span className="font-label-sm text-xs font-semibold">Golden Pearl</span>
        </button>
      )}

      {/* Compact Ambient Glass Panel Sanctuary Card */}
      <div className="text-center flex flex-col items-center gap-3 sm:gap-3.5 glass-panel-opaque p-4 sm:p-5 md:p-6 rounded-3xl pearl-glow max-w-xs sm:max-w-sm md:max-w-md w-full my-auto border border-white/60 shadow-2xl relative z-10">
        {/* Official Brand Logo */}
        <PearlClubLogo variant="full" size="md" className="my-0.5" />

        <h2 className="font-headline-md text-headline-md text-primary text-xl font-semibold tracking-tight">
          {greeting}
        </h2>

        {/* Live Clock & Local Date */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="font-display-md text-display-md text-2xl md:text-3xl text-secondary tracking-wider font-light">
            {timeStr || '12:00 PM'}
          </div>
          <div className="font-label-sm text-[11px] text-outline uppercase tracking-widest font-semibold">
            {dateStr || 'August 22, 2026'}
          </div>
        </div>

        <div className="w-12 h-[1px] bg-primary/20 my-0.5"></div>

        {/* Deterministic Curated Quote (Rendered in Quicksand) */}
        <p className="font-body-md text-xs md:text-sm text-on-surface-variant max-w-xs italic font-normal text-center leading-relaxed">
          "{currentQuote.text}"
        </p>
      </div>

      {/* Modals */}
      <GoldenPearlPopup
        isOpen={showPearlDiscovery}
        onClose={() => setShowPearlDiscovery(false)}
      />

      <AchievementModal
        achievement={pendingUnlockedAchievement}
        onClose={() => setPendingUnlockedAchievement(null)}
      />
    </main>
  );
};

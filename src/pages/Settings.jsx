import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSanctuary } from '../context/SanctuaryContext';

export const Settings = () => {
  const navigate = useNavigate();
  const {
    settings,
    setSettings,
    selectedEnvironment,
    setEnvironment,
    resetAllLocalData,
    signOutUser,
    currentUser,
    focusHistory,
    focusState,
    pearlNumber,
    formattedPearlNumber,
    isEarlyMember,
    isDailyRewardAvailable,
    claimDailyReward,
    returnDays,
    returnRewards,
    environmentAudioEnabled,
    setEnvironmentAudioEnabled,
    environmentAudioVolume,
    setEnvironmentAudioVolume
  } = useSanctuary();

  const appearanceModes = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' }
  ];

  const fontSizes = [
    { id: 'small', label: 'Small' },
    { id: 'default', label: 'Medium' },
    { id: 'large', label: 'Large' }
  ];

  const themes = [
    { id: 'Ocean', label: 'Ocean' },
    { id: 'Rainy Ocean', label: 'Rainy Ocean' },
    { id: 'Underwater', label: 'Underwater' }
  ];

  const handleAppearanceChange = (appId) => {
    setSettings((prev) => ({ ...prev, appearance: appId }));
  };

  const handleFontSizeChange = (sizeId) => {
    setSettings((prev) => ({ ...prev, fontSize: sizeId }));
  };

  const handleMotionChange = (isReduced) => {
    setSettings((prev) => ({ ...prev, reducedMotion: isReduced }));
  };

  const handleThemeChange = (themeLabel) => {
    setEnvironment(themeLabel);
  };

  const handleSignOut = async () => {
    if (window.confirm('Sign out of online session? (Your private local data remains safe on this device)')) {
      await signOutUser();
      navigate('/login');
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all local Pearl Club data? This will clear tasks, history, and rewards.')) {
      resetAllLocalData();
      alert('Local haven data has been reset.');
    }
  };

  return (
    <main className="relative z-10 w-full min-h-[85vh] flex flex-col items-center justify-center pt-24 pb-32 px-organic-padding md:px-bubble-margin">
      <div className="w-full max-w-2xl glass-panel rounded-[2rem] p-8 md:p-12 shadow-2xl flex flex-col gap-8 border border-white/50">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/30 pb-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary">Settings</h1>
            <p className="font-body-md text-on-surface-variant/80">Customize your presentation & accessibility preferences.</p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="py-2 px-5 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow hover:bg-primary/90 transition-all flex items-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Home
          </button>
        </div>

        {/* SECTION 1: APPLICATION APPEARANCE (LIGHT / DARK) */}
        <div className="flex flex-col gap-3">
          <h2 className="font-label-sm text-xs text-primary uppercase tracking-widest font-semibold">
            Appearance Mode
          </h2>
          <div className="flex gap-3">
            {appearanceModes.map((app) => (
              <button
                key={app.id}
                onClick={() => handleAppearanceChange(app.id)}
                className={`flex-1 py-3 px-4 rounded-xl font-label-sm text-xs font-semibold transition-all border ${
                  settings.appearance === app.id
                    ? 'bg-primary text-white border-primary shadow'
                    : 'bg-white/40 text-on-surface-variant border-white/50 hover:bg-white/70'
                }`}
              >
                {app.label}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 2: INTERFACE FONT SIZE */}
        <div className="flex flex-col gap-3">
          <h2 className="font-label-sm text-xs text-primary uppercase tracking-widest font-semibold">
            Interface Font Size
          </h2>
          <div className="flex gap-3">
            {fontSizes.map((fs) => (
              <button
                key={fs.id}
                onClick={() => handleFontSizeChange(fs.id)}
                className={`flex-1 py-3 px-4 rounded-xl font-label-sm text-xs font-semibold transition-all border ${
                  settings.fontSize === fs.id
                    ? 'bg-primary text-white border-primary shadow'
                    : 'bg-white/40 text-on-surface-variant border-white/50 hover:bg-white/70'
                }`}
              >
                {fs.label}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 3: REDUCED MOTION */}
        <div className="flex flex-col gap-3">
          <h2 className="font-label-sm text-xs text-primary uppercase tracking-widest font-semibold">
            Motion Controls
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => handleMotionChange(false)}
              className={`flex-1 py-3 px-4 rounded-xl font-label-sm text-xs font-semibold transition-all border ${
                !settings.reducedMotion
                  ? 'bg-primary text-white border-primary shadow'
                  : 'bg-white/40 text-on-surface-variant border-white/50 hover:bg-white/70'
              }`}
            >
              Standard Motion
            </button>
            <button
              onClick={() => handleMotionChange(true)}
              className={`flex-1 py-3 px-4 rounded-xl font-label-sm text-xs font-semibold transition-all border ${
                settings.reducedMotion
                  ? 'bg-primary text-white border-primary shadow'
                  : 'bg-white/40 text-on-surface-variant border-white/50 hover:bg-white/70'
              }`}
            >
              Reduced Motion
            </button>
          </div>
        </div>

        {/* SECTION 4: GLOBAL ENVIRONMENT UNDERWATER AUDIO */}
        <div className="p-5 rounded-2xl bg-white/40 border border-white/60 flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-label-sm text-xs text-primary uppercase tracking-widest font-semibold">
                Environment Sounds
              </h2>
              <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                Subtle background underwater ambience mapped to active theme. Decoupled from Music page.
              </p>
            </div>

            <button
              onClick={() => setEnvironmentAudioEnabled(!environmentAudioEnabled)}
              className={`px-4 py-2 rounded-full font-label-sm text-xs font-semibold shadow transition-all ${
                environmentAudioEnabled
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white/60 text-outline border-white/60'
              }`}
            >
              {environmentAudioEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {environmentAudioEnabled && (
            <div className="flex flex-col gap-2 pt-2 border-t border-white/40">
              <div className="flex justify-between items-center">
                <span className="font-label-sm text-xs font-semibold text-primary">Ambience Volume</span>
                <span className="font-label-sm text-xs font-semibold text-secondary">
                  {Math.round(environmentAudioVolume * 100)}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={environmentAudioVolume}
                onChange={(e) => setEnvironmentAudioVolume(parseFloat(e.target.value))}
                className="w-full accent-primary h-2 rounded-lg bg-white/60 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* SECTION 5: ENVIRONMENT THEME SWITCHER */}
        <div className="flex flex-col gap-3">
          <h2 className="font-label-sm text-xs text-primary uppercase tracking-widest font-semibold">
            Haven Environment Theme
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {themes.map((t) => {
              const isActive = (selectedEnvironment && selectedEnvironment.name === t.label) || settings.theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleThemeChange(t.label)}
                  className={`p-4 rounded-xl flex flex-col items-center justify-between gap-2 border transition-all ${
                    isActive
                      ? 'bg-secondary-container/70 border-secondary text-on-secondary-container font-semibold shadow'
                      : 'bg-white/40 border-white/50 text-on-surface-variant hover:bg-white/70'
                  }`}
                >
                  <span className="font-label-sm text-xs">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 5: YOUR PROGRESS & FOCUS JOURNEY */}
        <div className="p-5 rounded-2xl bg-white/40 border border-white/60 flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-label-sm text-xs text-primary uppercase tracking-widest font-semibold">
                Your Progress • Focus Journey
              </h2>
              <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                Complete qualifying Focus sessions to advance your haven journey.
              </p>
            </div>
            <span className="font-label-sm text-xs font-semibold text-primary bg-primary-container/40 px-3 py-1 rounded-full border border-primary-container/30">
              {formattedPearlNumber} {isEarlyMember ? '• Early Member' : ''}
            </span>
          </div>

          {/* DAILY REWARD COMPACT SECTION */}
          <div className="p-4 rounded-xl bg-white/50 border border-white/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/80 border border-white/60 flex items-center justify-center p-2 shadow-sm shrink-0 pearl-glow">
                <img src="/assets/collectibles/pearl.png" alt="Daily Reward" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h3 className="font-label-sm text-xs font-semibold text-primary">DAILY REWARD</h3>
                <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                  {isDailyRewardAvailable
                    ? "Your daily reward is ready."
                    : "Today's reward has been claimed. Come back tomorrow."}
                </p>
              </div>
            </div>

            <button
              onClick={() => claimDailyReward()}
              disabled={!isDailyRewardAvailable}
              className={`px-5 py-2.5 rounded-full font-label-sm text-xs font-semibold shadow transition-all ${
                isDailyRewardAvailable
                  ? 'bg-primary text-white hover:bg-primary/90 active:scale-95'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-75'
              }`}
            >
              {isDailyRewardAvailable ? 'Claim Reward' : 'Claimed today'}
            </button>
          </div>

          {/* 7-Step Focus Visual Tracker */}
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/50 border border-white/60">
            <div className="flex justify-between items-center">
              <span className="font-label-sm text-xs font-semibold text-on-surface">Golden Pearl Focus Progress</span>
              <span className="font-headline-md text-headline-md text-primary text-xs font-semibold">
                {Math.min(7, (focusState?.qualifyingDates?.length || 0))} / 7 Days
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 my-1">
              {[...Array(7)].map((_, i) => {
                const isCompleted = i < Math.min(7, (focusState?.qualifyingDates?.length || 0));
                return (
                  <div
                    key={i}
                    className={`flex-1 h-9 rounded-xl flex items-center justify-center font-label-sm text-xs transition-all ${
                      isCompleted
                        ? 'bg-gradient-to-br from-primary to-teal-700 text-white font-bold shadow pearl-glow'
                        : 'bg-white/40 border border-white/60 text-outline'
                    }`}
                  >
                    {isCompleted ? '●' : '○'}
                  </div>
                );
              })}
            </div>
            <p className="font-label-sm text-[11px] text-outline text-center">
              Accumulates at your own pace whenever you complete focus sessions. Missing a day does not reset your progress.
            </p>
          </div>

          {/* Real Haven Focus Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white/40 text-center border border-white/50">
              <span className="font-headline-lg text-headline-lg text-primary">
                {focusState?.qualifyingDates?.length || 0}
              </span>
              <span className="font-label-sm text-[11px] text-outline block mt-0.5">Focus Days</span>
            </div>

            <div className="p-3 rounded-xl bg-white/40 text-center border border-white/50">
              <span className="font-headline-lg text-headline-lg text-secondary">
                {(focusHistory || []).length}
              </span>
              <span className="font-label-sm text-[11px] text-outline block mt-0.5">Focus Sessions</span>
            </div>

            <div className="p-3 rounded-xl bg-white/40 text-center border border-white/50">
              <span className="font-headline-lg text-headline-lg text-tertiary">
                {(focusHistory || []).reduce((acc, s) => acc + (s.duration || 0), 0)}
              </span>
              <span className="font-label-sm text-[11px] text-outline block mt-0.5">Focus Minutes</span>
            </div>

            <div className="p-3 rounded-xl bg-white/40 text-center border border-white/50">
              <span className="font-headline-lg text-headline-lg text-amber-800 font-bold">
                {focusState?.pearls ? focusState.pearls.filter((p) => p.status === 'available').length : 0}
              </span>
              <span className="font-label-sm text-[11px] text-outline block mt-0.5">Focus Pearls</span>
            </div>
          </div>
        </div>

        {/* SECTION 6: SIGN OUT */}
        <div className="p-4 rounded-xl bg-white/30 border border-white/40 flex justify-between items-center">
          <div>
            <h3 className="font-headline-md text-headline-md text-primary text-sm font-semibold">Account Session</h3>
            <p className="font-label-sm text-xs text-on-surface-variant">
              {currentUser ? `Signed in as ${currentUser.email}` : 'Local haven active.'}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-5 py-2.5 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow hover:bg-primary/90 transition-transform"
          >
            Sign Out
          </button>
        </div>

        <hr className="border-white/20" />

        {/* SECTION 6: DATA RESET */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-headline-md text-headline-md text-error text-base">Reset Haven Data</h3>
            <p className="font-label-sm text-xs text-on-surface-variant">Clear all local tasks, journal entries, and collectibles.</p>
          </div>
          <button
            onClick={handleReset}
            className="px-5 py-2.5 rounded-full bg-error/90 text-white font-label-sm text-xs font-semibold shadow hover:bg-error transition-transform"
          >
            Reset All Data
          </button>
        </div>
      </div>
    </main>
  );
};

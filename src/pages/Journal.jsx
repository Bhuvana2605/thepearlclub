import React, { useState } from 'react';
import { useSanctuary } from '../context/SanctuaryContext';
import { MoodCanvas } from './MoodCanvas';

export const Journal = () => {
  const { journalEntries, saveJournalEntry, activityHistory, triggerNaturalDiscovery } = useSanctuary();
  const [activeTab, setActiveTab] = useState('chronicle'); // 'chronicle' | 'canvas' | 'history'

  const todayKey = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [textInput, setTextInput] = useState(() => journalEntries[todayKey]?.text || '');
  const [saveStatus, setSaveStatus] = useState('');

  const currentEntry = journalEntries[selectedDate] || { text: '', drawingDataUrl: null };

  const handleDateChange = (e) => {
    const d = e.target.value;
    setSelectedDate(d);
    setTextInput(journalEntries[d]?.text || '');
    setSaveStatus('');
  };

  const handleSaveText = () => {
    saveJournalEntry(selectedDate, textInput);
    if (triggerNaturalDiscovery) {
      triggerNaturalDiscovery('journal');
    }
    setSaveStatus('Entry saved locally');
    setTimeout(() => setSaveStatus(''), 2500);
  };

  // Activity Calendar Grid Generator for August 2026 / current month
  const renderActivityCalendar = () => {
    const daysInMonth = Array.from({ length: 31 }, (_, i) => {
      const dayNum = i + 1;
      const dateStr = `2026-08-${dayNum < 10 ? '0' + dayNum : dayNum}`;
      return { dayNum, dateStr };
    });

    const journalDates = activityHistory.journal || [];
    const focusDates = activityHistory.focus || [];
    const gameDates = [
      ...(activityHistory.sudoku || []),
      ...(activityHistory.pearlCatch || []),
      ...(activityHistory.quickMath || [])
    ];

    return (
      <div className="w-full flex flex-col gap-6">
        <div className="flex justify-between items-center px-1">
          <h2 className="font-headline-md text-headline-md text-primary text-lg font-semibold">
            August 2026 Memory Map
          </h2>
          <div className="flex items-center gap-3 font-label-sm text-xs text-outline">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 inline-block shadow-xs"></span>
              <span className="font-semibold text-on-surface">Journal</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block shadow-xs"></span>
              <span className="font-semibold text-on-surface">Focus</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block shadow-xs"></span>
              <span className="font-semibold text-on-surface">Game</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 bg-white/40 p-4 rounded-2xl border border-white/50 shadow-inner text-center">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="font-label-sm text-xs text-outline font-semibold uppercase tracking-wider py-1">
              {day}
            </div>
          ))}

          {daysInMonth.map(({ dayNum, dateStr }) => {
            const hasJournal = journalDates.includes(dateStr);
            const hasFocus = focusDates.includes(dateStr);
            const hasGame = gameDates.includes(dateStr);
            const isToday = dateStr === todayKey;

            return (
              <div
                key={dateStr}
                onClick={() => {
                  setSelectedDate(dateStr);
                  setTextInput(journalEntries[dateStr]?.text || '');
                  setActiveTab('chronicle');
                }}
                className={`p-2 min-h-[50px] rounded-xl flex flex-col items-center justify-between cursor-pointer transition-all ${
                  isToday
                    ? 'bg-primary-container/60 border border-primary text-on-primary-container font-bold shadow-sm'
                    : 'bg-white/40 hover:bg-white/70 text-on-surface'
                }`}
                title={`Inspect ${dateStr}`}
              >
                <span className="font-label-sm text-xs">{dayNum}</span>
                <div className="flex gap-1 items-center">
                  {hasJournal && (
                    <span className="w-2 h-2 rounded-full bg-emerald-700 inline-block shadow-xs" title="Journal Entry" />
                  )}
                  {hasFocus && (
                    <span className="w-2 h-2 rounded-full bg-teal-500 inline-block shadow-xs" title="Focus Session" />
                  )}
                  {hasGame && (
                    <span className="w-2 h-2 rounded-full bg-rose-400 inline-block shadow-xs" title="Game Played" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <main className="max-w-[900px] mx-auto pt-24 pb-32 px-organic-padding relative z-10 min-h-[85vh]">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary mb-1">Chronicle</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            A quiet space for reflection and visual memories.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1.5 glass-panel p-1.5 rounded-full border border-white/50 shadow-sm">
          <button
            onClick={() => setActiveTab('chronicle')}
            className={`px-4 py-1.5 rounded-full font-label-sm text-xs font-semibold transition-all ${
              activeTab === 'chronicle' ? 'bg-primary text-white shadow' : 'text-on-surface-variant hover:bg-white/40'
            }`}
          >
            Chronicle
          </button>
          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-4 py-1.5 rounded-full font-label-sm text-xs font-semibold transition-all ${
              activeTab === 'canvas' ? 'bg-primary text-white shadow' : 'text-on-surface-variant hover:bg-white/40'
            }`}
          >
            Mood Canvas
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-full font-label-sm text-xs font-semibold transition-all ${
              activeTab === 'history' ? 'bg-primary text-white shadow' : 'text-on-surface-variant hover:bg-white/40'
            }`}
          >
            History Map
          </button>
        </div>
      </header>

      {/* TAB 1: CHRONICLE TEXT JOURNAL */}
      {activeTab === 'chronicle' && (
        <section className="glass-panel rounded-2xl p-6 md:p-10 border border-white/50 shadow-2xl flex flex-col gap-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/30 pb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">calendar_today</span>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="bg-white/70 border border-white/60 rounded-xl px-3 py-1.5 font-label-sm text-xs text-primary font-semibold focus:outline-none"
              />
            </div>

            {saveStatus && (
              <span className="font-label-sm text-xs text-primary font-semibold bg-primary-container/40 px-3 py-1 rounded-full border border-primary-container/30">
                {saveStatus}
              </span>
            )}
          </div>

          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Write freely. Your thoughts stay strictly private on this device..."
            rows={10}
            className="w-full bg-white/40 border border-white/50 rounded-2xl p-4 md:p-6 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container shadow-inner resize-y"
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={handleSaveText}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-label-sm text-xs font-semibold shadow hover:scale-105 transition-transform"
            >
              Save Chronicle
            </button>
          </div>
        </section>
      )}

      {/* TAB 2: MOOD CANVAS */}
      {activeTab === 'canvas' && (
        <section className="animate-fade-in">
          <MoodCanvas />
        </section>
      )}

      {/* TAB 3: ACTIVITY CALENDAR HISTORY MAP */}
      {activeTab === 'history' && (
        <section className="glass-panel rounded-2xl p-6 md:p-10 border border-white/50 shadow-2xl animate-fade-in">
          {renderActivityCalendar()}
        </section>
      )}
    </main>
  );
};

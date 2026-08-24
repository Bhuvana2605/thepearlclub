import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSanctuary } from '../context/SanctuaryContext';

export const SmallThings = () => {
  const navigate = useNavigate();
  const { saveJournalEntry } = useSanctuary();
  const todayKey = new Date().toISOString().split('T')[0];

  // --- Breathing State (4-7-8 Technique) ---
  const [breathePhase, setBreathePhase] = useState('Inhale'); // 'Inhale' | 'Hold' | 'Exhale'
  const [breatheSeconds, setBreatheSeconds] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(true);

  useEffect(() => {
    if (!isBreathingActive) return;

    // 4s Inhale -> 7s Hold -> 8s Exhale (Total cycle: 19s)
    let timer;
    let secondsLeft = 4;

    const cycle = () => {
      setBreathePhase('Inhale');
      secondsLeft = 4;

      const step = setInterval(() => {
        secondsLeft -= 1;
        if (secondsLeft <= 0) {
          clearInterval(step);

          // Hold phase (7s)
          setBreathePhase('Hold');
          let holdLeft = 7;
          const holdStep = setInterval(() => {
            holdLeft -= 1;
            if (holdLeft <= 0) {
              clearInterval(holdStep);

              // Exhale phase (8s)
              setBreathePhase('Exhale');
              let exhaleLeft = 8;
              const exhaleStep = setInterval(() => {
                exhaleLeft -= 1;
                if (exhaleLeft <= 0) {
                  clearInterval(exhaleStep);
                }
              }, 1000);
            }
          }, 1000);
        }
      }, 1000);
    };

    cycle();
    const cycleInterval = setInterval(cycle, 19000);

    return () => {
      clearInterval(cycleInterval);
    };
  }, [isBreathingActive]);

  // --- Grounding Interactive State ---
  const [checkedItems, setCheckedItems] = useState({});
  const toggleGrounding = (id) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Reflection State ---
  const prompts = [
    "What made you feel light today?",
    "What is one small kindness you experienced or offered?",
    "What sound or sight brought you a moment of comfort?",
    "What can you let go of before today ends?"
  ];
  const [promptIdx, setPromptIdx] = useState(0);
  const [reflectionText, setReflectionText] = useState('');
  const [saveNotice, setSaveNotice] = useState(false);

  const handleSaveReflection = () => {
    if (!reflectionText.trim()) return;
    const formatted = `[Reflection Prompt: ${prompts[promptIdx]}]\n${reflectionText.trim()}`;
    saveJournalEntry(todayKey, formatted);
    setSaveNotice(true);
    setTimeout(() => {
      setSaveNotice(false);
      navigate('/journal');
    }, 1200);
  };

  return (
    <main className="w-full max-w-[900px] mx-auto pt-24 pb-32 px-organic-padding flex flex-col gap-10 relative z-10">
      <header className="text-center">
        <h1 className="font-display-lg text-display-lg text-primary mb-2">Small Things That Help</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Gentle practices to anchor your mind.</p>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Breathing Card (4-7-8 Animated Pearl Ring) */}
        <section className="glass-panel rounded-xl p-8 flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden md:col-span-2 border border-white/50 shadow-xl">
          <h2 className="font-headline-md text-headline-md text-secondary absolute top-6 left-8">Breathing</h2>

          <div className="relative w-48 h-48 flex items-center justify-center my-6">
            <div className="absolute inset-0 bg-primary-container rounded-full blur-2xl opacity-50 animate-breathe"></div>
            <div className="absolute inset-4 bg-secondary-container rounded-full blur-xl opacity-70 animate-breathe"></div>

            <div className="w-32 h-32 bg-surface rounded-full glass-panel z-10 flex flex-col items-center justify-center animate-breathe inner-glow shadow-md border border-white/60">
              <span className="font-headline-md text-headline-md text-primary font-semibold tracking-wider">
                {breathePhase}
              </span>
            </div>
          </div>

          <p className="font-body-md text-body-md text-on-surface-variant text-center max-w-sm">
            4-7-8 Technique. Follow the rhythm of the pearl: 4s Inhale, 7s Hold, 8s Exhale.
          </p>
        </section>

        {/* 2. Grounding Sensory Card (5-4-3-2-1) */}
        <section className="glass-panel rounded-xl p-8 flex flex-col justify-between border border-white/40 shadow-lg">
          <div>
            <h2 className="font-headline-md text-headline-md text-secondary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">nature</span>
              5-4-3-2-1 Grounding
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">
              Take a slow moment to notice your surroundings:
            </p>

            <ul className="space-y-3 font-body-md text-body-md">
              {[
                { count: 5, label: 'things you can see' },
                { count: 4, label: 'things you can touch' },
                { count: 3, label: 'things you can hear' },
                { count: 2, label: 'things you can smell' },
                { count: 1, label: 'thing you can taste' },
              ].map((item) => (
                <li
                  key={item.count}
                  onClick={() => toggleGrounding(item.count)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    checkedItems[item.count] ? 'bg-secondary-container/40 text-primary' : 'hover:bg-white/30'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container font-bold text-xs flex items-center justify-center">
                    {item.count}
                  </span>
                  <span className={checkedItems[item.count] ? 'line-through opacity-70' : 'text-on-surface'}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 3. Reflection Card */}
        <section className="glass-panel rounded-xl p-8 flex flex-col justify-between border border-white/40 shadow-lg relative">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-headline-md text-headline-md text-secondary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history_edu</span>
                Reflection
              </h2>
              <button
                onClick={() => setPromptIdx((prev) => (prev + 1) % prompts.length)}
                className="text-primary p-1.5 rounded-full hover:bg-white/40 transition-colors"
                title="Next prompt"
              >
                <span className="material-symbols-outlined text-lg">refresh</span>
              </button>
            </div>

            <p className="font-headline-md text-headline-md text-primary italic text-center opacity-90 my-4">
              "{prompts[promptIdx]}"
            </p>

            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="Let your thoughts drift here..."
              className="w-full bg-white/50 border border-white/40 rounded-xl p-3.5 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container resize-none h-28 placeholder-outline-variant"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSaveReflection}
              className="bg-primary text-white font-label-sm text-label-sm px-5 py-2.5 rounded-full hover:bg-primary/90 transition-transform active:scale-95 shadow-sm"
            >
              Save to Journal
            </button>
          </div>

          {saveNotice && (
            <span className="absolute bottom-4 left-6 bg-primary text-white text-xs px-3 py-1 rounded-full shadow">
              Saved!
            </span>
          )}
        </section>
      </div>
    </main>
  );
};

import React, { useState } from 'react';
import { bottleService, validateBottleText } from '../lib/supabase/bottleService';
import { useSanctuary } from '../context/SanctuaryContext';

export const Bottle = () => {
  const { bottleSafety, reportBottle, blockSender, incrementDailyBottleCount } = useSanctuary();

  const [activeTab, setActiveTab] = useState('find'); // 'find' | 'send' | 'rules'

  // Received Bottle
  const [currentBottle, setCurrentBottle] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  // Sending Bottle
  const [composerText, setComposerText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [sendSuccess, setSendSuccess] = useState('');

  // Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState('Harassment');

  const communityRules = [
    '1. Be respectful and kind.',
    '2. No harassment or targeted abuse.',
    '3. No sexual or 18+ content.',
    '4. No threats or encouragement of violence.',
    '5. No spam or repeated promotional content.',
    '6. No personal information or contact details.',
    '7. No illegal activity requests or promotion.',
    '8. Do not impersonate another person.',
    '9. Do not use the service to intimidate others.',
    '10. This is not a crisis counseling service.'
  ];

  const handleFetchBottle = async () => {
    setIsFetching(true);
    setCurrentBottle(null);
    const { data } = await bottleService.fetchRandomBottle();
    setIsFetching(false);

    if (data) {
      // Check if blocked or reported locally
      if (bottleSafety.blockedSenders.includes(data.sender_id) || bottleSafety.reportedBottleIds.includes(data.id)) {
        handleFetchBottle();
      } else {
        setCurrentBottle(data);
      }
    }
  };

  const handleSendBottleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setSendSuccess('');

    // Check daily rate limit (Max 5 per day)
    const today = new Date().toISOString().split('T')[0];
    const currentDailyCount = bottleSafety.dailyCount.date === today ? bottleSafety.dailyCount.count : 0;

    if (currentDailyCount >= 5) {
      setValidationError("You've sent enough bottles for today. You can leave another one tomorrow.");
      return;
    }

    const validation = validateBottleText(composerText);
    if (!validation.valid) {
      setValidationError(validation.reason);
      return;
    }

    if (!window.confirm('Are you ready to release this bottle into the ocean?')) {
      return;
    }

    setIsSending(true);
    const { error } = await bottleService.sendBottle(composerText);
    setIsSending(false);

    if (error) {
      setValidationError(error.message);
    } else {
      incrementDailyBottleCount();
      setComposerText('');
      setSendSuccess('Your bottle has been released into the ocean waves.');
    }
  };

  const handleReportSubmit = () => {
    if (currentBottle) {
      reportBottle(currentBottle.id, selectedReportReason);
      setCurrentBottle(null);
      setShowReportModal(false);
      alert('Thank you for keeping Pearl Club safe. This bottle has been reported and hidden.');
    }
  };

  const handleBlockSenderSubmit = () => {
    if (currentBottle && currentBottle.sender_id) {
      blockSender(currentBottle.sender_id);
      setCurrentBottle(null);
      alert('Sender blocked. You will not receive future bottles from this sender.');
    }
  };

  return (
    <main className="max-w-[850px] mx-auto pt-24 pb-32 px-organic-padding relative z-10 min-h-[85vh]">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary mb-1">Message in a Bottle</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Anonymous words drift quietly across the sea.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1.5 glass-panel p-1.5 rounded-full border border-white/50 shadow-sm">
          <button
            onClick={() => setActiveTab('find')}
            className={`px-4 py-1.5 rounded-full font-label-sm text-xs font-semibold transition-all ${
              activeTab === 'find' ? 'bg-primary text-white shadow' : 'text-on-surface-variant hover:bg-white/40'
            }`}
          >
            Find a Bottle
          </button>
          <button
            onClick={() => setActiveTab('send')}
            className={`px-4 py-1.5 rounded-full font-label-sm text-xs font-semibold transition-all ${
              activeTab === 'send' ? 'bg-primary text-white shadow' : 'text-on-surface-variant hover:bg-white/40'
            }`}
          >
            Release a Bottle
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-1.5 rounded-full font-label-sm text-xs font-semibold transition-all ${
              activeTab === 'rules' ? 'bg-primary text-white shadow' : 'text-on-surface-variant hover:bg-white/40'
            }`}
          >
            Rules
          </button>
        </div>
      </header>

      {/* TAB 1: FIND BOTTLE */}
      {activeTab === 'find' && (
        <section className="glass-panel rounded-2xl p-6 md:p-10 border border-white/50 shadow-2xl flex flex-col items-center text-center gap-6 animate-fade-in">
          {!currentBottle ? (
            <>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-container to-secondary-container pearl-glow flex items-center justify-center text-primary shadow-lg my-2">
                <span className="material-symbols-outlined text-4xl">sailing</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-primary text-xl">
                The Ocean Shore
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                Reach into the gentle waves to discover an anonymous message left by another traveler.
              </p>
              <button
                onClick={handleFetchBottle}
                disabled={isFetching}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-label-sm text-xs font-semibold shadow hover:scale-105 transition-transform"
              >
                {isFetching ? 'Searching Waves...' : 'Pick Up a Bottle'}
              </button>
            </>
          ) : (
            <div className="w-full flex flex-col items-center gap-6 animate-fade-in">
              <span className="font-label-sm text-xs text-primary font-semibold uppercase tracking-widest bg-primary-container/40 px-3.5 py-1 rounded-full border border-primary-container/30">
                Discovered Bottle
              </span>

              <p className="font-headline-md text-headline-md text-on-surface max-w-lg italic font-normal text-center leading-relaxed bg-white/40 p-6 rounded-2xl border border-white/50 shadow-inner">
                "{currentBottle.content}"
              </p>

              <div className="flex flex-wrap justify-center items-center gap-3 mt-2">
                <button
                  onClick={handleFetchBottle}
                  className="px-6 py-2.5 rounded-full bg-primary text-white font-label-sm text-xs shadow hover:bg-primary/90"
                >
                  Find Another
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="px-4 py-2 rounded-full bg-white/40 text-error font-label-sm text-xs hover:bg-white/70 border border-white/50"
                >
                  Report
                </button>
                <button
                  onClick={handleBlockSenderSubmit}
                  className="px-4 py-2 rounded-full bg-white/40 text-outline font-label-sm text-xs hover:bg-white/70 border border-white/50"
                >
                  Block Sender
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 2: RELEASE BOTTLE */}
      {activeTab === 'send' && (
        <section className="glass-panel rounded-2xl p-6 md:p-10 border border-white/50 shadow-2xl flex flex-col gap-6 animate-fade-in">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary text-xl mb-1">
              Composer
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Write a gentle, supportive note to release into the shared ocean. (Max 5 per day)
            </p>
          </div>

          <form onSubmit={handleSendBottleSubmit} className="flex flex-col gap-4">
            <textarea
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              placeholder="Write a warm, supportive message to someone out there..."
              rows={6}
              className="w-full bg-white/40 border border-white/50 rounded-2xl p-4 md:p-6 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container shadow-inner resize-y"
            />

            {validationError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-label-sm text-xs">
                {validationError}
              </div>
            )}

            {sendSuccess && (
              <div className="p-3 rounded-xl bg-primary-container/50 border border-primary text-on-primary-container font-label-sm text-xs">
                {sendSuccess}
              </div>
            )}

            <div className="flex justify-between items-center mt-2">
              <span className="font-label-sm text-xs text-outline">
                {composerText.length}/500 characters
              </span>
              <button
                type="submit"
                disabled={isSending}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-label-sm text-xs font-semibold shadow hover:scale-105 transition-transform"
              >
                {isSending ? 'Releasing...' : 'Release this bottle'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* TAB 3: COMMUNITY RULES */}
      {activeTab === 'rules' && (
        <section className="glass-panel rounded-2xl p-6 md:p-10 border border-white/50 shadow-2xl animate-fade-in">
          <h2 className="font-headline-md text-headline-md text-primary text-xl mb-2">
            Community Rules
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            Pearl Club is a peaceful digital sanctuary. Please honor these guidelines when releasing messages:
          </p>

          <div className="space-y-3 bg-white/40 p-6 rounded-2xl border border-white/50 shadow-inner">
            {communityRules.map((rule, idx) => (
              <div key={idx} className="font-body-md text-body-md text-on-surface">
                {rule}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/30 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm glass-panel-opaque rounded-2xl p-6 flex flex-col gap-4 border border-white/60 shadow-2xl">
            <h3 className="font-headline-md text-headline-md text-error text-lg">
              Report Bottle
            </h3>
            <p className="font-body-md text-xs text-on-surface-variant">
              Select a reason for reporting this message:
            </p>

            <select
              value={selectedReportReason}
              onChange={(e) => setSelectedReportReason(e.target.value)}
              className="w-full bg-white/80 border border-white/60 rounded-xl p-2.5 font-label-sm text-xs text-on-surface focus:outline-none"
            >
              <option value="Harassment">Harassment / Targeted abuse</option>
              <option value="Sexual content">Sexual or 18+ content</option>
              <option value="Spam">Spam or promotion</option>
              <option value="Threat">Threat or dangerous content</option>
              <option value="Personal information">Personal contact information</option>
              <option value="Other">Other rule violation</option>
            </select>

            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-full font-label-sm text-xs text-on-surface-variant hover:bg-white/40"
              >
                Cancel
              </button>
              <button
                onClick={handleReportSubmit}
                className="px-5 py-2 rounded-full bg-error text-white font-label-sm text-xs font-semibold shadow"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { PearlClubLogo } from '../components/brand/PearlClubLogo';

export const TermsOfService = () => {
  return (
    <main className="relative z-20 min-h-screen w-full p-organic-padding py-12 bg-gradient-to-b from-[#e1f5fe] via-[#b2dfdb] to-[#80cbc4] dark:from-[#081110] dark:via-[#0d1f1c] dark:to-[#091514] text-slate-800 dark:text-slate-100 flex justify-center">
      <div className="w-full max-w-3xl glass-panel-opaque rounded-[2rem] p-8 md:p-12 flex flex-col gap-8 border border-white/60 dark:border-slate-700/60 shadow-2xl relative z-10 animate-fade-in my-auto">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-3 border-b border-slate-200 dark:border-slate-700/60 pb-6">
          <PearlClubLogo variant="full" size="md" />
          <h1 className="font-headline-lg text-2xl font-bold text-primary dark:text-teal-300 mt-2">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Last Updated: August 27, 2026 | Effective Date: August 27, 2026
          </p>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 font-body-md text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-primary dark:text-teal-200">1. Acceptance of Terms</h2>
            <p>
              By creating an account or accessing <strong>The Pearl Club</strong> ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use or access the Service.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-primary dark:text-teal-200">2. Account Registration & Security</h2>
            <p>
              To use certain features, you may register using an email address or third-party authentication (such as Google OAuth). You are responsible for maintaining the confidentiality of your login credentials and for all activities conducted under your account.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-primary dark:text-teal-200">3. User Conduct & Acceptable Use</h2>
            <p>You agree not to engage in any of the following prohibited activities:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>Using the Service for any unlawful purpose or to post harmful or offensive content.</li>
              <li>Attempting to interfere with, compromise, or disrupt the security and integrity of the application servers.</li>
              <li>Impersonating another person or misrepresenting your affiliation with any entity.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-primary dark:text-teal-200">4. Intellectual Property Rights</h2>
            <p>
              All branding, logos, soundscapes, digital assets, graphics, and code in The Pearl Club are the intellectual property of The Pearl Club unless otherwise stated. Your private content (journal entries, personal notes) remains your property.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-primary dark:text-teal-200">5. Disclaimer of Warranties</h2>
            <p>
              The Pearl Club is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. We do not guarantee uninterrupted or error-free operation.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-primary dark:text-teal-200">6. Termination</h2>
            <p>
              We reserve the right to suspend or terminate access to the Service for any user who violates these Terms of Service or engages in harmful behavior.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-primary dark:text-teal-200">7. Contact Information</h2>
            <p>
              If you have any questions regarding these Terms of Service, please contact us at:
            </p>
            <p className="font-semibold text-primary dark:text-teal-300">
              Email: chbhuvana0505@gmail.com
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700/60 pt-6">
          <Link to="/login" className="text-primary dark:text-teal-300 hover:underline font-semibold">
            ← Back to Login
          </Link>
          <Link to="/privacy" className="text-primary dark:text-teal-300 hover:underline font-semibold">
            Privacy Policy →
          </Link>
        </div>
      </div>
    </main>
  );
};

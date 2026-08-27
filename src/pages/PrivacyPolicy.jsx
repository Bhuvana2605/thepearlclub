import React from 'react';
import { Link } from 'react-router-dom';
import { PearlClubLogo } from '../components/brand/PearlClubLogo';

export const PrivacyPolicy = () => {
  return (
    <main className="relative z-20 min-h-screen w-full p- organic-padding py-12 bg-gradient-to-b from-[#e1f5fe] via-[#b2dfdb] to-[#80cbc4] dark:from-[#081110] dark:via-[#0d1f1c] dark:to-[#091514] text-slate-800 dark:text-slate-100 flex justify-center">
      <div className="w-full max-w-3xl glass-panel-opaque rounded-[2rem] p-8 md:p-12 flex flex-col gap-8 border border-white/60 dark:border-slate-700/60 shadow-2xl relative z-10 animate-fade-in my-auto">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-3 border-b border-slate-200 dark:border-slate-700/60 pb-6">
          <PearlClubLogo variant="full" size="md" />
          <h1 className="font-headline-lg text-2xl font-bold text-primary dark:text-teal-300 mt-2">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Last Updated: August 27, 2026 | Effective Date: August 27, 2026
          </p>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 font-body-md text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-primary dark:text-teal-200">1. Introduction</h2>
            <p>
              Welcome to <strong>The Pearl Club</strong> ("we," "our," or "us"). We are committed to protecting your personal privacy and providing a safe, calm digital sanctuary. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you access our application and services.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-primary dark:text-teal-200">2. Information We Collect</h2>
            <p>When you register or interact with The Pearl Club, we may collect the following information:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>
                <strong>Account & Authentication Information:</strong> Your name, username, email address, and profile picture provided directly or via Google OAuth authentication.
              </li>
              <li>
                <strong>Sanctuary Usage & Content:</strong> Private journal reflections, mood canvas data, focus timer history, and aquarium collectibles created within your account.
              </li>
              <li>
                <strong>Technical & Telemetry Data:</strong> Aggregated anonymous site usage metrics to ensure service performance and app stability.
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-primary dark:text-teal-200">3. How We Use Your Information</h2>
            <p>We use the information we collect strictly to:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>Authenticate your identity and provide secure access to your private sanctuary.</li>
              <li>Store your personalized settings, achievements, and journal reflections across sessions.</li>
              <li>Respond to customer support requests and account management inquiries.</li>
              <li>Ensure system security and prevent unauthorized access or abuse.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-primary dark:text-teal-200">4. Google OAuth Data Protection</h2>
            <p>
              When signing in via Google OAuth, we only access basic user profile information (such as your email address, full name, and avatar image URL) as authorized by you through Google’s consent screen. We do not request or store sensitive Google account tokens, contact lists, or private Google Drive data. User data obtained through Google OAuth is used strictly for account creation and session authentication.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-primary dark:text-teal-200">5. Data Sharing & Disclosure</h2>
            <p>
              We <strong>do not sell, rent, or trade</strong> your personal information to third parties or advertising networks. Your data is stored securely using industry-standard backend infrastructure (Supabase) with strict Row-Level Security (RLS) enforcement.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-primary dark:text-teal-200">6. User Rights & Account Deletion</h2>
            <p>
              You have the right to inspect, edit, or delete your account information at any time. To request full deletion of your account and all associated journal/sanctuary data, please contact us at <a href="mailto:chbhuvana0505@gmail.com" className="text-primary dark:text-teal-300 underline font-semibold">chbhuvana0505@gmail.com</a>.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-primary dark:text-teal-200">7. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please reach out to us at:
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
          <Link to="/terms" className="text-primary dark:text-teal-300 hover:underline font-semibold">
            Terms of Service →
          </Link>
        </div>
      </div>
    </main>
  );
};

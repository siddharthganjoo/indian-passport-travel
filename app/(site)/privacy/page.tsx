import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Database, Cookie } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy & Data Transparency | jugo',
  description:
    'Our privacy and data protection framework under the Digital Personal Data Protection (DPDP) Act and GDPR. Zero passport number retention guarantee.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="space-y-3 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-800 dark:text-zinc-200">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
          <span>DPDP Act (India) & GDPR Compliance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
          Privacy Policy & Data Handling Directives
        </h1>
        <p className="text-xs font-mono text-zinc-500">
          Last revised: September 2026 • Version 2.4 Production Standard
        </p>
      </div>

      {/* Core Privacy Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 w-fit">
            <Lock className="w-4 h-4 text-zinc-900 dark:text-white" />
          </div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Zero Passport Retention
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            We never request, collect, or store your passport number, Aadhaar number, or biometric documents.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 w-fit">
            <EyeOff className="w-4 h-4 text-zinc-900 dark:text-white" />
          </div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            No Personal Tracking
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            No invasive cross-site advertising trackers, third-party pixel bloat, or identity finger-printing.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 w-fit">
            <Database className="w-4 h-4 text-zinc-900 dark:text-white" />
          </div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Volatile Query Caching
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Flight route queries and destination filter matrices expire automatically in Redis after 60 minutes.
          </p>
        </div>
      </div>

      {/* Detailed Legal Clauses */}
      <div className="prose prose-zinc dark:prose-invert max-w-none text-xs sm:text-sm space-y-6 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
            1. Regulatory Alignment (DPDP Act & GDPR)
          </h2>
          <p>
            jugo operates under the Digital Personal Data Protection Act, 2023 (DPDP Act) of India and the General Data Protection Regulation (GDPR). We adhere strictly to data minimization principles: we process solely the minimum technical data necessary to resolve immigration requirements and deliver live flight metasearch results.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
            2. Absolute Prohibition of Passport & Identity Retention
          </h2>
          <p>
            Under no circumstances does jugo prompt users to enter Indian passport numbers, national identification numbers (such as Aadhaar, PAN, or Voter ID), consular application reference codes, or biometric scans. Our conditional visa engine operates entirely through client-side state parameters (e.g. indicating possession of a valid US, Schengen, or UK visa).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
            3. Flight Query Logs and Data Retention Schedules
          </h2>
          <p>
            When you conduct a flight metasearch from Indian hubs (such as DEL, BOM, BLR, MAA, HYD, CCU, COK), query parameters (origin IATA, destination ISO, date, passenger count) are processed via server-side route handlers to query airline inventory aggregators. Query snapshots are stored temporarily in Upstash Redis with a strict Time-To-Live (TTL) of 3,600 seconds (1 hour) to accelerate repeat lookups. These query logs contain no identifiable personal information.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
            4. Cookie Policies & Outbound Affiliate Connections
          </h2>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <Cookie className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
            <p className="text-xs">
              We employ essential local storage keys solely to preserve your cookie preferences and UI theme state. When navigating to third-party providers (such as Skyscanner, official sovereign visa portals, or airline booking engines), those third parties govern interactions according to their respective privacy terms.
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
            5. Contact & Data Protection Officer (DPO)
          </h2>
          <p>
            For inquiries regarding privacy, compliance requests, or data transparency inquiries, contact our Data Protection Officer at{' '}
            <span className="font-mono underline text-zinc-900 dark:text-white">
              privacy@indianpassporttravel.com
            </span>.
          </p>
        </section>
      </div>
    </div>
  );
}

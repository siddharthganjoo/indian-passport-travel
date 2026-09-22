import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, ShieldAlert, Scale, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions & Legal Liability Disclaimer | DesiVisa',
  description:
    'Terms of service, immigration disclaimer, and limitation of liability for DesiVisa Indian passport metasearch platform.',
};

export default function TermsPage() {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-mono">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Informational Discovery Platform • Legal Terms</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
          Terms & Conditions & Regulatory Disclaimers
        </h1>
        <p className="text-xs font-mono text-zinc-500">
          Last revised: September 2026 • Mandatory Traveler Acknowledgment
        </p>
      </div>

      {/* Prominent High-Contrast Legal Notice Box */}
      <div className="p-5 rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 space-y-3 shadow-md">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400 dark:text-amber-600 shrink-0" />
          <h2 className="text-sm font-bold uppercase tracking-wider font-mono">
            Mandatory Travel & Immigration Notice
          </h2>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-zinc-300 dark:text-zinc-800">
          DesiVisa is an independent metasearch search and informational discovery tool. <strong>We are not a visa processing agency, immigration consultant, travel agency, or diplomatic mission.</strong> All immigration policies, visa fees, permitted lengths of stay, bilateral waivers, and conditional relaxations are volatile and subject to unilateral revision by sovereign border control authorities without advance notice.
        </p>
      </div>

      {/* Structured Sections */}
      <div className="prose prose-zinc dark:prose-invert max-w-none text-xs sm:text-sm space-y-6 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-zinc-900 dark:text-white" />
            1. Zero Liability for Denied Boarding or Entry
          </h2>
          <p>
            You acknowledge and agree that under no circumstances shall DesiVisa, its founders, operators, or contributors be held liable for any direct, indirect, consequential, or punitive damages arising from:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <li>Denied boarding by commercial airlines or charter operators.</li>
            <li>Denied entry, detention, deportation, or penalties imposed by immigration officers at any border checkpoint.</li>
            <li>Inaccuracies, discrepancies, or recent changes in sovereign immigration regulations, fees, or document requirements.</li>
            <li>Financial losses from cancelled flights, non-refundable lodging, or trip interruptions.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-zinc-900 dark:text-white" />
            2. Traveler Responsibility & Due Diligence
          </h2>
          <p>
            It remains the sole legal responsibility of the traveler holding a Republic of India passport to verify all visa entry prerequisites directly with the relevant embassy, consulate, or official government immigration portal prior to booking travel or commencing international journeys.
          </p>
          <p>
            Travelers must ensure their passport satisfies minimum validity rules (typically 6 months from arrival), possesses sufficient blank visa endorsement pages, and that all secondary qualifying visas (US, Schengen, UK) are physically valid, unexpired, and fulfill national waiver conditions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
            3. Third-Party Flight Search & Affiliate Links
          </h2>
          <p>
            Flight aggregations, fare snapshots, and flight pricing data are retrieved from partners including Amadeus, Duffel, and public travel indexes. Flight prices fluctuate dynamically based on seat inventory, airline fare classes, and baggage policies. Clicking outbound links redirects you to third-party booking systems (such as Skyscanner or airline portals). DesiVisa executes no ticket issuance and accepts no payment for bookings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
            4. Permissible Use & Rate Limiting
          </h2>
          <p>
            Automated scraping, programmatic extraction, or malicious denial-of-service queries against DesiVisa APIs are strictly prohibited. API endpoints are bounded by automated rate-limiting policies (20 requests per minute per IP).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
            5. Governing Law & Dispute Jurisdiction
          </h2>
          <p>
            These Terms shall be construed and governed in accordance with the substantive laws of the Republic of India. Any legal dispute or proceeding arising out of or related to these Terms shall be subject to the exclusive jurisdiction of the courts of New Delhi, India.
          </p>
        </section>
      </div>
    </div>
  );
}

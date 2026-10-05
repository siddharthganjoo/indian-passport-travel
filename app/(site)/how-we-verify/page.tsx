import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader, Prose } from '@/components/content/page-header';
import { getAllDestinations } from '@/lib/db';
import { verificationStatus } from '@/lib/visa-engine';
import { SITE } from '@/lib/site';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'How we verify visa information',
  description: 'Where jugo’s visa rules come from, how often they are checked, and what the “verified” labels mean.',
};

export default async function HowWeVerifyPage() {
  const countries = await getAllDestinations();
  const verified = countries.filter((c) => verificationStatus(c.lastVerifiedAt) === 'verified').length;

  return (
    <div className="space-y-14">
      <PageHeader
        eyebrow="Trust"
        title="How we verify visa information"
        lead="Visa rules for Indian passports change often. Here's where ours come from, how we keep them current, and how to read our labels."
      />

      <div className="max-w-3xl rounded-2xl bg-zinc-50 dark:bg-zinc-900 p-6">
        <p className="font-display text-4xl font-extrabold tracking-tight">
          {verified} <span className="text-zinc-400">/ {countries.length}</span>
        </p>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">countries checked against their official source in the last 90 days</p>
      </div>

      <Prose>
        <section>
          <h2>Where the rules come from</h2>
          <p>
            Every country links to its official government visa or immigration website. Rules are compiled from those
            official sources and embassy notices, then reviewed by a person who records the page they checked and the date.
          </p>
        </section>

        <section>
          <h2>What the labels mean</h2>
          <ul>
            <li>
              <strong>Checked &lt;date&gt;</strong> — a person compared this country&apos;s rules with the official source in
              the last 90 days.
            </li>
            <li>
              <strong>May be out of date</strong> — last checked more than 90 days ago; it&apos;s queued for review.
            </li>
            <li>
              <strong>Researched &lt;date&gt;</strong> — we cross-checked the entry rule against IATA Timatic data (what
              airlines check at boarding) and, for popular or disputed countries, official embassy and government pages and
              recent news. Each country lists exactly what was checked, a confidence level and the sources. A person still
              needs to confirm it.
            </li>
            <li>
              <strong>Not yet verified</strong> — compiled from public sources but not yet reviewed. Treat it as a starting
              point and confirm on the official website.
            </li>
          </ul>
        </section>

        <section>
          <h2>How routes and stopovers are judged</h2>
          <p>
            On a single ticket, your bags are checked through and you usually stay airside, so we apply the airport&apos;s
            transit rules (some airports require an airport transit visa for Indians unless you hold a US, UK or Schengen
            visa). On two separate tickets with a checked bag, you must clear immigration to collect and re-check it, so we
            apply the stopover country&apos;s <strong>entry</strong> visa. With cabin bags only, some hubs let you stay
            airside — we show both totals.
          </p>
          <p>
            If a visa can&apos;t realistically be issued before your travel date, we mark the route as not possible and
            suggest an apply-by date for later trips.
          </p>
        </section>

        <section>
          <h2>Flight prices</h2>
          <p>
            Prices come from our flight partners and may be cached for a few hours. Bag allowances come from the fare when
            available, otherwise from the airline&apos;s typical policy — we say which. Always check the final price and
            baggage on the booking site.
          </p>
        </section>

        <section>
          <h2>Found something wrong?</h2>
          <p>
            Please tell us — corrections from travellers are the fastest way we learn about changes.{' '}
            {SITE.supportEmail ? (
              <a href={`mailto:${SITE.supportEmail}?subject=Visa%20correction`}>Email {SITE.supportEmail}</a>
            ) : (
              <Link href="/help">Contact us</Link>
            )}
            .
          </p>
        </section>
      </Prose>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageHeader, Prose } from '@/components/content/page-header';
import { getAllDestinations, getAllTransitHubs } from '@/lib/db';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'About jugo',
  description: 'jugo helps Indian passport holders find the cheapest way to fly abroad — with every visa on the route sorted.',
};

export default async function AboutPage() {
  const [countries, hubs] = await Promise.all([getAllDestinations(), getAllTransitHubs()]);

  const facts = [
    { value: String(countries.length), label: 'countries with visa rules for Indians' },
    { value: String(hubs.length), label: 'transit hubs checked on every search' },
    { value: '2', label: 'totals per route — cabin bag only and with a checked bag' },
  ];

  return (
    <div className="space-y-16">
      <PageHeader
        eyebrow="About"
        title="Flights and visas, planned together."
        lead="Indian travellers often pay far more than they need to — or get stuck at a stopover — because flight sites don't think about visas, and visa sites don't think about flights. jugo does both."
      />

      <dl className="grid gap-px sm:grid-cols-3 rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-800">
        {facts.map((f) => (
          <div key={f.label} className="bg-white dark:bg-zinc-950 p-6">
            <dt className="sr-only">{f.label}</dt>
            <dd>
              <span className="block font-display text-5xl font-extrabold tracking-tight">{f.value}</span>
              <span className="block mt-2 text-zinc-600 dark:text-zinc-400">{f.label}</span>
            </dd>
          </div>
        ))}
      </dl>

      <Prose>
        <section>
          <h2>What jugo does</h2>
          <p>
            Tell us where you&apos;re flying from, where you want to go and when. We compare one-ticket flights with cheaper
            routes on two separate tickets through hubs like Istanbul, Dubai or Addis Ababa — and for every option we check
            the visa you need at the stopover and at your destination, for an <strong>Indian passport</strong>, including any
            US, UK or Schengen visa you already hold.
          </p>
          <p>
            Then we add it all up: fares, bag fees and visa fees, with and without a checked bag — because a checked bag on
            separate tickets means passing immigration at the stopover, which can change the visa you need.
          </p>
        </section>

        <section>
          <h2>How jugo makes money</h2>
          <p>
            jugo is free to use. When you click through to book a flight, we may earn a commission from the booking partner.
            That never changes the price you pay, and it never changes how we rank routes — they&apos;re always sorted by the
            total cost for the bag option you choose.
          </p>
        </section>

        <section>
          <h2>What jugo is not</h2>
          <p>
            We are not an airline, a travel agent or a visa agency, and we don&apos;t sell visas. Visa rules change; we show
            when each rule was last checked and link to the official government website so you can confirm before you book.{' '}
            <Link href="/how-we-verify">How we verify our data</Link>.
          </p>
        </section>
      </Prose>

      <Link
        href="/"
        className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-black text-white font-medium hover:bg-zinc-800 dark:bg-white dark:text-black"
      >
        Plan a trip <ArrowRight className="w-4 h-4" aria-hidden />
      </Link>
    </div>
  );
}

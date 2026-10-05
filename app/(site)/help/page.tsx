import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { PageHeader } from '@/components/content/page-header';
import { Faq, type FaqItem } from '@/components/content/faq';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Help & FAQ',
  description: 'Answers about self-transfer routes, transit visas, baggage and how jugo calculates the total cost of a trip.',
};

const FAQ: FaqItem[] = [
  {
    q: 'What is a self-transfer route?',
    a: 'Two separate tickets joined at a hub — for example Delhi → Istanbul on one airline and Istanbul → São Paulo on another. It is often much cheaper than one long-haul ticket, but if your first flight is late the second airline does not have to rebook you, so leave plenty of time between flights.',
  },
  {
    q: 'Why does a checked bag change the visa I need?',
    a: 'On separate tickets your bag is not transferred for you. You have to clear immigration at the stopover, collect it and check in again — which means entering that country, so you need its entry visa. With cabin bags only, some hubs let you stay airside and connect without a visa. jugo shows both totals.',
  },
  {
    q: 'Do I need a transit visa on a single ticket?',
    a: 'Usually not — you stay in the international transit area. Some airports (for example in the UK) require an airport transit visa for Indian passport holders unless you hold a valid US, UK or Schengen visa. jugo checks this for connections at the hubs we cover.',
  },
  {
    q: 'How does holding a US, UK or Schengen visa help?',
    a: 'Many countries let Indian passport holders with one of these visas enter visa-free, on arrival or with a quick eVisa. Tick the visas you hold in the search or on the visa guide and jugo applies the easiest rule you qualify for.',
  },
  {
    q: 'What is included in the total price?',
    a: 'Flight fares for one adult, an estimated checked-bag fee when the fare does not include one (in the “with checked bag” view), visa fees for every country on the route, and a hotel estimate for very long layovers. Airport taxes are already in the fare.',
  },
  {
    q: 'Are the prices live?',
    a: 'Prices come from our flight partners and can be a few hours old. Click through to the booking site to see the final price before you pay. If you see “Sample prices”, live prices are not connected yet.',
  },
  {
    q: 'What does “Apply by” mean?',
    a: 'The latest sensible date to apply for a visa, based on its maximum processing time plus a safety buffer. If processing can’t finish before your trip, jugo marks the route as not possible.',
  },
  {
    q: 'Can I book or apply for a visa through jugo?',
    a: 'Not directly. jugo links you to booking sites for flights and to the official government website for visas. We never ask for your passport details.',
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-14">
      <PageHeader eyebrow="Help" title="How can we help?" lead="Quick answers about routes, visas and prices." />

      <Faq items={FAQ} />

      <section aria-labelledby="contact" className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 p-6 space-y-3">
          <h2 id="contact" className="font-display text-2xl font-bold tracking-tight">Still need help?</h2>
          {SITE.supportEmail ? (
            <a
              href={`mailto:${SITE.supportEmail}`}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-black text-white text-sm font-medium dark:bg-white dark:text-black"
            >
              <Mail className="w-4 h-4" aria-hidden /> {SITE.supportEmail}
            </a>
          ) : (
            <p className="text-zinc-600 dark:text-zinc-400">Our support inbox is opening soon.</p>
          )}
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-3">
          <h2 className="font-display text-2xl font-bold tracking-tight">Spotted a wrong rule?</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Visa rules change often. Tell us and we&apos;ll check it against the official source.{' '}
            <Link href="/how-we-verify" className="underline underline-offset-4">How we verify</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

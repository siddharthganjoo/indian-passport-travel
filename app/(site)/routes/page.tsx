import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAllSmartRoutes } from '@/lib/db';
import { todayIst } from '@/lib/search-options';
import { addDays, buildPlanUrl, flagEmoji, formatInr } from '@/lib/utils';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Route ideas — cheaper ways to fly from India',
  description:
    'Split-ticket routes via Istanbul, Addis Ababa, Dubai and other hubs that are often cheaper than a single ticket from India — with the visa rules you need for each.',
};

const RULES = [
  {
    title: 'One ticket vs. separate tickets',
    body: 'On one ticket your bags go through and you stay airside. On separate tickets with checked bags you must enter the stopover country, so you need its visa.',
  },
  {
    title: 'Watch for transit visas',
    body: 'Some airports (e.g. London, Frankfurt) require an airport transit visa for Indians unless you hold a valid US, UK or Schengen visa.',
  },
  {
    title: 'Leave 4+ hours between flights',
    body: 'The second airline won’t rebook you if the first flight is late. Long layovers or an overnight stop are safer.',
  },
  {
    title: 'Check stopover perks',
    body: 'Some airlines offer free hotels or city tours on long layovers when booked on one ticket — read the conditions first.',
  },
];

export default async function RoutesPage() {
  const routes = await getAllSmartRoutes();
  const date = addDays(todayIst(), 30);

  return (
    <div className="space-y-12">
      <div className="max-w-2xl space-y-3">
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">Route ideas</h1>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Long-haul tickets from India can cost much more than two shorter tickets through a hub. These are routes our editors
          have seen work — open one to see today&apos;s prices and the visas you&apos;d need.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {routes.map((r) => {
          const saving = r.standardDirectFareInr - r.hackCombinedFareInr;
          return (
            <li key={r.id}>
              <Link
                href={buildPlanUrl({
                  from: r.originIata === 'ALL_INDIA' ? 'DEL' : r.originIata,
                  to: r.destinationCountryCode,
                  date,
                  bags: 'cabin',
                  visas: [],
                })}
                className="group block h-full rounded-xl border border-zinc-200 p-5 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl leading-none" aria-hidden>{flagEmoji(r.destinationCountryCode)}</span>
                  <div>
                    <div className="font-medium">{r.destinationCountryName} via {r.hubCity}</div>
                    <div className="text-sm text-zinc-500">
                      {r.leg1.fromIata} → {r.hubIata} → {r.destinationIata}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{r.notes}</p>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-zinc-500">Typical via {r.hubIata}</dt>
                    <dd className="font-medium tabular-nums">{formatInr(r.hackCombinedFareInr)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-zinc-500">One ticket</dt>
                    <dd className="tabular-nums text-zinc-600 dark:text-zinc-400">{formatInr(r.standardDirectFareInr)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-zinc-500">Stopover visa</dt>
                    <dd className="text-zinc-600 dark:text-zinc-400 truncate" title={r.transitVisa.badgeLabel}>
                      {r.transitVisa.costInr ? formatInr(r.transitVisa.costInr) : 'None'}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 flex items-center justify-between text-sm">
                  {saving > 0 && <span className="text-emerald-700 dark:text-emerald-400">Often ~{formatInr(saving)} less</span>}
                  <span className="ml-auto inline-flex items-center gap-1 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white">
                    Check today&apos;s prices <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <section aria-labelledby="rules" className="space-y-4">
        <h2 id="rules" className="text-lg font-semibold">Before you book separate tickets</h2>
        <ol className="grid gap-6 sm:grid-cols-2">
          {RULES.map((rule, i) => (
            <li key={rule.title} className="flex gap-3">
              <span className="w-6 h-6 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 grid place-items-center text-xs font-medium">
                {i + 1}
              </span>
              <div>
                <h3 className="font-medium">{rule.title}</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{rule.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

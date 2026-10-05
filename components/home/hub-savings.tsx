import Link from 'next/link';
import type { SmartRouteHack } from '@/types/routes';
import { buildPlanUrl, formatInrCompact } from '@/lib/utils';

/**
 * Dumbbell chart: typical one-ticket fare vs. typical fare via a hub, per
 * curated route. Scale starts at ₹0 so gaps are honest.
 */
export function HubSavings({ routes, date }: { routes: SmartRouteHack[]; date: string }) {
  const max = Math.max(...routes.map((r) => r.standardDirectFareInr)) * 1.08;
  const pct = (v: number) => `${(v / max) * 100}%`;

  return (
    <figure className="space-y-5">
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400" aria-label="Legend">
        <li className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-brand" aria-hidden /> Via a hub (two tickets)
        </li>
        <li className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-black dark:bg-white" aria-hidden /> One ticket
        </li>
      </ul>

      <ol className="space-y-1">
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
                className="grid grid-cols-1 sm:grid-cols-[14rem_1fr_6rem] gap-x-4 gap-y-2 items-center rounded-xl px-3 py-3 -mx-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <span className="text-sm">
                  <span className="font-medium">{r.originIata === 'ALL_INDIA' ? 'India' : r.originIata} → {r.destinationCity}</span>
                  <span className="text-zinc-500"> via {r.hubCity}</span>
                </span>
                <span className="relative h-6" aria-hidden>
                  <span className="absolute inset-x-0 top-1/2 h-px bg-zinc-200 dark:bg-zinc-800" />
                  <span
                    className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-zinc-300 dark:bg-zinc-700"
                    style={{ left: pct(r.hackCombinedFareInr), width: `calc(${pct(saving)})` }}
                  />
                  <span
                    className="absolute top-1/2 w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand ring-2 ring-white dark:ring-zinc-950"
                    style={{ left: pct(r.hackCombinedFareInr) }}
                  />
                  <span
                    className="absolute top-1/2 w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black ring-2 ring-white dark:bg-white dark:ring-zinc-950"
                    style={{ left: pct(r.standardDirectFareInr) }}
                  />
                </span>
                <span className="text-sm tabular-nums sm:text-right">
                  <span className="font-medium">{formatInrCompact(r.hackCombinedFareInr)}</span>
                  <span className="text-zinc-500"> vs {formatInrCompact(r.standardDirectFareInr)}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <figcaption className="text-xs text-zinc-500">
        Typical one-way economy fares reported by our editors; visa and bag costs not included. Tap a route for today&apos;s
        prices with everything added up.
      </figcaption>
    </figure>
  );
}

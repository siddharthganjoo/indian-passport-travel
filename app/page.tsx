import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { TripSearchForm } from '@/components/plan/trip-search-form';
import { VisaExplorer } from '@/components/visa/visa-explorer';
import { HubNetworkMap } from '@/components/home/hub-network-map';
import { HubSavings } from '@/components/home/hub-savings';
import { getSearchOptions } from '@/lib/search-options';
import { getExplorerCountries } from '@/lib/explorer-data';
import { getAllSmartRoutes, getAllTransitHubs } from '@/lib/db';

export const revalidate = 300;

const STEPS = [
  {
    title: 'Every way there',
    body: 'One-ticket flights, plus cheaper two-ticket routes through hubs like Istanbul, Dubai and Addis Ababa.',
  },
  {
    title: 'Every visa checked',
    body: 'Stopover and destination, for your Indian passport — and the US, UK or Schengen visa you may already hold.',
  },
  {
    title: 'The real total',
    body: 'Fares, bag fees and visa fees added up — with and without a checked bag — so you compare like for like.',
  },
];

const container = 'max-w-6xl mx-auto px-4 sm:px-6';

export default async function HomePage() {
  const [options, countries, routes, hubs] = await Promise.all([
    getSearchOptions(),
    getExplorerCountries(),
    getAllSmartRoutes(),
    getAllTransitHubs(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="on-dark bg-black text-white">
        <div className={`${container} pt-12 sm:pt-20 pb-14 sm:pb-20`}>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div className="space-y-5">
              <h1 className="font-display text-5xl sm:text-7xl font-extrabold tracking-[-0.04em] leading-[0.95]">
                Go further.
                <br />
                Pay less.
              </h1>
              <p className="text-lg text-zinc-300 max-w-md leading-relaxed">
                The cheapest way to fly abroad on an Indian passport — with every visa on the route sorted.
              </p>
            </div>
            <div className="text-zinc-300 -mx-2 sm:mx-0">
              <HubNetworkMap
                hubs={hubs.map((h) => h.code)}
                routes={routes.map((r) => ({ hub: r.hubIata, dest: r.destinationIata }))}
              />
              <p className="mt-2 text-xs text-zinc-500">
                India → {hubs.length} transit hubs we check on every search → onward destinations
              </p>
            </div>
          </div>

          <div className="mt-10">
            <TripSearchForm
              countries={options.countries}
              origins={options.origins}
              minDate={options.minDate}
              initial={{ from: 'DEL', to: '', date: options.defaultDate, bags: 'cabin', visas: [] }}
            />
          </div>
        </div>
      </section>

      {/* Trust strip — facts only */}
      <section aria-label="Why trust jugo" className="border-b border-zinc-200 dark:border-zinc-800">
        <ul className={`${container} grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5 py-8 text-sm`}>
          {[
            [String(countries.length), 'countries with visa rules for Indian passports'],
            [String(hubs.length), 'transit hubs checked on every search'],
            ['Official', 'every rule links to its government source'],
            ['No sign-up', 'and we never ask for passport details'],
          ].map(([big, small]) => (
            <li key={small}>
              <span className="block font-display text-2xl font-bold tracking-tight">{big}</span>
              <span className="text-zinc-600 dark:text-zinc-400">{small}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Passport map */}
      <section className={`${container} py-16 sm:py-24`} aria-labelledby="passport">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_2fr]">
          <div className="space-y-4">
            <h2 id="passport" className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-[1.02]">
              Where your passport takes you
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Darker green means easier entry. Already hold a US, UK or Schengen visa? Tick it and watch the map change.
            </p>
            <Link
              href="/visas"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-black text-white text-sm font-medium hover:bg-zinc-800 dark:bg-white dark:text-black"
            >
              All {countries.length} countries <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
          <VisaExplorer countries={countries} variant="map" />
        </div>
      </section>

      {/* Hub savings */}
      {routes.length > 0 && (
        <section className="border-t border-zinc-200 dark:border-zinc-800" aria-labelledby="savings">
          <div className={`${container} py-16 sm:py-24 grid gap-10 lg:grid-cols-[0.8fr_2fr]`}>
            <div className="space-y-4">
              <h2 id="savings" className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-[1.02]">
                One ticket vs. via a hub
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Long-haul tickets from India are often far pricier than two shorter flights through a hub. jugo checks
                those combinations — and the stopover visa — for you.
              </p>
            </div>
            <HubSavings routes={routes} date={options.defaultDate} />
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="border-t border-zinc-200 dark:border-zinc-800" aria-labelledby="how">
        <div className={`${container} py-16 sm:py-24`}>
          <h2 id="how" className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
            How jugo works
          </h2>
          <ol className="mt-10 grid gap-10 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="space-y-3">
                <span className="font-display text-6xl font-extrabold tracking-tight text-zinc-200 dark:text-zinc-800">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-xl font-semibold">{s.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA band */}
      <section className={`${container} pb-4`}>
        <div className="on-dark rounded-3xl bg-black text-white px-6 py-12 sm:px-12 sm:py-16 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2 max-w-xl">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Know your visa before you book.</h2>
            <p className="text-zinc-400">Documents, fees, processing time and the date to apply by — for every country.</p>
          </div>
          <Link
            href="/visas"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-white text-black font-medium hover:bg-zinc-200 shrink-0"
          >
            Open the visa guide <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}

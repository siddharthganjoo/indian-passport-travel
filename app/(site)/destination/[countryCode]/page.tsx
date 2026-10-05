import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { getAllDestinations, getDestinationByCode, getSmartRoutesForDestination } from '@/lib/db';
import { resolveVisaRequirements, verificationStatus } from '@/lib/visa-engine';
import { GENERIC_STEPS } from '@/lib/visa-content';
import { getSearchOptions } from '@/lib/search-options';
import { EASE_FILL, buildPlanUrl, cn, flagEmoji, formatDay, formatInr, getVisaCategoryLabel, visaCategoryDot } from '@/lib/utils';
import { RouteMap } from '@/components/maps/route-map';
import { airportDistanceKm, getAirport } from '@/lib/geo';
import { DocumentChecklist } from '@/components/kokonut/document-checklist';
import { TripSearchForm } from '@/components/plan/trip-search-form';
import type { ConditionalPassRuleDetails, HeldVisa } from '@/types/visa';

export const revalidate = 300;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ countryCode: string }>;
}

export async function generateStaticParams() {
  return (await getAllDestinations()).map((c) => ({ countryCode: c.countryCode }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { countryCode } = await params;
  const country = await getDestinationByCode(countryCode);
  if (!country) return { title: 'Destination not found' };
  const category = getVisaCategoryLabel(country.defaultCategory);
  return {
    title: `${country.countryName} visa for Indians — ${category}`,
    description: `${country.countryName} entry rules for Indian passport holders: ${category.toLowerCase()}, ${country.stayDurationDays}-day stay, fees, documents and how to apply. Plus the cheapest ways to fly there from India.`,
  };
}

const WAIVER_ROWS: [HeldVisa, 'validUSVisaHolder' | 'validSchengenHolder' | 'validUKVisaHolder'][] = [
  ['US', 'validUSVisaHolder'],
  ['Schengen', 'validSchengenHolder'],
  ['UK', 'validUKVisaHolder'],
];

export default async function DestinationPage({ params }: PageProps) {
  const { countryCode } = await params;
  const country = await getDestinationByCode(countryCode);
  if (!country) notFound();

  const [routes, options] = await Promise.all([getSmartRoutesForDestination(country.countryCode), getSearchOptions()]);
  const visa = resolveVisaRequirements(country, { hasUSVisa: false, hasSchengen: false, hasUKVisa: false });
  const status = verificationStatus(country.lastVerifiedAt);
  const waivers = WAIVER_ROWS.map(([held, key]) => [held, country.conditionalUpgrades?.[key]] as const).filter(
    (w): w is readonly [HeldVisa, ConditionalPassRuleDetails] => !!w[1]
  );
  const mainAirport = country.popularAirports.find((code) => getAirport(code));
  const distanceKm = mainAirport ? airportDistanceKm('DEL', mainAirport) : null;
  const steps = country.applicationSteps?.length ? country.applicationSteps : GENERIC_STEPS[country.defaultCategory];

  const facts = [
    {
      label: 'Entry',
      value: (
        <span className="inline-flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', visaCategoryDot(visa.effectiveCategory))} aria-hidden />
          {getVisaCategoryLabel(visa.effectiveCategory)}
        </span>
      ),
    },
    { label: 'Stay', value: `${visa.stayDays} days` },
    { label: 'Fee', value: visa.feeInr ? formatInr(visa.feeInr) : 'Free' },
    { label: 'Processing', value: visa.processingTime },
  ];

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <nav className="text-sm text-zinc-500" aria-label="Breadcrumb">
          <Link href="/visas" className="hover:text-zinc-900 dark:hover:text-white">Visa guide</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-900 dark:text-white">{country.countryName}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="space-y-4">
        <div className="flex items-start gap-4">
          <span className="text-5xl leading-none" aria-hidden>{flagEmoji(country.countryCode)}</span>
          <div className="space-y-1">
            <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight">{country.countryName}</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              {[country.capitalCity, country.continent].filter(Boolean).join(' · ')}
              {country.isSchengen && ' · Schengen area'}
            </p>
          </div>
        </div>

        {country.tagline && <p className="max-w-2xl text-zinc-600 dark:text-zinc-400 leading-relaxed">{country.tagline}</p>}
        </div>
        {mainAirport && (
          <figure className="rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-900">
            <RouteMap
              label={`Map: New Delhi to ${country.countryName}`}
              points={[
                { iata: 'DEL', role: 'origin', label: 'India' },
                { iata: mainAirport, role: 'destination', label: country.countryName },
              ]}
              arcs={[{ id: 'route', from: 'DEL', to: mainAirport, emphasis: 'active' }]}
              fills={{ IN: 'var(--ease-embassy)', [country.countryCode]: EASE_FILL[visa.effectiveCategory] }}
            />
            <figcaption className="px-4 py-2 text-xs text-zinc-500">
              {distanceKm ? `${Math.round(distanceKm).toLocaleString('en-IN')} km from Delhi as the crow flies` : 'From India'}
            </figcaption>
          </figure>
        )}
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-4 rounded-xl border border-zinc-200 dark:border-zinc-800 divide-x divide-y sm:divide-y-0 divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
          {facts.map((f) => (
            <div key={f.label} className="p-4">
              <dt className="text-xs text-zinc-500">{f.label}</dt>
              <dd className="mt-1 font-medium">{f.value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          {country.officialPortalUrl && (
            <a
              href={country.officialPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-900 dark:decoration-zinc-600 dark:hover:decoration-white"
            >
              Official visa website <ExternalLink className="w-3.5 h-3.5" aria-hidden />
            </a>
          )}
          <span className={status === 'verified' ? 'text-zinc-500' : 'text-amber-700 dark:text-amber-400'}>
            {status === 'verified'
              ? `Checked ${formatDay(country.lastVerifiedAt!)}`
              : status === 'stale'
                ? `Last checked ${formatDay(country.lastVerifiedAt!)} — may be out of date`
                : 'Not yet verified by our team — confirm on the official website'}
          </span>
        </div>
      </div>

      {waivers.length > 0 && (
        <section className="space-y-3" aria-labelledby="waivers">
          <h2 id="waivers" className="text-lg font-semibold">Already hold a US, UK or Schengen visa?</h2>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800">
            {waivers.map(([held, rule]) => (
              <li key={held} className="p-4 grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-4">
                <div className="font-medium">{held} visa</div>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-sm">
                    <span className={cn('w-2 h-2 rounded-full', visaCategoryDot(rule.eligibleCategory))} aria-hidden />
                    {getVisaCategoryLabel(rule.eligibleCategory)} · {rule.allowedStayDays} days
                    {rule.specialFeeUsd ? ` · US$${rule.specialFeeUsd}` : ''}
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{rule.conditionNotes}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-12 lg:grid-cols-2">
        <section className="space-y-3" aria-labelledby="apply">
          <h2 id="apply" className="text-lg font-semibold">How to get in</h2>
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="w-6 h-6 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 grid place-items-center text-xs font-medium">
                  {i + 1}
                </span>
                <span className="pt-0.5">{s}</span>
              </li>
            ))}
          </ol>
        </section>
        <section aria-label="Documents">
          <DocumentChecklist documents={country.requiredDocuments} countryName={country.countryName} />
        </section>
      </div>

      <section className="space-y-4" aria-labelledby="fly">
        <h2 id="fly" className="text-lg font-semibold">Find the cheapest way to fly to {country.countryName}</h2>
        <TripSearchForm
          countries={options.countries}
          origins={options.origins}
          minDate={options.minDate}
          initial={{ from: 'DEL', to: country.countryCode, date: options.defaultDate, bags: 'cabin', visas: [] }}
          compact
        />
        {routes.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {routes.map((r) => (
              <li key={r.id}>
                <Link
                  href={buildPlanUrl({
                    from: r.originIata === 'ALL_INDIA' ? 'DEL' : r.originIata,
                    to: country.countryCode,
                    date: options.defaultDate,
                    bags: 'cabin',
                    visas: [],
                  })}
                  className="block rounded-xl border border-zinc-200 p-4 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                >
                  <div className="text-sm font-medium">
                    {r.leg1.fromIata} → {r.hubIata} → {r.destinationIata}
                  </div>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Via {r.hubCity} · typically {formatInr(r.hackCombinedFareInr)} vs {formatInr(r.standardDirectFareInr)} on one ticket
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-zinc-500 leading-relaxed max-w-3xl">
        Immigration officers decide entry at the border. Carry a passport valid for 6+ months with two blank pages, your
        return ticket, accommodation details and proof of funds.
      </p>
    </div>
  );
}

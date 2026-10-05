import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { getAllDestinations, getDestinationByCode, getSmartRoutesForDestination } from '@/lib/db';
import { formatProcessing, resolveVisaRequirements } from '@/lib/visa-engine';
import { GENERIC_STEPS } from '@/lib/visa-content';
import { getSearchOptions } from '@/lib/search-options';
import { EASE_FILL, buildPlanUrl, cn, flagEmoji, formatInr, getVisaCategoryLabel, visaCategoryDot } from '@/lib/utils';
import { RouteMap } from '@/components/maps/route-map';
import { airportDistanceKm, getAirport } from '@/lib/geo';
import { Faq, type FaqItem } from '@/components/content/faq';
import { SITE } from '@/lib/site';
import { DataStatus } from '@/components/visa/data-status';
import { DocumentChecklist } from '@/components/kokonut/document-checklist';
import { TripSearchForm } from '@/components/plan/trip-search-form';
import type { ConditionalPassRuleDetails, CountryVisaProfile, HeldVisa, ResolvedVisaRequirements } from '@/types/visa';

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
    title: `${country.countryName} visa for Indians: requirements, fees & processing`,
    description: `${country.countryName} entry rules for Indian passport holders: ${category.toLowerCase()}, ${country.stayDurationDays}-day stay, fees, documents and how to apply — plus the cheapest ways to fly there from India.`,
    alternates: { canonical: `/destination/${country.countryCode}` },
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

  const [routes, options, all] = await Promise.all([
    getSmartRoutesForDestination(country.countryCode),
    getSearchOptions(),
    getAllDestinations(),
  ]);
  const visa = resolveVisaRequirements(country, { hasUSVisa: false, hasSchengen: false, hasUKVisa: false });
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
        </div>
        <DataStatus lastVerifiedAt={country.lastVerifiedAt} research={country.research} />
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

      <Faq items={countryFaq(country, visa, waivers)} heading={`${country.countryName} visa FAQ`} />

      <SimilarDestinations current={country} all={all} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Visas', item: `${SITE.url}/visas` },
              { '@type': 'ListItem', position: 2, name: country.countryName, item: `${SITE.url}/destination/${country.countryCode}` },
            ],
          }).replace(/</g, '\\u003c'),
        }}
      />

      <p className="text-xs text-zinc-500 leading-relaxed max-w-3xl">
        Immigration officers decide entry at the border. Carry a passport valid for 6+ months with two blank pages, your
        return ticket, accommodation details and proof of funds.
      </p>
    </div>
  );
}

const EASE_RANK: Record<string, number> = { visa_free: 0, voa: 1, evisa: 2, sticker_required: 3 };

/** Plain-language FAQ generated from the country's data (also emitted as FAQPage structured data). */
function countryFaq(
  c: CountryVisaProfile,
  visa: ResolvedVisaRequirements,
  waivers: readonly (readonly [HeldVisa, ConditionalPassRuleDetails])[]
): FaqItem[] {
  const name = c.countryName;
  const fee = visa.feeInr ? `about ${formatInr(visa.feeInr)}${c.baseFeeUsd ? ` (US$${c.baseFeeUsd})` : ''}` : 'free';
  const needs: Record<string, string> = {
    visa_free: `No. Indian passport holders can visit ${name} without a visa for up to ${visa.stayDays} days for tourism. Carry a return ticket, hotel bookings and proof of funds.`,
    voa: `Indian passport holders get a visa on arrival in ${name} for up to ${visa.stayDays} days — no application before you fly. The fee is ${fee}.`,
    evisa: `Yes, but you can apply online. Indian passport holders need an eVisa for ${name}, allowing up to ${visa.stayDays} days. The fee is ${fee}.`,
    sticker_required: `Yes. Indian passport holders must apply for a visa at the ${name} embassy or its visa centre before travelling. The fee is ${fee}.`,
  };
  const items: FaqItem[] = [
    { q: `Do Indians need a visa for ${name}?`, a: needs[c.defaultCategory] },
    { q: `How much does a ${name} visa cost for Indians?`, a: visa.feeInr ? `The fee is ${fee}. Service or centre charges may be extra.` : `There is no visa fee for Indian passport holders.` },
    {
      q: `How long does ${name} visa processing take?`,
      a: c.processingTimeDays.max === 0 ? 'There is nothing to process in advance — entry is granted at the border.' : `Usually ${formatProcessing(c.processingTimeDays)}. Apply well before you book non-refundable travel.`,
    },
  ];
  if (waivers.length) {
    items.push({
      q: `Can I enter ${name} with a US, UK or Schengen visa?`,
      a: waivers
        .map(([held, w]) => `With a valid ${held} visa: ${getVisaCategoryLabel(w.eligibleCategory).toLowerCase()} for up to ${w.allowedStayDays} days.`)
        .join(' ') + ' Conditions apply — the visa usually must be valid and sometimes already used.',
    });
  }
  if (c.requiredDocuments.length) {
    items.push({ q: `What documents do Indians need for ${name}?`, a: c.requiredDocuments.slice(0, 6).join('; ') + '.' });
  }
  return items;
}

/** Same-region countries, easiest entry first. */
function SimilarDestinations({ current, all }: { current: CountryVisaProfile; all: CountryVisaProfile[] }) {
  const picks = all
    .filter((c) => c.continent === current.continent && c.countryCode !== current.countryCode)
    .sort((a, b) => EASE_RANK[a.defaultCategory] - EASE_RANK[b.defaultCategory] || a.countryName.localeCompare(b.countryName))
    .slice(0, 6);
  if (!picks.length) return null;
  return (
    <section aria-labelledby="similar" className="space-y-4">
      <h2 id="similar" className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
        More in {current.continent}
      </h2>
      <ul className="grid gap-3 grid-cols-2 sm:grid-cols-3">
        {picks.map((c) => (
          <li key={c.countryCode}>
            <Link
              href={`/destination/${c.countryCode}`}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-black dark:hover:border-white transition-colors"
            >
              <span className="text-2xl leading-none" aria-hidden>{flagEmoji(c.countryCode)}</span>
              <span className="min-w-0">
                <span className="block font-medium truncate">{c.countryName}</span>
                <span className="flex items-center gap-1.5 text-sm text-zinc-500">
                  <span className={cn('w-2 h-2 rounded-full', visaCategoryDot(c.defaultCategory))} aria-hidden />
                  {getVisaCategoryLabel(c.defaultCategory)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

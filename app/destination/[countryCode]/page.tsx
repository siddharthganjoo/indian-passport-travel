import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DESTINATIONS } from '@/lib/destinations-data';
import { resolveVisaRequirements } from '@/lib/visa-engine';
import { formatInr, formatUsd, getVisaCategoryBadgeColor, getVisaCategoryLabel } from '@/lib/utils';
import { DocumentChecklist } from '@/components/kokonut/document-checklist';
import { FareTrendChart } from '@/components/charts/fare-trend-chart';
import { FlightSearchForm } from '@/components/kokonut/flight-search-form';
import {
  ArrowLeft,
  ExternalLink,
  ShieldAlert,
  Clock,
  Banknote,
  Calendar,
  Sparkles,
  Plane,
  Building,
} from 'lucide-react';

interface PageProps {
  params: Promise<{
    countryCode: string;
  }>;
}

export async function generateStaticParams() {
  return DESTINATIONS.map((country) => ({
    countryCode: country.countryCode,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { countryCode } = await params;
  const country = DESTINATIONS.find((c) => c.countryCode.toUpperCase() === countryCode.toUpperCase());

  if (!country) {
    return {
      title: 'Destination Not Found | DesiVisa',
    };
  }

  const category = getVisaCategoryLabel(country.defaultCategory);

  return {
    title: `Budget Flights & ${category} Guide for Indian Passports | ${country.countryName}`,
    description: `Complete travel and entry handbook for Indian passport holders visiting ${country.countryName}. ${category} requirements, official portal links, and flight fares from DEL, BOM, BLR.`,
    openGraph: {
      title: `${country.countryName} Visa & Flights for Indian Citizens | DesiVisa`,
      description: `Entry status: ${category}. Starting flights from ${formatInr(country.sampleLowFareInr)}. Official documents, visa fees, and US/Schengen waiver rules.`,
      images: [
        {
          url: country.coverImage,
          width: 1200,
          height: 630,
          alt: `Scenic landscape of ${country.countryName} for Indian tourists`,
        },
      ],
    },
  };
}

export default async function DestinationPage({ params }: PageProps) {
  const { countryCode } = await params;
  const country = DESTINATIONS.find((c) => c.countryCode.toUpperCase() === countryCode.toUpperCase());

  if (!country) {
    notFound();
  }

  // Baseline resolution for standard Indian passport
  const baselineVisa = resolveVisaRequirements(country, {
    hasUSVisa: false,
    hasSchengen: false,
    hasUKVisa: false,
  });

  // Resolved with US Visa
  const usVisaResolved = resolveVisaRequirements(country, {
    hasUSVisa: true,
    hasSchengen: false,
    hasUKVisa: false,
  });

  // Resolved with Schengen Visa
  const schengenVisaResolved = resolveVisaRequirements(country, {
    hasUSVisa: false,
    hasSchengen: true,
    hasUKVisa: false,
  });

  const badgeStyle = getVisaCategoryBadgeColor(baselineVisa.effectiveCategory);
  const categoryLabel = getVisaCategoryLabel(baselineVisa.effectiveCategory);

  return (
    <div className="space-y-10 pb-16">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Destinations</span>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-white min-h-[380px] flex flex-col justify-end p-6 sm:p-10 shadow-lg">
        <Image
          src={country.coverImage}
          alt={`Scenic landscape of ${country.countryName} for Indian tourists`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1200px"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Image
              src={`https://flagcdn.com/32x24/${country.countryCode.toLowerCase()}.png`}
              alt={`Flag of ${country.countryName}`}
              width={28}
              height={21}
              className="rounded-xs shadow-md"
            />
            <span className="text-xs uppercase tracking-widest font-mono text-zinc-300">
              {country.continent} • {country.capitalCity}
            </span>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border} bg-black/60`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`} />
              <span>Standard Indian Passport: {categoryLabel}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {country.countryName}
          </h1>

          <p className="text-sm sm:text-lg text-zinc-200 leading-relaxed font-normal">
            {country.tagline}
          </p>

          {/* Primary Action Buttons (Production Standard 20) */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href={country.officialPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <span>Go to Official Visa Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <a
              href={`https://www.skyscanner.co.in/transport/flights/del/${country.popularAirports[0]?.toLowerCase() || ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-white border border-zinc-700 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-all"
            >
              <Plane className="w-4 h-4" />
              <span>View Flights on Skyscanner</span>
            </a>
          </div>
        </div>
      </div>

      {/* Quick Fact Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <span className="text-zinc-500 dark:text-zinc-400 text-xs font-medium flex items-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5" /> Allowed Stay
          </span>
          <div className="text-xl font-bold text-zinc-900 dark:text-white">
            {country.stayDurationDays} Days
          </div>
          <span className="text-[11px] font-mono text-zinc-400">Single/Multi-Entry</span>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <span className="text-zinc-500 dark:text-zinc-400 text-xs font-medium flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5" /> Processing Time
          </span>
          <div className="text-xl font-bold text-zinc-900 dark:text-white truncate">
            {baselineVisa.processingTime}
          </div>
          <span className="text-[11px] font-mono text-zinc-400">Standard turn-around</span>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <span className="text-zinc-500 dark:text-zinc-400 text-xs font-medium flex items-center gap-1.5 mb-1">
            <Banknote className="w-3.5 h-3.5" /> Visa Fee (INR)
          </span>
          <div className="text-xl font-bold text-zinc-900 dark:text-white">
            {baselineVisa.feeInr === 0 ? 'FREE' : formatInr(baselineVisa.feeInr)}
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            {country.baseFeeUsd === 0 ? 'No consular fee' : `~${formatUsd(country.baseFeeUsd)} USD`}
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <span className="text-zinc-500 dark:text-zinc-400 text-xs font-medium flex items-center gap-1.5 mb-1">
            <Building className="w-3.5 h-3.5" /> Main Airports
          </span>
          <div className="text-xl font-bold text-zinc-900 dark:text-white font-mono">
            {country.popularAirports.join(', ')}
          </div>
          <span className="text-[11px] font-mono text-zinc-400">Hub entry points</span>
        </div>
      </div>

      {/* Conditional Upgrades Section */}
      {(country.conditionalUpgrades.validUSVisaHolder ||
        country.conditionalUpgrades.validSchengenHolder ||
        country.conditionalUpgrades.validUKVisaHolder) && (
        <div className="rounded-2xl border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-600 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-purple-950 dark:text-purple-200">
                Conditional Visa Relaxation Waivers
              </h3>
              <p className="text-xs text-purple-700 dark:text-purple-400">
                Holders of secondary valid visas receive expedited entry into {country.countryName}:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {country.conditionalUpgrades.validUSVisaHolder && (
              <div className="p-4 rounded-xl border border-purple-200/80 dark:border-purple-800 bg-white dark:bg-zinc-900 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-zinc-900 dark:text-white">
                    🇺🇸 US Visa / Green Card Holders
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 font-semibold">
                    {getVisaCategoryLabel(country.conditionalUpgrades.validUSVisaHolder.eligibleCategory)}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {country.conditionalUpgrades.validUSVisaHolder.conditionNotes}
                </p>
              </div>
            )}

            {country.conditionalUpgrades.validSchengenHolder && (
              <div className="p-4 rounded-xl border border-purple-200/80 dark:border-purple-800 bg-white dark:bg-zinc-900 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-zinc-900 dark:text-white">
                    🇪🇺 Schengen Visa Holders
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 font-semibold">
                    {getVisaCategoryLabel(country.conditionalUpgrades.validSchengenHolder.eligibleCategory)}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {country.conditionalUpgrades.validSchengenHolder.conditionNotes}
                </p>
              </div>
            )}

            {country.conditionalUpgrades.validUKVisaHolder && (
              <div className="p-4 rounded-xl border border-purple-200/80 dark:border-purple-800 bg-white dark:bg-zinc-900 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-zinc-900 dark:text-white">
                    🇬🇧 UK Visa Holders
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 font-semibold">
                    {getVisaCategoryLabel(country.conditionalUpgrades.validUKVisaHolder.eligibleCategory)}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {country.conditionalUpgrades.validUKVisaHolder.conditionNotes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mandatory Documents Checklist */}
      <DocumentChecklist
        documents={country.requiredDocuments}
        countryName={country.countryName}
      />

      {/* 12-Month Fare Trend Area Chart (Bklit UI / shadcn style) */}
      <FareTrendChart
        data={country.fareTrends}
        countryName={country.countryName}
      />

      {/* Live Flight Aggregator Search Widget */}
      <FlightSearchForm
        destinationCountryCode={country.countryCode}
        destinationAirport={country.popularAirports[0] || 'XXX'}
        countryName={country.countryName}
      />

      {/* Legal & Port Disclaimers */}
      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            Important Travel Advisory for {country.countryName}:
          </span>
          <p className="leading-relaxed">
            Immigration officers at port of entry retain final discretion over entry grants. Ensure your Indian passport has at least 6 months remaining validity from your scheduled arrival date and a minimum of two blank pages. Always carry printed return tickets, lodging reservations, and sufficient foreign exchange / credit cards.
          </p>
        </div>
      </div>
    </div>
  );
}

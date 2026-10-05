'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, Search } from 'lucide-react';
import type { BaseVisaCategory, CountryVisaProfile, HeldVisa } from '@/types/visa';
import { CONTINENTS } from '@/types/visa';
import { profileFromHeld, resolveVisaRequirements } from '@/lib/visa-engine';
import { cn, flagEmoji, formatInr, getVisaCategoryLabel, visaCategoryDot } from '@/lib/utils';
import { HeldVisaChips } from '@/components/plan/held-visa-chips';
import { VisaMap, type ResolvedCountry } from './visa-map';

export type ExplorerCountry = Pick<
  CountryVisaProfile,
  | 'countryCode'
  | 'countryName'
  | 'continent'
  | 'defaultCategory'
  | 'processingTimeDays'
  | 'baseFeeUsd'
  | 'baseFeeInr'
  | 'stayDurationDays'
  | 'conditionalUpgrades'
  | 'isSchengen'
  | 'officialPortalUrl'
  | 'capitalCity'
  | 'popularAirports'
  | 'bestTimeToVisit'
  | 'tagline'
  | 'requiredDocuments'
  | 'lastVerifiedAt'
>;

type Tab = 'all' | BaseVisaCategory;
const TABS: Tab[] = ['all', 'visa_free', 'voa', 'evisa', 'sticker_required'];

export function VisaExplorer({
  countries,
  initialCategory,
  variant = 'full',
}: {
  countries: ExplorerCountry[];
  initialCategory?: Tab;
  /** 'map' = chips + map only (home page); 'full' adds filters and the country list. */
  variant?: 'full' | 'map';
}) {
  const [held, setHeld] = React.useState<HeldVisa[]>([]);
  const [query, setQuery] = React.useState('');
  const [tab, setTab] = React.useState<Tab>(initialCategory ?? 'all');
  const [continent, setContinent] = React.useState('All');

  const resolved = React.useMemo(() => {
    const profile = profileFromHeld(held);
    return countries.map((c) => ({ c, r: resolveVisaRequirements(c as CountryVisaProfile, profile) }));
  }, [countries, held]);

  const upgraded = resolved.filter((x) => x.r.isUpgraded).length;

  const mapCountries: ResolvedCountry[] = React.useMemo(
    () =>
      resolved.map(({ c, r }) => ({
        code: c.countryCode,
        name: c.countryName,
        category: r.effectiveCategory,
        stayDays: r.stayDays,
        feeInr: r.feeInr,
        upgradeSource: r.upgradeSource,
      })),
    [resolved]
  );

  const chips = (
    <div className="space-y-2">
      <HeldVisaChips value={held} onChange={setHeld} />
      {held.length > 0 && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          Your visas make entry easier in {upgraded} countr{upgraded === 1 ? 'y' : 'ies'}.
        </p>
      )}
    </div>
  );

  if (variant === 'map') {
    return (
      <div className="space-y-6">
        {chips}
        <VisaMap countries={mapCountries} />
      </div>
    );
  }

  const scoped = resolved.filter(({ c }) => {
    if (continent !== 'All' && c.continent !== continent) return false;
    const q = query.trim().toLowerCase();
    return !q || c.countryName.toLowerCase().includes(q) || c.capitalCity.toLowerCase().includes(q);
  });
  const rows = scoped.filter(({ r }) => tab === 'all' || r.effectiveCategory === tab);
  const count = (t: Tab) => (t === 'all' ? scoped.length : scoped.filter(({ r }) => r.effectiveCategory === t).length);

  return (
    <div className="space-y-6">
      {chips}
      <VisaMap countries={mapCountries} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search countries</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a country or city"
            className="w-full h-11 pl-9 pr-3 rounded-lg border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label>
          <span className="sr-only">Region</span>
          <select
            value={continent}
            onChange={(e) => setContinent(e.target.value)}
            className="h-11 w-full sm:w-48 px-3 rounded-lg border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="All">All regions</option>
            {CONTINENTS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex gap-1 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-zinc-200 dark:border-zinc-800" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              'shrink-0 inline-flex items-center gap-2 px-3 py-2.5 text-sm border-b-2 -mb-px transition-colors',
              tab === t
                ? 'border-zinc-900 text-zinc-900 font-medium dark:border-white dark:text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            )}
          >
            {t !== 'all' && <span className={cn('w-2 h-2 rounded-full', visaCategoryDot(t))} aria-hidden />}
            {t === 'all' ? 'All' : getVisaCategoryLabel(t)}
            <span className="text-xs text-zinc-400 tabular-nums">{count(t)}</span>
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500">No countries match these filters.</p>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="hidden sm:grid grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_5rem_6rem_7rem_1.5rem] gap-4 px-4 py-2.5 text-xs font-medium text-zinc-500 bg-zinc-50 dark:bg-zinc-900">
            <span>Country</span>
            <span>Entry for Indians</span>
            <span>Stay</span>
            <span>Fee</span>
            <span>Processing</span>
            <span />
          </div>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.map(({ c, r }) => (
              <li key={c.countryCode}>
                <Link
                  href={`/destination/${c.countryCode}`}
                  className="grid grid-cols-[1fr_auto] sm:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_5rem_6rem_7rem_1.5rem] gap-x-4 gap-y-1 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 items-center"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span className="text-xl leading-none" aria-hidden>{flagEmoji(c.countryCode)}</span>
                    <span className="truncate font-medium">{c.countryName}</span>
                  </span>
                  <span className="sm:hidden row-span-2 self-center text-zinc-300 dark:text-zinc-600">
                    <ChevronRight className="w-4 h-4" aria-hidden />
                  </span>
                  <span className="flex flex-col text-sm pl-9 sm:pl-0">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={cn('w-2 h-2 rounded-full', visaCategoryDot(r.effectiveCategory))} aria-hidden />
                      {getVisaCategoryLabel(r.effectiveCategory)}
                      <span className="sm:hidden text-zinc-500">
                        · {r.stayDays}d · {r.feeInr ? formatInr(r.feeInr) : 'Free'}
                      </span>
                    </span>
                    {r.isUpgraded && <span className="text-xs text-emerald-700 dark:text-emerald-400">with your {r.upgradeSource} visa</span>}
                  </span>
                  <span className="hidden sm:block text-sm tabular-nums">{r.stayDays} days</span>
                  <span className="hidden sm:block text-sm tabular-nums">{r.feeInr ? formatInr(r.feeInr) : 'Free'}</span>
                  <span className="hidden sm:block text-sm text-zinc-600 dark:text-zinc-400">{r.processingTime}</span>
                  <ChevronRight className="hidden sm:block w-4 h-4 text-zinc-300 dark:text-zinc-600" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertTriangle, Info } from 'lucide-react';
import type { BagMode, PlanResult } from '@/types/plan';
import { addDays, buildPlanUrl, formatDay, formatDuration, formatInr, getVisaCategoryLabel } from '@/lib/utils';
import { BagToggle } from './bag-toggle';
import { CostChart } from './cost-chart';
import { OptionCard } from './option-card';
import { VisaStopPanel } from './visa-stop-panel';
import { optionTitle, sortForMode } from './labels';
import { PlanRouteMap } from './plan-route-map';

const CHART_LIMIT = 6;

export function PlanView({ result, initialMode, minDate }: { result: PlanResult; initialMode: BagMode; minDate: string }) {
  const [mode, setMode] = React.useState<BagMode>(initialMode);
  const [hoverId, setHoverId] = React.useState<string | null>(null);

  const changeMode = (m: BagMode) => {
    setMode(m);
    const url = new URL(window.location.href);
    url.searchParams.set('bags', m);
    window.history.replaceState(null, '', url);
  };

  const sorted = React.useMemo(() => sortForMode(result.options, mode), [result.options, mode]);
  const viable = sorted.filter((o) => !o.modes[mode].blocked);
  const cheapestId = viable[0]?.id;
  const fastestId = [...viable].sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes)[0]?.id;
  const singleTotals = viable.filter((o) => o.kind === 'single_ticket').map((o) => o.modes[mode].total);
  const bestSingle = singleTotals.length ? Math.min(...singleTotals) : undefined;
  const destStop = result.options[0]?.modes[mode].visas.find((v) => v.role === 'destination');
  const activeId = hoverId ?? cheapestId;
  const cheapest = viable[0];
  const fastest = viable.find((o) => o.id === fastestId);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const shiftDate = (days: number) => {
    const date = addDays(result.query.date, days);
    return date < minDate ? null : buildPlanUrl({ from: result.query.origin, to: result.query.destinationCountry, date, bags: mode, visas: result.query.heldVisas });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            {result.origin.city} to {result.destination.countryName}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {result.destination.city} ({result.destination.airport}) · {formatDay(result.query.date)} · prices per person
          </p>
        </div>
        <BagToggle value={mode} onChange={changeMode} />
      </div>

      {result.priceSource === 'sample' && (
        <p className="flex gap-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
          <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
          <span>
            <strong className="font-medium text-zinc-900 dark:text-white">Sample prices.</strong> Fares are illustrative until a live
            price source is connected. Visa rules and fees are from our database.
          </span>
        </p>
      )}

      {cheapest && (
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-px rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-800">
          <StatTile label="Cheapest total" value={formatInr(cheapest.modes[mode].total)} detail={optionTitle(cheapest)} accent />
          {fastest && (
            <StatTile
              label="Fastest"
              value={formatDuration(fastest.totalDurationMinutes)}
              detail={`${optionTitle(fastest)} · ${formatInr(fastest.modes[mode].total)}`}
            />
          )}
          {destStop && (
            <StatTile
              label={`${result.destination.countryName} entry`}
              value={getVisaCategoryLabel(destStop.requirement)}
              detail={[destStop.feeInr ? formatInr(destStop.feeInr) : 'Free', destStop.applyBy && `apply by ${formatDay(destStop.applyBy)}`].filter(Boolean).join(' · ')}
            />
          )}
        </dl>
      )}

      {result.options.length > 0 && (
        <PlanRouteMap result={result} options={sorted.slice(0, CHART_LIMIT + 2)} mode={mode} activeId={activeId} onActivate={setHoverId} />
      )}

      {destStop && (
        <section aria-label={`Visa for ${result.destination.countryName}`}>
          <VisaStopPanel stop={destStop} />
        </section>
      )}

      {result.options.length === 0 ? (
        <EmptyState prev={shiftDate(-1)} next={shiftDate(1)} />
      ) : (
        <>
          {viable.length === 0 && (
            <p className="flex gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
              None of these routes work for this date because a visa can&apos;t be issued in time. Try a later date
              {shiftDate(30) && (
                <>
                  {' '}
                  — e.g.{' '}
                  <Link className="underline" href={shiftDate(30)!}>
                    {formatDay(addDays(result.query.date, 30))}
                  </Link>
                </>
              )}
              .
            </p>
          )}

          <CostChart options={sorted.slice(0, CHART_LIMIT)} mode={mode} onSelect={scrollTo} onHover={setHoverId} activeId={activeId} />

          <section aria-label="Routes" className="space-y-3">
            <h2 className="text-sm text-zinc-500">
              {sorted.length} route{sorted.length === 1 ? '' : 's'}, sorted by total {mode === 'cabin' ? 'with cabin bag only' : 'with a checked bag'}
            </h2>
            {sorted.map((o) => {
              const tags = [o.id === cheapestId && 'Cheapest', o.id === fastestId && 'Fastest'].filter(Boolean) as string[];
              const savings = o.kind === 'self_transfer' && bestSingle !== undefined ? bestSingle - o.modes[mode].total : undefined;
              return (
                <OptionCard
                  key={o.id}
                  onHover={setHoverId}
                  active={o.id === activeId}
                  option={o}
                  mode={mode}
                  tags={tags}
                  savingsVsSingle={savings}
                  liveCheckAvailable={result.liveCheckAvailable}
                  adults={result.query.adults}
                />
              );
            })}
          </section>

          <div className="flex flex-wrap gap-3 text-sm text-zinc-600 dark:text-zinc-400">
            <span>Try another day:</span>
            {[-1, 1, 7].map((d) => {
              const href = shiftDate(d);
              return href ? (
                <Link key={d} href={href} className="underline underline-offset-4 decoration-zinc-300 hover:text-zinc-900 dark:decoration-zinc-600 dark:hover:text-white">
                  {formatDay(addDays(result.query.date, d))}
                </Link>
              ) : null;
            })}
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({ prev, next }: { prev: string | null; next: string | null }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center space-y-3">
      <p className="font-medium">No flights found for this date.</p>
      <p className="text-sm text-zinc-500">Prices are cached from recent searches, so quieter routes and dates can be missing.</p>
      <div className="flex justify-center gap-4 text-sm">
        {prev && <Link href={prev} className="underline">Day before</Link>}
        {next && <Link href={next} className="underline">Day after</Link>}
      </div>
    </div>
  );
}

function StatTile({ label, value, detail, accent }: { label: string; value: string; detail: string; accent?: boolean }) {
  return (
    <div className="bg-white dark:bg-zinc-950 p-4 sm:p-5">
      <dt className="text-sm text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="mt-1">
        <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
          {accent && <span className="inline-block w-2.5 h-2.5 rounded-full bg-brand mr-2 align-middle" aria-hidden />}
          {value}
        </span>
        <span className="block mt-1 text-sm text-zinc-500 dark:text-zinc-400 truncate">{detail}</span>
      </dd>
    </div>
  );
}

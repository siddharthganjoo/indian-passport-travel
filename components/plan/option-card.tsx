'use client';

import * as React from 'react';
import { AlertTriangle, ChevronDown, ExternalLink, Info, Loader2 } from 'lucide-react';
import type { BagMode, PlanLeg, PlanOption } from '@/types/plan';
import type { FareOffer } from '@/types/flight';
import { cn, dayShift, formatClock, formatDuration, formatInr, visaCategoryDot } from '@/lib/utils';
import { optionSubtitle, optionTitle, routeCodes, stopSummary } from './labels';
import { VisaStopPanel } from './visa-stop-panel';

interface Props {
  option: PlanOption;
  mode: BagMode;
  tags: string[];
  savingsVsSingle?: number;
  liveCheckAvailable: boolean;
  adults: number;
  defaultOpen?: boolean;
  active?: boolean;
  onHover?: (id: string | null) => void;
}

export function OptionCard({ option, mode, tags, savingsVsSingle, liveCheckAvailable, adults, defaultOpen, active, onHover }: Props) {
  const [open, setOpen] = React.useState(!!defaultOpen);
  const m = option.modes[mode];
  const last = option.legs[option.legs.length - 1].offer;

  return (
    <article
      id={option.id}
      onMouseEnter={() => onHover?.(option.id)}
      onMouseLeave={() => onHover?.(null)}
      className={cn(
        'rounded-2xl border bg-white dark:bg-zinc-950 scroll-mt-24 transition-colors',
        m.blocked && 'opacity-80',
        active ? 'border-black dark:border-white' : 'border-zinc-200 dark:border-zinc-800'
      )}
    >
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="w-full text-left p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3 min-h-5">
          {tags.map((t) => (
            <span
              key={t}
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                t === 'Cheapest' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
              )}
            >
              {t}
            </span>
          ))}
          {option.kind === 'self_transfer' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Self-transfer</span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2 text-lg font-semibold tabular-nums">
              {formatClock(option.departAt)}
              <span className="text-zinc-300 dark:text-zinc-600 font-normal">–</span>
              {formatClock(option.arriveAt)}
              {dayShift(option.departAt, option.arriveAt) && (
                <sup className="text-xs font-medium text-zinc-500">{dayShift(option.departAt, option.arriveAt)}</sup>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{optionTitle(option)}</span>
              <span aria-hidden>·</span>
              <span>{formatDuration(option.totalDurationMinutes)}</span>
              <span aria-hidden>·</span>
              <span>{routeCodes(option).join(' → ')}</span>
            </div>
            <div className="mt-1 text-sm text-zinc-500">{optionSubtitle(option)}</div>
          </div>

          <div className="sm:text-right">
            {m.blocked ? (
              <div className="text-sm font-medium text-rose-600 dark:text-rose-400">Not possible for this date</div>
            ) : (
              <>
                <div className="text-2xl font-semibold tabular-nums">{formatInr(m.total)}</div>
                <div className="text-xs text-zinc-500">per person · fares, bags &amp; visas</div>
                {savingsVsSingle !== undefined && savingsVsSingle > 500 && (
                  <div className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                    {formatInr(savingsVsSingle)} less than one ticket
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
          {m.visas.map((v) => (
            <li key={`${v.role}-${v.countryCode}`} className="inline-flex items-center gap-1.5">
              <span className={cn('w-2 h-2 rounded-full', visaCategoryDot(v.requirement))} aria-hidden />
              {stopSummary(v)}
            </li>
          ))}
        </ul>

        {m.blocked && m.blockReason && (
          <p className="mt-3 flex items-start gap-2 text-sm text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
            {m.blockReason}
          </p>
        )}

        <span className="mt-4 inline-flex items-center gap-1 text-sm text-zinc-500">
          {open ? 'Hide details' : 'Flights, bags & visa steps'}
          <ChevronDown className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} aria-hidden />
        </span>
      </button>

      {open && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 p-4 sm:p-5 space-y-6">
          <section aria-label="Flights" className="space-y-3">
            {option.legs.map((leg, i) => (
              <React.Fragment key={leg.offer.id}>
                <LegRow leg={leg} mode={mode} liveCheckAvailable={liveCheckAvailable} adults={adults} />
                {i < option.legs.length - 1 && option.layoverMinutes !== undefined && (
                  <div className="ml-3 pl-4 border-l-2 border-dashed border-zinc-200 dark:border-zinc-700 py-1 text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      {formatDuration(option.layoverMinutes)} layover in {option.hub?.city}
                    </div>
                    {m.warnings.map((w) => (
                      <div key={w}>{w}</div>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
            {last.source === 'sample' && (
              <p className="text-xs text-zinc-500">Sample schedule and price — check the booking site for real flights.</p>
            )}
          </section>

          <section aria-label="Cost breakdown">
            <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500 mb-2">Cost per person</h3>
            <dl className="text-sm divide-y divide-zinc-100 dark:divide-zinc-800 max-w-sm">
              <Row label="Flights" value={m.fares} />
              {mode === 'checked' && <Row label="Checked bag fees (est.)" value={m.bagFees} />}
              <Row label="Visa fees" value={m.visaFees} />
              {m.extras > 0 && <Row label="Layover stay (est.)" value={m.extras} />}
              <div className="flex justify-between py-2 font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatInr(m.total)}</dd>
              </div>
            </dl>
          </section>

          <section aria-label="Visas" className="space-y-2">
            <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">Visas for this route</h3>
            {m.visas.map((v) => (
              <VisaStopPanel key={`${v.role}-${v.countryCode}`} stop={v} />
            ))}
          </section>

          {(option.notes.length > 0 || option.curatedNote) && (
            <section aria-label="Good to know" className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              {option.curatedNote && (
                <p className="flex gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-zinc-400" aria-hidden />
                  {option.curatedNote}
                </p>
              )}
              {option.notes.map((n) => (
                <p key={n} className="flex gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-zinc-400" aria-hidden />
                  {n}
                </p>
              ))}
            </section>
          )}
        </div>
      )}
    </article>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between py-2">
      <dt className="text-zinc-600 dark:text-zinc-400">{label}</dt>
      <dd className="tabular-nums">{value ? formatInr(value) : '—'}</dd>
    </div>
  );
}

function baggageText(leg: PlanLeg, mode: BagMode): string {
  const { checkedPieces, cabinKg, basis } = leg.offer.baggage;
  const cabin = cabinKg ? `${cabinKg}kg cabin` : 'Cabin bag';
  const typical = basis === 'airline_policy' ? ' (typical for this airline)' : '';
  if (checkedPieces === null) return `${cabin} · checked bag allowance unknown`;
  if (checkedPieces > 0) return `${cabin} · ${checkedPieces} checked bag${checkedPieces > 1 ? 's' : ''} included${typical}`;
  return mode === 'checked'
    ? `${cabin} only — adding a checked bag ≈ ${formatInr(leg.checkedBagFeeInr)}${typical}`
    : `${cabin} only${typical}`;
}

function LegRow({ leg, mode, liveCheckAvailable, adults }: { leg: PlanLeg; mode: BagMode; liveCheckAvailable: boolean; adults: number }) {
  const o = leg.offer;
  const [live, setLive] = React.useState<{ state: 'idle' | 'loading' | 'done' | 'error'; offer?: FareOffer; message?: string }>({ state: 'idle' });

  const checkLive = async () => {
    setLive({ state: 'loading' });
    try {
      const params = new URLSearchParams({ from: o.from, to: o.to, date: o.departAt.slice(0, 10), adults: String(adults), carrier: o.carrierCode });
      const res = await fetch(`/api/fares/live?${params}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Live check failed');
      setLive(body.offers?.[0] ? { state: 'done', offer: body.offers[0] } : { state: 'error', message: 'No live seats found for this flight.' });
    } catch (e) {
      setLive({ state: 'error', message: e instanceof Error ? e.message : 'Live check failed' });
    }
  };

  const bookLabel = o.source === 'travelpayouts' ? 'View on Aviasales' : o.source === 'duffel' ? 'Find this flight' : 'Search on Skyscanner';

  return (
    <div className="flex gap-3">
      <div className="mt-1.5 w-2 h-2 rounded-full bg-zinc-900 dark:bg-white shrink-0" aria-hidden />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="font-medium tabular-nums">
            {formatClock(o.departAt)} {o.from} → {formatClock(o.arriveAt)} {o.to}
            {dayShift(o.departAt, o.arriveAt) && <sup className="ml-0.5 text-xs text-zinc-500">{dayShift(o.departAt, o.arriveAt)}</sup>}
          </span>
          <span className="text-zinc-500">{formatDuration(o.durationMinutes)}</span>
        </div>
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          {o.carrierName} · {o.segments.map((s) => s.flightNumber).join(', ')}
          {o.stops > 0 && ` · ${o.stops} stop${o.via.length ? ` in ${o.via.join(', ')}` : ''}`}
        </div>
        <div className="text-sm text-zinc-600 dark:text-zinc-400">{baggageText(leg, mode)}</div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-sm">
          <span className="font-medium tabular-nums">{formatInr(o.priceInr)}</span>
          <a
            href={o.deepLink}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-1 underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-900 dark:decoration-zinc-600 dark:hover:decoration-white"
          >
            {bookLabel} <ExternalLink className="w-3.5 h-3.5" aria-hidden />
          </a>
          {liveCheckAvailable && live.state === 'idle' && (
            <button type="button" onClick={checkLive} className="text-zinc-600 underline underline-offset-4 decoration-zinc-300 dark:text-zinc-400">
              Check live price &amp; bags
            </button>
          )}
          {live.state === 'loading' && (
            <span className="inline-flex items-center gap-1 text-zinc-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden /> Checking…
            </span>
          )}
        </div>
        {live.state === 'done' && live.offer && (
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            Live now: {formatInr(live.offer.priceInr)} on {live.offer.carrierName} ·{' '}
            {live.offer.baggage.checkedPieces ? `${live.offer.baggage.checkedPieces} checked bag included` : 'no checked bag included'}
          </p>
        )}
        {live.state === 'error' && <p className="text-sm text-zinc-500">{live.message}</p>}
      </div>
    </div>
  );
}

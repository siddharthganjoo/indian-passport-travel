'use client';

import * as React from 'react';
import type { BagMode, ModeBreakdown, PlanOption } from '@/types/plan';
import { BAG_MODES } from '@/types/plan';
import { cn, formatInr, formatInrCompact } from '@/lib/utils';
import { MODE_LABEL, optionTitle } from './labels';

const SEGMENTS = [
  { key: 'fares', label: 'Flights', color: 'var(--series-fare)' },
  { key: 'bagFees', label: 'Bag fees', color: 'var(--series-bags)' },
  { key: 'visaFees', label: 'Visa fees', color: 'var(--series-visa)' },
  { key: 'extras', label: 'Layover stay', color: 'var(--series-extra)' },
] as const;

interface Hover {
  id: string;
  mode: BagMode;
}

/**
 * Horizontal stacked bars: for each route, total cost with cabin bag only vs.
 * with a checked bag, split into flights / bag fees / visa fees / layover stay.
 */
export function CostChart({
  options,
  mode,
  onSelect,
  onHover,
  activeId,
}: {
  options: PlanOption[];
  mode: BagMode;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
  activeId?: string;
}) {
  const [hover, setHover] = React.useState<Hover | null>(null);
  const max = Math.max(...options.flatMap((o) => BAG_MODES.map((m) => o.modes[m].total)), 1);
  const usedSegments = SEGMENTS.filter((s) => options.some((o) => BAG_MODES.some((m) => o.modes[m][s.key] > 0)));

  return (
    <figure className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5">
      <figcaption className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5">
        <div>
          <div className="font-medium">Total cost per person</div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Top bar: cabin bag only · bottom bar: with one checked bag</div>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400" aria-label="Legend">
          {usedSegments.map((s) => (
            <li key={s.key} className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} aria-hidden />
              {s.label}
            </li>
          ))}
        </ul>
      </figcaption>

      <div className="space-y-4" aria-hidden>
        {options.map((o) => (
          <div
            key={o.id}
            onMouseEnter={() => onHover?.(o.id)}
            onMouseLeave={() => onHover?.(null)}
            className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-1 sm:gap-3 sm:items-center"
          >
            <button
              type="button"
              tabIndex={-1}
              onClick={() => onSelect(o.id)}
              className={cn(
                'text-left text-sm leading-tight truncate',
                o.id === activeId ? 'font-semibold text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
              )}
              title={optionTitle(o)}
            >
              {optionTitle(o)}
            </button>
            <div className="space-y-1">
              {BAG_MODES.map((m) => (
                <Bar
                  key={m}
                  breakdown={o.modes[m]}
                  max={max}
                  emphasised={m === mode}
                  hovered={hover?.id === o.id && hover.mode === m}
                  onHover={(on) => setHover(on ? { id: o.id, mode: m } : null)}
                  onClick={() => onSelect(o.id)}
                  label={`${optionTitle(o)}, ${MODE_LABEL[m]}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Accessible table view of the same numbers (wrapped: tables ignore sr-only's 1px width). */}
      <div className="sr-only">
      <table>
        <caption>Total cost per person by route and baggage choice</caption>
        <thead>
          <tr>
            <th scope="col">Route</th>
            <th scope="col">Baggage</th>
            {SEGMENTS.map((s) => (
              <th key={s.key} scope="col">{s.label}</th>
            ))}
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {options.flatMap((o) =>
            BAG_MODES.map((m) => (
              <tr key={`${o.id}-${m}`}>
                <th scope="row">{optionTitle(o)}</th>
                <td>{MODE_LABEL[m]}</td>
                {SEGMENTS.map((s) => (
                  <td key={s.key}>{formatInr(o.modes[m][s.key])}</td>
                ))}
                <td>{o.modes[m].blocked ? `Not possible: ${o.modes[m].blockReason}` : formatInr(o.modes[m].total)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </figure>
  );
}

function Bar({
  breakdown,
  max,
  emphasised,
  hovered,
  onHover,
  onClick,
  label,
}: {
  breakdown: ModeBreakdown;
  max: number;
  emphasised: boolean;
  hovered: boolean;
  onHover: (on: boolean) => void;
  onClick: () => void;
  label: string;
}) {
  const width = (breakdown.total / max) * 100;
  return (
    <div
      className="relative flex items-center gap-2 h-4 cursor-pointer"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
    >
      <div className="relative flex-1 h-full">
        {breakdown.blocked ? (
          <div
            className="hatch h-full rounded-r text-zinc-300 dark:text-zinc-700 border border-dashed border-zinc-300 dark:border-zinc-700"
            style={{ width: `${width}%` }}
          />
        ) : (
          <div className={cn('flex h-full gap-[2px] transition-opacity', !emphasised && 'opacity-55')} style={{ width: `${width}%` }}>
            {SEGMENTS.filter((s) => breakdown[s.key] > 0).map((s, i, arr) => (
              <div
                key={s.key}
                className={cn('h-full', i === arr.length - 1 && 'rounded-r')}
                style={{ flexGrow: breakdown[s.key], flexBasis: 0, background: s.color, minWidth: 3 }}
              />
            ))}
          </div>
        )}
        {hovered && <Tooltip breakdown={breakdown} label={label} />}
      </div>
      <span
        className={cn(
          'w-14 shrink-0 text-xs tabular-nums',
          emphasised ? 'text-zinc-900 font-medium dark:text-white' : 'text-zinc-500 dark:text-zinc-400'
        )}
      >
        {breakdown.blocked ? 'N/A' : formatInrCompact(breakdown.total)}
      </span>
    </div>
  );
}

function Tooltip({ breakdown, label }: { breakdown: ModeBreakdown; label: string }) {
  return (
    <div className="absolute left-0 bottom-full mb-2 z-20 w-60 rounded-lg border border-zinc-200 bg-white p-3 text-xs shadow-lg dark:border-zinc-700 dark:bg-zinc-900 pointer-events-none">
      <div className="font-medium mb-2 text-zinc-900 dark:text-white">{label}</div>
      {breakdown.blocked ? (
        <p className="text-zinc-600 dark:text-zinc-400">{breakdown.blockReason}</p>
      ) : (
        <dl className="space-y-1">
          {SEGMENTS.filter((s) => breakdown[s.key] > 0).map((s) => (
            <div key={s.key} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm" style={{ background: s.color }} aria-hidden />
              <dt className="text-zinc-600 dark:text-zinc-400">{s.label}</dt>
              <dd className="ml-auto tabular-nums text-zinc-900 dark:text-white">{formatInr(breakdown[s.key])}</dd>
            </div>
          ))}
          <div className="flex pt-1 mt-1 border-t border-zinc-200 dark:border-zinc-700 font-medium">
            <dt>Total</dt>
            <dd className="ml-auto tabular-nums">{formatInr(breakdown.total)}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}

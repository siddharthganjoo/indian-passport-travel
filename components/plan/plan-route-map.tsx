'use client';

import * as React from 'react';
import type { BagMode, PlanOption, PlanResult } from '@/types/plan';
import { RouteMap, type RouteArc, type RoutePoint } from '@/components/maps/route-map';
import { EASE_FILL } from '@/lib/utils';
import { optionTitle } from './labels';

/** Airports an option passes through, in order. */
function stopsOf(o: PlanOption): string[] {
  const codes: string[] = [];
  for (const { offer } of o.legs) codes.push(offer.from, ...offer.via, offer.to);
  return codes.filter((c, i) => c !== codes[i - 1]);
}

/**
 * Every compared route drawn on one map: the active option in solid ink,
 * the others faint, and the straight India → destination line dashed.
 */
export function PlanRouteMap({
  result,
  options,
  mode,
  activeId,
  onActivate,
}: {
  result: PlanResult;
  options: PlanOption[];
  mode: BagMode;
  activeId?: string;
  onActivate: (id: string | null) => void;
}) {
  const { points, arcs } = React.useMemo(() => {
    const origin = result.origin.iata;
    const dest = result.destination.airport;
    const pointMap = new Map<string, RoutePoint>([
      [origin, { iata: origin, role: 'origin' }],
      [dest, { iata: dest, role: 'destination' }],
    ]);
    const arcMap = new Map<string, RouteArc>();
    arcMap.set('direct', { id: 'direct', from: origin, to: dest, emphasis: 'direct' });

    for (const o of options) {
      const stops = stopsOf(o);
      stops.slice(1, -1).forEach((iata) => pointMap.has(iata) || pointMap.set(iata, { iata, role: 'hub' }));
      for (let i = 0; i < stops.length - 1; i++) {
        const key = `${stops[i]}-${stops[i + 1]}`;
        const active = o.id === activeId;
        const existing = arcMap.get(key);
        if (!existing || active) arcMap.set(key, { id: o.id, from: stops[i], to: stops[i + 1], emphasis: active ? 'active' : 'muted' });
      }
    }
    return { points: [...pointMap.values()], arcs: [...arcMap.values()] };
  }, [options, activeId, result.origin.iata, result.destination.airport]);

  const destVisa = options[0]?.modes[mode].visas.find((v) => v.role === 'destination');
  const fills = {
    IN: 'var(--ease-embassy)',
    [result.destination.countryCode]: destVisa ? EASE_FILL[destVisa.requirement] : 'var(--ease-voa)',
  };
  const active = options.find((o) => o.id === activeId);

  return (
    <figure className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <RouteMap
        label={`Map of ${options.length} routes from ${result.origin.city} to ${result.destination.city}`}
        points={points}
        arcs={arcs}
        fills={fills}
        onArcHover={(id) => id && id !== 'direct' && onActivate(id)}
        className="bg-zinc-50 dark:bg-zinc-900"
      />
      <figcaption className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 text-sm border-t border-zinc-200 dark:border-zinc-800">
        <span className="font-medium">{active ? optionTitle(active) : 'Hover a route to highlight it'}</span>
        <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white" aria-hidden /> {result.origin.iata}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-black dark:border-white" aria-hidden /> Stopover
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand" aria-hidden /> {result.destination.airport}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-dashed border-zinc-400" aria-hidden /> Straight line
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

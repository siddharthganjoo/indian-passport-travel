'use client';

import { RouteMap, type RouteArc, type RoutePoint } from '@/components/maps/route-map';

interface Props {
  hubs: string[];
  /** Curated [hub, destination airport] pairs. */
  routes: { hub: string; dest: string }[];
}

/** Hero infographic: India → the hubs we check → example destinations. */
export function HubNetworkMap({ hubs, routes }: Props) {
  const dests = [...new Set(routes.map((r) => r.dest))];
  const points: RoutePoint[] = [
    { iata: 'DEL', role: 'origin', label: 'India' },
    ...hubs.map((iata) => ({ iata, role: 'hub' as const, label: '' })),
    ...dests.map((iata) => ({ iata, role: 'destination' as const, label: '' })),
  ];
  const arcs: RouteArc[] = [
    ...hubs.map((h) => ({ id: `in-${h}`, from: 'DEL', to: h, emphasis: 'muted' as const })),
    ...routes.map((r) => ({ id: `${r.hub}-${r.dest}`, from: r.hub, to: r.dest, emphasis: 'active' as const })),
  ];
  return (
    <RouteMap
      label={`Map of India connected to ${hubs.length} transit hubs and onward destinations`}
      points={points}
      arcs={arcs}
      fills={{ IN: 'var(--map-home)' }}
      crop={false}
    />
  );
}

'use client';

import * as React from 'react';
import { geoInterpolate } from 'd3-geo';
import { getAirport } from '@/lib/geo';
import { MAP_HEIGHT, MAP_WIDTH, arcPath, project } from '@/lib/world-projection';
import { WorldMap } from './world-map';

export interface RoutePoint {
  iata: string;
  role: 'origin' | 'hub' | 'destination';
  /** Text beside the pin; defaults to the IATA code, '' hides it. */
  label?: string;
}

export interface RouteArc {
  id: string;
  from: string;
  to: string;
  emphasis: 'active' | 'muted' | 'direct';
}

interface Props {
  points: RoutePoint[];
  arcs: RouteArc[];
  /** Country fills (e.g. origin + destination highlighted). */
  fills?: Record<string, string>;
  label: string;
  /** Zoom to the route (default) or show the whole world. */
  crop?: boolean;
  /** Called with an arc id when its line is hovered. */
  onArcHover?: (id: string | null) => void;
  className?: string;
}

const lonLat = (iata: string): [number, number] | null => {
  const a = getAirport(iata);
  return a ? [a.lon, a.lat] : null;
};

/** Bounding box of every point and arc sample, padded and shaped to a ~2:1 frame. */
function cropBox(points: [number, number][]): [number, number, number, number] {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  let [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const padX = Math.max(40, (x1 - x0) * 0.12);
  const padY = Math.max(30, (y1 - y0) * 0.18);
  x0 -= padX;
  x1 += padX;
  y0 -= padY;
  y1 += padY;
  let w = Math.max(x1 - x0, 220);
  let h = y1 - y0;
  const ratio = 2.1;
  if (w / h > ratio) h = w / ratio;
  else w = h * ratio;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  w = Math.min(w, MAP_WIDTH);
  h = Math.min(h, MAP_HEIGHT);
  const x = Math.min(Math.max(cx - w / 2, 0), MAP_WIDTH - w);
  const y = Math.min(Math.max(cy - h / 2, 0), MAP_HEIGHT - h);
  return [x, y, w, h];
}

export function RouteMap({ points, arcs, fills, label, crop = true, onArcHover, className }: Props) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [pxWidth, setPxWidth] = React.useState(800);

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setPxWidth(entry.contentRect.width || 800));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const geometry = React.useMemo(() => {
    const samples: [number, number][] = [];
    const lines = arcs
      .map((arc) => {
        const a = lonLat(arc.from);
        const b = lonLat(arc.to);
        if (!a || !b) return null;
        const interp = geoInterpolate(a, b);
        for (let i = 0; i <= 8; i++) {
          const [lon, lat] = interp(i / 8);
          samples.push(project(lon, lat));
        }
        return { ...arc, d: arcPath(a, b) };
      })
      .filter((x): x is RouteArc & { d: string } => !!x);
    const pins = points
      .map((p) => {
        const ll = lonLat(p.iata);
        if (!ll) return null;
        const xy = project(ll[0], ll[1]);
        samples.push(xy);
        return { ...p, xy };
      })
      .filter((x): x is RoutePoint & { xy: [number, number] } => !!x);
    const viewBox: [number, number, number, number] =
      crop && samples.length ? cropBox(samples) : [0, 0, MAP_WIDTH, MAP_HEIGHT];
    return { lines, pins, viewBox };
  }, [arcs, points, crop]);

  // Map units per screen pixel, so lines and labels stay a constant on-screen size.
  const u = geometry.viewBox[2] / pxWidth;
  const order = { muted: 0, direct: 1, active: 2 } as const;
  const sortedLines = [...geometry.lines].sort((a, b) => order[a.emphasis] - order[b.emphasis]);
  const labels = placeLabels(geometry.pins, geometry.lines, u);

  const overlay = (
    <g>
      {sortedLines.map((l) => (
        <g key={`${l.from}-${l.to}-${l.emphasis}`}>
          <path
            d={l.d}
            fill="none"
            stroke="currentColor"
            strokeOpacity={l.emphasis === 'active' ? 1 : 0.35}
            strokeWidth={(l.emphasis === 'active' ? 2.5 : 1.5) * u}
            strokeDasharray={l.emphasis === 'direct' ? `${4 * u} ${4 * u}` : undefined}
            strokeLinecap="round"
            pathLength={l.emphasis === 'direct' ? undefined : 1}
            className={l.emphasis === 'direct' ? undefined : 'arc-draw'}
          />
          {onArcHover && (
            <path
              d={l.d}
              fill="none"
              stroke="transparent"
              strokeWidth={14 * u}
              onPointerEnter={() => onArcHover(l.id)}
              onPointerLeave={() => onArcHover(null)}
            />
          )}
        </g>
      ))}
      {geometry.pins.map((p) => {
        const r = (p.role === 'hub' ? 4 : 5.5) * u;
        return (
          <g key={`${p.role}-${p.iata}`}>
            <circle
              cx={p.xy[0]}
              cy={p.xy[1]}
              r={r}
              fill={p.role === 'destination' ? 'var(--color-brand)' : p.role === 'origin' ? 'currentColor' : 'var(--map-stroke)'}
              stroke={p.role === 'hub' ? 'currentColor' : 'var(--map-stroke)'}
              strokeWidth={2 * u}
            />
            {labels.get(p.iata) && (
              <text
                x={labels.get(p.iata)!.x}
                y={labels.get(p.iata)!.y}
                textAnchor={labels.get(p.iata)!.anchor}
                fontSize={12 * u}
                fontWeight={p.role === 'hub' ? 500 : 700}
                fill="currentColor"
                stroke="var(--map-stroke)"
                strokeWidth={3 * u}
                paintOrder="stroke"
                strokeLinejoin="round"
              >
                {p.label ?? p.iata}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );

  return (
    <div ref={wrapRef} className={className}>
      <WorldMap label={label} fills={fills} baseFill="var(--ease-none)" smallCountryDots={false} viewBox={geometry.viewBox} overlay={overlay} />
    </div>
  );
}

interface PlacedLabel {
  x: number;
  y: number;
  anchor: 'start' | 'end';
}

/**
 * Greedy label placement: endpoints first, then hubs on the active route, then
 * the rest. Each label tries four spots around its pin and is dropped (not
 * nudged away from its pin) if all collide with labels already placed.
 */
function placeLabels(
  pins: (RoutePoint & { xy: [number, number] })[],
  lines: (RouteArc & { d: string })[],
  u: number
): Map<string, PlacedLabel> {
  const activeStops = new Set(lines.filter((l) => l.emphasis === 'active').flatMap((l) => [l.from, l.to]));
  const rank = (p: RoutePoint) => (p.role !== 'hub' ? 0 : activeStops.has(p.iata) ? 1 : 2);
  const placed = new Map<string, PlacedLabel>();
  const boxes: [number, number, number, number][] = pins.map((p) => [p.xy[0] - 6 * u, p.xy[1] - 6 * u, p.xy[0] + 6 * u, p.xy[1] + 6 * u]);
  const hits = (b: [number, number, number, number]) => boxes.some((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);

  for (const p of [...pins].sort((a, b) => rank(a) - rank(b))) {
    const text = p.label ?? p.iata;
    if (!text) continue;
    const w = text.length * 7.4 * u;
    const h = 12 * u;
    const [x, y] = p.xy;
    const gap = 8 * u;
    const candidates: PlacedLabel[] = [
      { x: x + gap, y: y - gap + 2 * u, anchor: 'start' },
      { x: x - gap, y: y - gap + 2 * u, anchor: 'end' },
      { x: x + gap, y: y + gap + h - 2 * u, anchor: 'start' },
      { x: x - gap, y: y + gap + h - 2 * u, anchor: 'end' },
    ];
    for (const c of candidates) {
      const x0 = c.anchor === 'start' ? c.x : c.x - w;
      const box: [number, number, number, number] = [x0, c.y - h, x0 + w, c.y + 2 * u];
      // Own pin is in `boxes`, but labels are offset from it, so only other marks collide.
      if (!hits(box)) {
        placed.set(p.iata, c);
        boxes.push(box);
        break;
      }
    }
  }
  return placed;
}

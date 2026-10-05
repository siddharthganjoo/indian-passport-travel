'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AIRPORTS } from '@/data/airports';
import { MAP_HEIGHT, MAP_WIDTH, WORLD_CODES, WORLD_SHAPES, project } from '@/lib/world-projection';
import { cn } from '@/lib/utils';

/** Countries too small for the 1:110m outlines, drawn as dots at their main airport. */
const SMALL_COUNTRY_POINTS: Record<string, [number, number]> = (() => {
  const out: Record<string, [number, number]> = {};
  for (const a of AIRPORTS) {
    if (!WORLD_CODES.has(a.countryCode) && !out[a.countryCode]) out[a.countryCode] = project(a.lon, a.lat);
  }
  return out;
})();

const SHAPES_BY_CODE = new Map(WORLD_SHAPES.map((s) => [s.code, s]));

export interface WorldMapProps {
  /** ISO-2 -> CSS fill. Countries not listed use `baseFill`. */
  fills?: Record<string, string>;
  baseFill?: string;
  /** Draw small listed countries as dots (default true). */
  smallCountryDots?: boolean;
  /** Tooltip content for a hovered country; return null to disable hover for it. */
  tooltip?: (code: string, name: string) => React.ReactNode | null;
  /** Navigate on click. */
  href?: (code: string) => string | null;
  /** SVG content drawn above the countries (arcs, pins), in map coordinates. */
  overlay?: React.ReactNode;
  viewBox?: [number, number, number, number];
  className?: string;
  label: string;
}

export function WorldMap({
  fills = {},
  baseFill = 'var(--ease-none)',
  smallCountryDots = true,
  tooltip,
  href,
  overlay,
  viewBox = [0, 0, MAP_WIDTH, MAP_HEIGHT],
  className,
  label,
}: WorldMapProps) {
  const router = useRouter();
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [hover, setHover] = React.useState<{ code: string; x: number; y: number } | null>(null);
  const interactive = !!(tooltip || href);
  const scale = viewBox[2] / MAP_WIDTH; // keep strokes/dots visually constant when zoomed

  const onMove = (e: React.PointerEvent) => {
    const code = (e.target as Element).getAttribute?.('data-code');
    const box = wrapRef.current?.getBoundingClientRect();
    if (!code || !box) return setHover(null);
    setHover({ code, x: e.clientX - box.left, y: e.clientY - box.top });
  };

  const onClick = (e: React.MouseEvent) => {
    const code = (e.target as Element).getAttribute?.('data-code');
    const to = code && href?.(code);
    if (to) router.push(to);
  };

  const hoveredShape = hover ? SHAPES_BY_CODE.get(hover.code) : undefined;
  const hoveredDot = hover ? SMALL_COUNTRY_POINTS[hover.code] : undefined;
  const tip = hover && tooltip ? tooltip(hover.code, hoveredShape?.name ?? hover.code) : null;

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <svg
        viewBox={viewBox.join(' ')}
        className={cn('block w-full h-auto', interactive && 'cursor-pointer')}
        role="img"
        aria-label={label}
        onPointerMove={interactive ? onMove : undefined}
        onPointerLeave={interactive ? () => setHover(null) : undefined}
        onClick={href ? onClick : undefined}
      >
        <Countries fills={fills} baseFill={baseFill} strokeWidth={0.5 * scale} />
        {smallCountryDots && (
          <g>
            {Object.entries(fills).map(([code, fill]) => {
              const p = SMALL_COUNTRY_POINTS[code];
              return p ? (
                <circle key={code} data-code={code} cx={p[0]} cy={p[1]} r={2.8 * scale} fill={fill} stroke="var(--map-stroke)" strokeWidth={0.8 * scale} />
              ) : null;
            })}
          </g>
        )}
        {hoveredShape && tip !== null && (
          <path d={hoveredShape.d} fill="none" stroke="currentColor" strokeWidth={1.4 * scale} pointerEvents="none" />
        )}
        {hoveredDot && tip !== null && (
          <circle cx={hoveredDot[0]} cy={hoveredDot[1]} r={4.5 * scale} fill="none" stroke="currentColor" strokeWidth={1.4 * scale} pointerEvents="none" />
        )}
        {overlay}
      </svg>

      {hover && tip && (
        <div
          className="pointer-events-none absolute z-20 w-56 rounded-xl bg-black text-white p-3 text-sm shadow-xl dark:bg-white dark:text-black"
          style={{
            left: Math.min(hover.x + 14, (wrapRef.current?.clientWidth ?? 0) - 230),
            top: hover.y + 14,
          }}
        >
          {tip}
        </div>
      )}
    </div>
  );
}

/** Country shapes, memoised so hover changes don't repaint 170+ paths. */
const Countries = React.memo(function Countries({
  fills,
  baseFill,
  strokeWidth,
}: {
  fills: Record<string, string>;
  baseFill: string;
  strokeWidth: number;
}) {
  return (
    <g stroke="var(--map-stroke)" strokeWidth={strokeWidth} strokeLinejoin="round">
      {WORLD_SHAPES.map((s) => (
        <path key={s.code} data-code={s.code} d={s.d} fill={fills[s.code] ?? baseFill} />
      ))}
    </g>
  );
});

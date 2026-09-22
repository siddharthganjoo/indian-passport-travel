'use client';

import * as React from 'react';
import { MonthlyFareTrend } from '@/types/visa';
import { formatInr } from '@/lib/utils';

interface FareSparklineProps {
  data: MonthlyFareTrend[];
  width?: number;
  height?: number;
}

export function FareSparkline({ data, width = 120, height = 36 }: FareSparklineProps) {
  const [hoveredPoint, setHoveredPoint] = React.useState<MonthlyFareTrend | null>(null);

  if (!data || data.length === 0) return null;

  const fares = data.map((d) => d.fareInr);
  const min = Math.min(...fares);
  const max = Math.max(...fares);
  const range = max - min || 1;

  // Calculate SVG path points
  const paddingX = 4;
  const paddingY = 4;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * innerWidth;
    const normalizedY = (d.fareInr - min) / range;
    const y = height - paddingY - normalizedY * innerHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;

  return (
    <div className="relative group inline-flex flex-col items-end">
      <svg
        width={width}
        height={height}
        className="overflow-visible"
        onMouseLeave={() => setHoveredPoint(null)}
      >
        <defs>
          <linearGradient id={`grad-sparkline-${min}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" className="text-zinc-900 dark:text-white" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" className="text-zinc-900 dark:text-white" />
          </linearGradient>
        </defs>

        {/* Gradient fill */}
        <path d={areaD} fill={`url(#grad-sparkline-${min})`} />

        {/* Trend line */}
        <path
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-zinc-900 dark:text-zinc-200"
        />

        {/* Interactive hover points */}
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={hoveredPoint?.month === p.month ? 3.5 : 0}
            className="fill-zinc-950 dark:fill-white stroke-white dark:stroke-zinc-900 stroke-2 transition-all"
          />
        ))}

        {/* Invisible hit areas */}
        {points.map((p, idx) => (
          <rect
            key={`hit-${idx}`}
            x={p.x - 5}
            y={0}
            width={10}
            height={height}
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={() => setHoveredPoint(p)}
          />
        ))}
      </svg>

      {/* Hover tooltip */}
      {hoveredPoint && (
        <div className="absolute -top-7 right-0 text-[10px] font-mono tracking-tight bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-20 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          {hoveredPoint.month}: {formatInr(hoveredPoint.fareInr)}
        </div>
      )}
    </div>
  );
}

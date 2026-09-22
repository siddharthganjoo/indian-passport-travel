'use client';

import * as React from 'react';
import { MonthlyFareTrend } from '@/types/visa';
import { formatInr } from '@/lib/utils';
import { TrendingDown, Calendar } from 'lucide-react';

interface FareTrendChartProps {
  data: MonthlyFareTrend[];
  countryName: string;
}

export function FareTrendChart({ data, countryName }: FareTrendChartProps) {
  const [activeIdx, setActiveIdx] = React.useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const fares = data.map((d) => d.fareInr);
  const minFare = Math.min(...fares);
  const maxFare = Math.max(...fares);
  const lowestMonth = data.find((d) => d.fareInr === minFare)?.month || data[0].month;

  const height = 180;
  const paddingY = 24;
  const paddingX = 24;
  const viewBoxWidth = 600;
  const innerWidth = viewBoxWidth - paddingX * 2;
  const innerHeight = height - paddingY * 2;
  const range = maxFare - minFare || 1;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * innerWidth;
    const normalizedY = (d.fareInr - minFare) / range;
    const y = height - paddingY - normalizedY * innerHeight;
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;

  const activePoint = activeIdx !== null ? points[activeIdx] : null;

  return (
    <div className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <Calendar className="w-3.5 h-3.5" />
            12-Month Fare Trend (From Indian Hubs)
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-white mt-1">
            Lowest Flight Prices to {countryName}
          </h3>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium border border-emerald-500/20 self-start sm:self-auto">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Cheapest in <strong>{lowestMonth}</strong> from {formatInr(minFare)}</span>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${height}`}
          className="w-full h-44 overflow-visible"
          onMouseLeave={() => setActiveIdx(null)}
        >
          <defs>
            <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#09090b" stopOpacity="0.18" className="dark:stop-color-white" />
              <stop offset="100%" stopColor="#09090b" stopOpacity="0.0" className="dark:stop-color-white" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={viewBoxWidth - paddingX}
            y2={paddingY}
            stroke="currentColor"
            strokeDasharray="4 4"
            className="text-zinc-200 dark:text-zinc-800"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={viewBoxWidth - paddingX}
            y2={height - paddingY}
            stroke="currentColor"
            strokeDasharray="4 4"
            className="text-zinc-200 dark:text-zinc-800"
          />

          {/* Area fill */}
          <path d={areaD} fill="url(#chartAreaGrad)" />

          {/* Line stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-zinc-900 dark:text-zinc-100"
          />

          {/* Interactive Active Column Cursor */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={paddingY}
              x2={activePoint.x}
              y2={height - paddingY}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="text-zinc-400 dark:text-zinc-600"
            />
          )}

          {/* Data Points */}
          {points.map((p, i) => {
            const isLowest = p.fareInr === minFare;
            const isActive = activeIdx === i;

            return (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isLowest || isActive ? 4.5 : 2.5}
                  className={
                    isLowest
                      ? 'fill-emerald-500 stroke-white dark:stroke-zinc-900 stroke-2'
                      : isActive
                      ? 'fill-zinc-950 dark:fill-white stroke-white dark:stroke-zinc-900 stroke-2'
                      : 'fill-zinc-400 dark:fill-zinc-600'
                  }
                />
                {/* Hit Box */}
                <rect
                  x={p.x - innerWidth / (data.length * 2)}
                  y={0}
                  width={innerWidth / data.length}
                  height={height}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveIdx(i)}
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Box */}
        {activePoint && (
          <div
            className="absolute -top-3 pointer-events-none transform -translate-x-1/2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-3 py-1.5 rounded-lg shadow-lg text-xs font-medium z-30 transition-all"
            style={{
              left: `${(activePoint.x / viewBoxWidth) * 100}%`,
            }}
          >
            <div className="font-semibold">{activePoint.month}</div>
            <div className="font-mono text-zinc-300 dark:text-zinc-600">{formatInr(activePoint.fareInr)}</div>
          </div>
        )}
      </div>

      {/* Month Labels Bar */}
      <div className="grid grid-cols-12 gap-1 text-center pt-2 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
        {data.map((d, i) => (
          <div
            key={i}
            className={`py-1 rounded ${
              d.fareInr === minFare
                ? 'font-bold text-emerald-600 dark:text-emerald-400'
                : activeIdx === i
                ? 'text-zinc-900 dark:text-white font-semibold'
                : ''
            }`}
          >
            {d.month}
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import type { BaseVisaCategory, HeldVisa } from '@/types/visa';
import { WorldMap } from '@/components/maps/world-map';
import { EASE_FILL, cn, flagEmoji, formatInr, getVisaCategoryLabel } from '@/lib/utils';

export interface ResolvedCountry {
  code: string;
  name: string;
  category: BaseVisaCategory;
  stayDays: number;
  feeInr: number;
  upgradeSource?: HeldVisa;
}

const ORDER: BaseVisaCategory[] = ['visa_free', 'voa', 'evisa', 'sticker_required'];

/**
 * Choropleth of how easily an Indian passport gets into each country, with a
 * proportion bar that doubles as the legend. Click a country for its guide.
 */
export function VisaMap({ countries, variant = 'light' }: { countries: ResolvedCountry[]; variant?: 'light' | 'dark' }) {
  const byCode = React.useMemo(() => new Map(countries.map((c) => [c.code, c])), [countries]);
  const fills = React.useMemo(() => {
    const f: Record<string, string> = { IN: 'var(--map-home)' };
    for (const c of countries) f[c.code] = EASE_FILL[c.category];
    return f;
  }, [countries]);

  const counts = ORDER.map((cat) => ({ cat, n: countries.filter((c) => c.category === cat).length }));
  const easy = counts.slice(0, 3).reduce((s, c) => s + c.n, 0);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <span className={cn('font-display text-3xl font-bold tracking-tight mr-2', variant === 'dark' ? 'text-white' : 'text-zinc-900 dark:text-white')}>
            {easy}
          </span>
          countries without an embassy visa
        </p>
        <ProportionBar counts={counts} total={countries.length} />
      </div>

      <WorldMap
        label={`World map: ${counts.map((c) => `${c.n} ${getVisaCategoryLabel(c.cat)}`).join(', ')} for Indian passport holders. India shown in solid colour.`}
        fills={fills}
        tooltip={(code) => {
          if (code === 'IN') return <span className="font-medium">India — you start here</span>;
          const c = byCode.get(code);
          if (!c) return null;
          return (
            <div className="space-y-1">
              <div className="font-medium">
                <span aria-hidden>{flagEmoji(code)}</span> {c.name}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: EASE_FILL[c.category] }} aria-hidden />
                {getVisaCategoryLabel(c.category)}
                {c.upgradeSource && <span className="opacity-70">· with {c.upgradeSource} visa</span>}
              </div>
              <div className="opacity-70">
                {c.stayDays} days · {c.feeInr ? formatInr(c.feeInr) : 'free'}
              </div>
            </div>
          );
        }}
        href={(code) => (byCode.has(code) ? `/destination/${code}` : null)}
      />
    </div>
  );
}

function ProportionBar({ counts, total }: { counts: { cat: BaseVisaCategory; n: number }[]; total: number }) {
  return (
    <div>
      <div className="flex h-3 gap-[2px]" aria-hidden>
        {counts.map(({ cat, n }, i) => (
          <div
            key={cat}
            className={cn(i === 0 && 'rounded-l-full', i === counts.length - 1 && 'rounded-r-full')}
            style={{ flexGrow: n, flexBasis: 0, background: EASE_FILL[cat] }}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
        {counts.map(({ cat, n }) => (
          <li key={cat} className="inline-flex items-center gap-2">
            <span
              className={cn('w-2.5 h-2.5 rounded-full', cat === 'sticker_required' && 'ring-1 ring-inset ring-zinc-400 dark:ring-zinc-500')}
              style={{ background: EASE_FILL[cat] }}
              aria-hidden
            />
            <span>{getVisaCategoryLabel(cat)}</span>
            <span className="tabular-nums text-zinc-500">
              {n}
              <span className="sr-only"> of {total}</span>
            </span>
          </li>
        ))}
        <li className="inline-flex items-center gap-2 text-zinc-500">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--map-home)' }} aria-hidden />
          India
        </li>
      </ul>
    </div>
  );
}

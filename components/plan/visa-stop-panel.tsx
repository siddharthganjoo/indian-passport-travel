'use client';

import * as React from 'react';
import { ChevronDown, ExternalLink, AlertTriangle } from 'lucide-react';
import type { VisaStop } from '@/types/plan';
import { cn, flagEmoji, formatDay, formatInr, visaCategoryDot } from '@/lib/utils';
import { formatProcessing } from '@/lib/visa-engine';

/** What a traveller needs for one country on the route: fee, timing, documents, steps. */
export function VisaStopPanel({ stop, defaultOpen }: { stop: VisaStop; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(!!defaultOpen);
  const needsAction = stop.requirement !== 'airside_ok' && stop.requirement !== 'visa_free';
  const hasDetail = stop.documents.length > 0 || stop.steps.length > 0;

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        disabled={!hasDetail}
        className="w-full flex items-start gap-3 p-3 text-left"
      >
        <span className="text-xl leading-none mt-0.5" aria-hidden>{flagEmoji(stop.countryCode)}</span>
        <span className="flex-1 min-w-0">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-medium">{stop.countryName}</span>
            <span className="text-xs text-zinc-500">{stop.role === 'transit' ? `Stopover${stop.airport ? ` · ${stop.airport}` : ''}` : 'Destination'}</span>
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <span className={cn('w-2 h-2 rounded-full', visaCategoryDot(stop.requirement))} aria-hidden />
              {stop.label}
            </span>
            <span>{stop.feeInr > 0 ? formatInr(stop.feeInr) : 'Free'}</span>
            {needsAction && stop.processingDays.max > 0 && <span>{formatProcessing(stop.processingDays)} to process</span>}
            {stop.applyBy && (
              <span className={cn('font-medium', stop.blocked ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-white')}>
                Apply by {formatDay(stop.applyBy)}
              </span>
            )}
          </span>
          {stop.blocked && (
            <span className="mt-2 flex items-start gap-1.5 text-sm text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
              Takes at least {stop.processingDays.min} days — not enough time before this departure date.
            </span>
          )}
          {stop.notes && <span className="mt-2 block text-sm text-zinc-600 dark:text-zinc-400">{stop.notes}</span>}
          {stop.unverified && (
            <span className="mt-1 block text-xs text-amber-700 dark:text-amber-400">
              {stop.researchedAt
                ? `Researched ${formatDay(stop.researchedAt)}, not yet checked by our team — confirm on the official site.`
                : 'Not yet verified by our team — confirm on the official site.'}
            </span>
          )}
        </span>
        {hasDetail && (
          <ChevronDown className={cn('w-4 h-4 mt-1 shrink-0 text-zinc-400 transition-transform', open && 'rotate-180')} aria-hidden />
        )}
      </button>

      {open && hasDetail && (
        <div className="px-3 pb-4 pt-1 grid gap-5 sm:grid-cols-2 border-t border-zinc-100 dark:border-zinc-800">
          {stop.steps.length > 0 && (
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500 mt-3 mb-2">How to get it</h4>
              <ol className="space-y-2 text-sm list-decimal pl-4 marker:text-zinc-400">
                {stop.steps.map((s, i) => (
                  <li key={i} className="pl-1">{s}</li>
                ))}
              </ol>
            </div>
          )}
          {stop.documents.length > 0 && (
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500 mt-3 mb-2">Documents</h4>
              <ul className="space-y-2 text-sm">
                {stop.documents.map((d, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2 w-1 h-1 rounded-full bg-zinc-400 shrink-0" aria-hidden />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {stop.officialUrl && (
            <a
              href={stop.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:col-span-2 inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-900 dark:decoration-zinc-600 dark:hover:decoration-white w-fit"
            >
              Official website <ExternalLink className="w-3.5 h-3.5" aria-hidden />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

import { ExternalLink } from 'lucide-react';
import type { ResearchRecord } from '@/types/visa';
import { verificationStatus } from '@/lib/visa-engine';
import { cn, formatDay } from '@/lib/utils';

const CONFIDENCE: Record<ResearchRecord['confidence'], string> = {
  high: 'High confidence',
  medium: 'Medium confidence',
  low: 'Low confidence',
};

/**
 * How trustworthy a record is: human-verified (best), researched with sources,
 * or neither. Sources are listed so travellers can check for themselves.
 */
export function DataStatus({ lastVerifiedAt, research }: { lastVerifiedAt?: string | null; research?: ResearchRecord }) {
  const status = verificationStatus(lastVerifiedAt);

  const headline =
    status === 'verified'
      ? `Checked by our team on ${formatDay(lastVerifiedAt!)}`
      : status === 'stale'
        ? `Last checked ${formatDay(lastVerifiedAt!)} — may be out of date`
        : research
          ? `Researched ${formatDay(research.checkedAt)} · not yet checked by our team`
          : 'Not yet verified — confirm on the official website';

  return (
    <div className="text-sm space-y-2">
      <p className={cn(status === 'verified' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400')}>
        {headline}
        {research && status !== 'verified' && <span className="text-zinc-500"> · {CONFIDENCE[research.confidence]}</span>}
      </p>
      {research && (
        <details className="group max-w-3xl">
          <summary className="cursor-pointer text-zinc-600 dark:text-zinc-400 underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-600 w-fit list-none [&::-webkit-details-marker]:hidden">
            What we checked and sources ({research.sources.length})
          </summary>
          <div className="mt-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 p-4 space-y-3">
            <p className="text-zinc-700 dark:text-zinc-300">{research.summary}</p>
            <ul className="space-y-1.5">
              {research.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-1.5 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </details>
      )}
    </div>
  );
}

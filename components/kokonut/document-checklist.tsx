'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentChecklistProps {
  documents: string[];
  countryName: string;
}

/** Tick-off list of documents; progress is remembered in this browser only. */
export function DocumentChecklist({ documents, countryName }: DocumentChecklistProps) {
  const storageKey = `docs:${countryName}`;
  const [checked, setChecked] = React.useState<Record<number, boolean>>({});

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setChecked(JSON.parse(saved));
    } catch {
      // storage unavailable — checklist still works for this visit
    }
  }, [storageKey]);

  const toggle = (idx: number) =>
    setChecked((prev) => {
      const next = { ...prev, [idx]: !prev[idx] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

  const done = documents.filter((_, i) => checked[i]).length;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Documents</h2>
        <span className="text-sm text-zinc-500 tabular-nums">
          {done} of {documents.length} ready
        </span>
      </div>
      <ul className="space-y-1">
        {documents.map((doc, idx) => (
          <li key={idx}>
            <button
              type="button"
              role="checkbox"
              aria-checked={!!checked[idx]}
              onClick={() => toggle(idx)}
              className="w-full flex items-start gap-3 py-2 text-left text-sm"
            >
              <span
                className={cn(
                  'mt-0.5 w-5 h-5 rounded-md border grid place-items-center shrink-0 transition-colors',
                  checked[idx]
                    ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-900'
                    : 'border-zinc-300 dark:border-zinc-600'
                )}
              >
                {checked[idx] && <Check className="w-3 h-3" strokeWidth={3} aria-hidden />}
              </span>
              <span className={cn('leading-relaxed', checked[idx] && 'text-zinc-400 line-through')}>{doc}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

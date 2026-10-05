'use client';

import { Check } from 'lucide-react';
import { HELD_VISAS, type HeldVisa } from '@/types/visa';
import { cn } from '@/lib/utils';

const LABELS: Record<HeldVisa, string> = { US: 'US visa', UK: 'UK visa', Schengen: 'Schengen visa' };

/** Toggle chips for "I already hold a valid …" — these unlock easier entry in many countries. */
export function HeldVisaChips({ value, onChange }: { value: HeldVisa[]; onChange: (v: HeldVisa[]) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Visas you already hold">
      <span className="text-sm text-zinc-500 dark:text-zinc-400 mr-1">I hold a valid</span>
      {HELD_VISAS.map((v) => {
        const on = value.includes(v);
        return (
          <button
            key={v}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((x) => x !== v) : [...value, v])}
            className={cn(
              'inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-sm transition-colors',
              on
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                : 'border-zinc-300 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300'
            )}
          >
            {on && <Check className="w-3.5 h-3.5" aria-hidden />}
            {LABELS[v]}
          </button>
        );
      })}
    </div>
  );
}

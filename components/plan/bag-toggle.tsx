'use client';

import { Briefcase, Luggage } from 'lucide-react';
import type { BagMode } from '@/types/plan';
import { cn } from '@/lib/utils';

const OPTIONS: { mode: BagMode; label: string; icon: typeof Briefcase }[] = [
  { mode: 'cabin', label: 'Cabin bag only', icon: Briefcase },
  { mode: 'checked', label: 'With checked bag', icon: Luggage },
];

export function BagToggle({ value, onChange, size = 'md' }: { value: BagMode; onChange: (m: BagMode) => void; size?: 'sm' | 'md' }) {
  return (
    <div
      role="radiogroup"
      aria-label="Baggage"
      className="inline-flex p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
    >
      {OPTIONS.map(({ mode, label, icon: Icon }) => (
        <button
          key={mode}
          type="button"
          role="radio"
          aria-checked={value === mode}
          onClick={() => onChange(mode)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md font-medium transition-colors',
            size === 'sm' ? 'h-8 px-3 text-sm' : 'h-9 px-3.5 text-sm',
            value === mode
              ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
          )}
        >
          <Icon className="w-4 h-4" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}

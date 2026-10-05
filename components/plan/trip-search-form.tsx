'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import type { TripSearchValues } from '@/types/plan';
import { CountryCombobox, type CountryOption } from './country-combobox';
import { HeldVisaChips } from './held-visa-chips';
import { BagToggle } from './bag-toggle';
import { buildPlanUrl, cn } from '@/lib/utils';

export interface OriginOption {
  iata: string;
  city: string;
}

export type { TripSearchValues };

interface Props {
  countries: CountryOption[];
  origins: OriginOption[];
  initial: TripSearchValues;
  minDate: string;
  compact?: boolean;
}

const label = 'block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5';
const field =
  'w-full h-12 px-3 rounded-lg border-2 border-transparent bg-zinc-100 text-base font-medium focus:bg-white focus:border-black focus:outline-none dark:bg-zinc-800 dark:focus:bg-zinc-900 dark:focus:border-white';

export function TripSearchForm({ countries, origins, initial, minDate, compact }: Props) {
  const router = useRouter();
  const [values, setValues] = React.useState(initial);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();
  const set = <K extends keyof TripSearchValues>(key: K, v: TripSearchValues[K]) => setValues((s) => ({ ...s, [key]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.to) return setError('Choose where you want to go.');
    if (!values.date || values.date < minDate) return setError('Choose a travel date from today onwards.');
    setError(null);
    startTransition(() => router.push(buildPlanUrl(values)));
  };

  return (
    <form
      onSubmit={submit}
      className={cn(
        'rounded-2xl bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100',
        compact ? 'p-3 sm:p-4 border border-zinc-200 dark:border-zinc-800' : 'p-4 sm:p-6 shadow-2xl dark:border dark:border-zinc-800'
      )}
      aria-label="Plan a trip"
    >
      <div className="grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_auto] sm:items-end">
        <div>
          <label htmlFor="from" className={label}>From</label>
          <select id="from" value={values.from} onChange={(e) => set('from', e.target.value)} className={field}>
            {origins.map((o) => (
              <option key={o.iata} value={o.iata}>
                {o.city} ({o.iata})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="to" className={label}>To</label>
          <CountryCombobox id="to" countries={countries} value={values.to} onChange={(c) => set('to', c)} invalid={!!error && !values.to} />
        </div>
        <div>
          <label htmlFor="date" className={label}>Depart</label>
          <input id="date" type="date" min={minDate} value={values.date} onChange={(e) => set('date', e.target.value)} className={field} />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="h-12 px-7 rounded-lg bg-black text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-70 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {pending ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : null}
          {pending ? 'Searching' : 'Search'}
          {!pending && <ArrowRight className="w-4 h-4" aria-hidden />}
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <BagToggle value={values.bags} onChange={(b) => set('bags', b)} size="sm" />
        <HeldVisaChips value={values.visas} onChange={(v) => set('visas', v)} />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </form>
  );
}

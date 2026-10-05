import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TripSearchForm, type TripSearchValues } from '@/components/plan/trip-search-form';
import { PlanView } from '@/components/plan/plan-view';
import { getSearchOptions } from '@/lib/search-options';
import { planQuerySchema, formatZodError, type PlanSearchParams } from '@/lib/schemas';
import { runPlan, toPlanQuery } from '@/lib/plan';
import { PlanError } from '@/lib/route-engine';
import type { HeldVisa } from '@/types/visa';

export const metadata: Metadata = {
  title: 'Compare routes',
  robots: { index: false },
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PlanPage({ searchParams }: PageProps) {
  const raw = Object.fromEntries(
    Object.entries(await searchParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]).filter(([, v]) => v !== undefined)
  );
  const options = await getSearchOptions();
  const parsed = planQuerySchema.safeParse(raw);

  const initial: TripSearchValues = parsed.success
    ? { from: parsed.data.from, to: parsed.data.to, date: parsed.data.date, bags: parsed.data.bags, visas: parsed.data.visas as HeldVisa[] }
    : { from: 'DEL', to: '', date: options.defaultDate, bags: 'cabin', visas: [] };

  return (
    <div className="space-y-8">
      <TripSearchForm
        key={JSON.stringify(initial)}
        countries={options.countries}
        origins={options.origins}
        minDate={options.minDate}
        initial={initial}
        compact
      />
      {parsed.success ? (
        <Suspense key={JSON.stringify(parsed.data)} fallback={<ResultsSkeleton />}>
          <Results params={parsed.data} minDate={options.minDate} />
        </Suspense>
      ) : (
        Object.keys(raw).length > 0 && (
          <p className="text-sm text-rose-600 dark:text-rose-400">Please check your search: {formatZodError(parsed.error)}</p>
        )
      )}
    </div>
  );
}

async function Results({ params, minDate }: { params: PlanSearchParams; minDate: string }) {
  try {
    const result = await runPlan(toPlanQuery(params));
    return <PlanView result={result} initialMode={params.bags} minDate={minDate} />;
  } catch (err) {
    if (err instanceof PlanError) {
      return <p className="rounded-lg bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm">{err.message}</p>;
    }
    throw err;
  }
}

function ResultsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Finding routes">
      <div className="h-8 w-64 rounded bg-zinc-100 dark:bg-zinc-900" />
      <div className="h-16 rounded-lg bg-zinc-100 dark:bg-zinc-900" />
      <div className="h-56 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-36 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
      ))}
      <p className="text-sm text-zinc-500">Checking direct flights and routes via hubs…</p>
    </div>
  );
}

import type { Metadata } from 'next';
import { VisaExplorer } from '@/components/visa/visa-explorer';
import { getExplorerCountries } from '@/lib/explorer-data';
import type { BaseVisaCategory } from '@/types/visa';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Visa guide for Indian passport holders',
  description:
    'Visa-free, visa on arrival, eVisa and embassy visa rules for every country — and how a US, UK or Schengen visa makes entry easier.',
};

const CATEGORIES: BaseVisaCategory[] = ['visa_free', 'voa', 'evisa', 'sticker_required'];

export default async function VisasPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const countries = await getExplorerCountries();

  return (
    <div className="space-y-10">
      <div className="max-w-2xl space-y-3">
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">Where your passport takes you</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg">
          Entry rules for Indian passport holders in {countries.length} countries. Tick the visas you already hold — the map
          updates.
        </p>
      </div>
      <VisaExplorer
        countries={countries}
        initialCategory={CATEGORIES.includes(category as BaseVisaCategory) ? (category as BaseVisaCategory) : undefined}
      />
    </div>
  );
}

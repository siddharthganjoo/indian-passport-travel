import 'server-only';
import { getAllDestinations } from '@/lib/db';
import { INDIAN_ORIGIN_AIRPORTS } from '@/data/airports';
import { addDays } from '@/lib/geo';
import type { CountryOption } from '@/components/plan/country-combobox';
import type { OriginOption } from '@/components/plan/trip-search-form';

/** Today's date in India (travellers search in IST). */
export function todayIst(): string {
  return new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10);
}

export async function getSearchOptions(): Promise<{
  countries: CountryOption[];
  origins: OriginOption[];
  minDate: string;
  defaultDate: string;
}> {
  const destinations = await getAllDestinations();
  const today = todayIst();
  return {
    countries: destinations
      .map((d) => ({ code: d.countryCode, name: d.countryName, category: d.defaultCategory }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    origins: INDIAN_ORIGIN_AIRPORTS.map((a) => ({ iata: a.iata, city: a.city })),
    minDate: today,
    defaultDate: addDays(today, 30),
  };
}

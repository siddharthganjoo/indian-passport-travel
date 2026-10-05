import 'server-only';
import type { FareOffer, FareQuery, FlightProvider } from '@/types/flight';
import { getCachedData, setCachedData } from '@/lib/redis';
import { getFxRates } from '@/lib/fx-server';
import { sampleProvider } from './sample';
import { createTravelpayoutsProvider } from './travelpayouts';
import { createDuffelProvider } from './duffel';

const CACHE_TTL: Record<FlightProvider['name'], number> = {
  travelpayouts: 6 * 60 * 60,
  duffel: 30 * 60,
  sample: 24 * 60 * 60,
};

/** Wide, cheap scanning of many legs: Travelpayouts when configured, else sample data. */
export function getScanProvider(): FlightProvider {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  return token ? createTravelpayoutsProvider(token, process.env.TRAVELPAYOUTS_MARKER) : sampleProvider;
}

/** Live confirmation of a specific leg with exact bags, when Duffel is configured. */
export function getLiveProvider(): FlightProvider | null {
  const token = process.env.DUFFEL_API_TOKEN;
  return token ? createDuffelProvider(token, getFxRates) : null;
}

/** Cached search. Provider failures are logged and return [] so one bad leg never breaks a plan. */
export async function searchFares(provider: FlightProvider, q: FareQuery): Promise<FareOffer[]> {
  const key = `fares:v2:${provider.name}:${q.from}:${q.to}:${q.date}:${q.adults}`;
  const cached = await getCachedData<FareOffer[]>(key);
  if (cached) return cached;
  try {
    const offers = await provider.search(q);
    await setCachedData(key, offers, CACHE_TTL[provider.name]);
    return offers;
  } catch (err) {
    console.error(`[flights] ${provider.name} ${q.from}->${q.to} ${q.date} failed:`, err);
    return [];
  }
}

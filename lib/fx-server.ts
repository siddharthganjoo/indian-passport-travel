import 'server-only';
import { getCachedData, setCachedData } from '@/lib/redis';
import { FALLBACK_RATES, type FxRates } from '@/lib/fx';

const CACHE_KEY = 'fx:inr:v1';
const TTL_SECONDS = 12 * 60 * 60;

/** Server-only: current rates (cached). Never throws. */
export async function getFxRates(): Promise<FxRates> {
  const cached = await getCachedData<FxRates>(CACHE_KEY);
  if (cached) return cached;

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/INR', { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = (await res.json()) as { result?: string; rates?: Record<string, number> };
    if (body.result !== 'success' || !body.rates) throw new Error('unexpected response');
    const toInr: Record<string, number> = {};
    for (const [currency, perInr] of Object.entries(body.rates)) {
      if (perInr > 0) toInr[currency] = 1 / perInr;
    }
    const rates: FxRates = { toInr, fetchedAt: new Date().toISOString(), live: true };
    await setCachedData(CACHE_KEY, rates, TTL_SECONDS);
    return rates;
  } catch (err) {
    console.warn('FX rates unavailable, using fallback:', err);
    await setCachedData(CACHE_KEY, FALLBACK_RATES, 15 * 60);
    return FALLBACK_RATES;
  }
}

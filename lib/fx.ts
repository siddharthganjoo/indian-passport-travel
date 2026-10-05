/**
 * Currency conversion to INR (safe for client and server). Live rates are
 * fetched server-side by lib/fx-server.ts; when unavailable we fall back to a
 * fixed USD rate (overridable with FX_USD_INR).
 */
export const DEFAULT_USD_INR = Number(process.env.FX_USD_INR) || 88;

export interface FxRates {
  /** INR per 1 unit of currency, e.g. { USD: 88, EUR: 95 }. */
  toInr: Record<string, number>;
  fetchedAt: string;
  live: boolean;
}

export const FALLBACK_RATES: FxRates = { toInr: { INR: 1, USD: DEFAULT_USD_INR }, fetchedAt: new Date(0).toISOString(), live: false };

export function usdToInr(usd: number, rates: FxRates = FALLBACK_RATES): number {
  return Math.round(usd * (rates.toInr.USD ?? DEFAULT_USD_INR));
}

export function convertToInr(amount: number, currency: string, rates: FxRates): number | null {
  const rate = rates.toInr[currency.toUpperCase()];
  return rate ? Math.round(amount * rate) : null;
}

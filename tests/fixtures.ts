import type { CountryVisaProfile } from '@/types/visa';
import type { SmartRouteHack, TransitHubProfile } from '@/types/routes';
import type { FareOffer } from '@/types/flight';
import countriesJson from '@/data/destinations.json';
import hubsJson from '@/data/transit-hubs.json';
import routesJson from '@/data/smart-routes.json';
import { getAirport, instantToIso, localToIso } from '@/lib/geo';

export const COUNTRIES = countriesJson as CountryVisaProfile[];
export const HUBS = hubsJson as TransitHubProfile[];
export const ROUTES = routesJson as SmartRouteHack[];

export const country = (code: string) => COUNTRIES.find((c) => c.countryCode === code)!;

let seq = 0;

/** Build a fare offer departing at local wall time `depart` (YYYY-MM-DDTHH:MM) at `from`. */
export function offer(
  from: string,
  to: string,
  depart: string,
  durationMinutes: number,
  priceInr: number,
  opts: { carrier?: string; checked?: number | null; via?: string[] } = {}
): FareOffer {
  const a = getAirport(from)!;
  const b = getAirport(to)!;
  const departAt = localToIso(depart, a.tz);
  const arriveAt = instantToIso(Date.parse(departAt) + durationMinutes * 60_000, b.tz);
  const carrier = opts.carrier ?? 'XX';
  return {
    id: `t${++seq}`,
    from,
    to,
    priceInr,
    carrierCode: carrier,
    carrierName: carrier,
    stops: opts.via?.length ?? 0,
    via: opts.via ?? [],
    departAt,
    arriveAt,
    durationMinutes,
    segments: [],
    baggage: { cabinKg: 7, checkedPieces: opts.checked === undefined ? 1 : opts.checked, basis: 'fare' },
    deepLink: 'https://example.test',
    source: 'sample',
    fetchedAt: '2026-10-05T00:00:00Z',
  };
}

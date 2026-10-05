import type { FareOffer, FareQuery, FlightProvider } from '@/types/flight';
import { getAirline } from '@/data/airlines';
import { getAirport, instantToIso } from '@/lib/geo';

/**
 * Travelpayouts (Aviasales) Data API — cached cheapest prices found by
 * Aviasales users in the last few days. Cheap to call, so it's used to scan
 * many legs. Prices can be slightly stale; bags are not reported, so we use
 * the airline's typical policy.
 *
 * Docs: https://support.travelpayouts.com/hc/en-us/articles/203956163
 */
const ENDPOINT = 'https://api.travelpayouts.com/aviasales/v3/prices_for_dates';

interface TpItem {
  origin: string;
  destination: string;
  origin_airport: string;
  destination_airport: string;
  price: number;
  airline: string;
  flight_number: string | number;
  departure_at: string;
  transfers: number;
  duration_to?: number;
  duration?: number;
  link: string;
}

export function mapTravelpayoutsItem(item: TpItem, q: FareQuery, marker: string | undefined, fetchedAt: string, idx: number): FareOffer | null {
  const from = getAirport(item.origin_airport) ?? getAirport(q.from);
  const to = getAirport(item.destination_airport) ?? getAirport(q.to);
  const minutes = item.duration_to ?? item.duration;
  if (!from || !to || !minutes || !item.departure_at) return null;

  const departMs = Date.parse(item.departure_at);
  const departAt = instantToIso(departMs, from.tz);
  const arriveAt = instantToIso(departMs + minutes * 60_000, to.tz);
  const airline = getAirline(item.airline);
  const sep = item.link.includes('?') ? '&' : '?';

  return {
    id: `tp-${from.iata}-${to.iata}-${item.departure_at}-${item.airline}${item.flight_number}-${idx}`,
    from: from.iata,
    to: to.iata,
    priceInr: Math.round(item.price),
    carrierCode: item.airline,
    carrierName: airline?.name ?? item.airline,
    stops: item.transfers,
    via: [],
    departAt,
    arriveAt,
    durationMinutes: minutes,
    segments: [
      {
        carrierCode: item.airline,
        carrierName: airline?.name ?? item.airline,
        flightNumber: `${item.airline}${item.flight_number}`,
        from: from.iata,
        to: to.iata,
        departAt,
        arriveAt,
        durationMinutes: minutes,
      },
    ],
    baggage: {
      cabinKg: airline?.cabinKg ?? 7,
      checkedPieces: airline ? airline.checkedPieces : null,
      basis: 'airline_policy',
    },
    deepLink: `https://www.aviasales.com${item.link}${marker ? `${sep}marker=${encodeURIComponent(marker)}` : ''}`,
    source: 'travelpayouts',
    fetchedAt,
  };
}

export function createTravelpayoutsProvider(token: string, marker?: string): FlightProvider {
  return {
    name: 'travelpayouts',
    async search(q) {
      const origin = getAirport(q.from)?.metro ?? q.from;
      const destination = getAirport(q.to)?.metro ?? q.to;
      const params = new URLSearchParams({
        origin,
        destination,
        departure_at: q.date,
        one_way: 'true',
        direct: 'false',
        sorting: 'price',
        limit: '15',
        currency: 'inr',
        market: 'in',
        token,
      });
      const res = await fetch(`${ENDPOINT}?${params}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`Travelpayouts HTTP ${res.status}`);
      const body = (await res.json()) as { success: boolean; data?: TpItem[]; error?: string };
      if (!body.success) throw new Error(`Travelpayouts error: ${body.error ?? 'unknown'}`);
      const fetchedAt = new Date().toISOString();
      return (body.data ?? [])
        .map((item, i) => mapTravelpayoutsItem(item, q, marker, fetchedAt, i))
        .filter((o): o is FareOffer => o !== null);
    },
  };
}

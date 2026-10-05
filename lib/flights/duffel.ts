import type { FareOffer, FareQuery, FlightProvider, FlightSegment } from '@/types/flight';
import { getAirport, localToIso } from '@/lib/geo';
import { convertToInr, type FxRates } from '@/lib/fx';

/**
 * Duffel offer requests — live, bookable prices with exact baggage
 * allowances. Duffel bills for excess searches relative to bookings, so we
 * only call it when a traveller asks to confirm a specific leg.
 *
 * Docs: https://duffel.com/docs/api/v2/offer-requests/create-offer-request
 */
const ENDPOINT = 'https://api.duffel.com/air/offer_requests?return_offers=true&supplier_timeout=15000';

interface DuffelPlace {
  iata_code: string;
  time_zone?: string;
}
interface DuffelSegment {
  origin: DuffelPlace;
  destination: DuffelPlace;
  departing_at: string; // local, no offset
  arriving_at: string;
  duration?: string; // ISO 8601 e.g. PT5H30M
  marketing_carrier: { iata_code: string; name: string };
  marketing_carrier_flight_number: string;
  passengers?: { baggages?: { type: 'checked' | 'carry_on'; quantity: number }[] }[];
}
interface DuffelOffer {
  id: string;
  total_amount: string;
  total_currency: string;
  owner: { iata_code: string; name: string };
  slices: { segments: DuffelSegment[]; duration?: string }[];
}

export function parseIsoDuration(d: string | undefined): number | null {
  const m = d?.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return null;
  return Number(m[1] ?? 0) * 1440 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

const tzOf = (place: DuffelPlace) => place.time_zone ?? getAirport(place.iata_code)?.tz ?? 'UTC';

export function mapDuffelOffer(offer: DuffelOffer, q: FareQuery, rates: FxRates, fetchedAt: string): FareOffer | null {
  const slice = offer.slices[0];
  if (!slice?.segments.length) return null;
  const total = convertToInr(Number(offer.total_amount), offer.total_currency, rates);
  if (total === null) return null;

  const segments: FlightSegment[] = slice.segments.map((s) => {
    const departAt = localToIso(s.departing_at, tzOf(s.origin));
    const arriveAt = localToIso(s.arriving_at, tzOf(s.destination));
    return {
      carrierCode: s.marketing_carrier.iata_code,
      carrierName: s.marketing_carrier.name,
      flightNumber: `${s.marketing_carrier.iata_code}${s.marketing_carrier_flight_number}`,
      from: s.origin.iata_code,
      to: s.destination.iata_code,
      departAt,
      arriveAt,
      durationMinutes: parseIsoDuration(s.duration) ?? Math.round((Date.parse(arriveAt) - Date.parse(departAt)) / 60_000),
    };
  });

  // The tightest allowance across segments is what the traveller actually gets.
  const bagsPerSegment = slice.segments.map((s) => s.passengers?.[0]?.baggages ?? []);
  const checked = Math.min(...bagsPerSegment.map((b) => b.find((x) => x.type === 'checked')?.quantity ?? 0));
  const first = segments[0];
  const last = segments[segments.length - 1];

  return {
    id: `duffel-${offer.id}`,
    from: first.from,
    to: last.to,
    priceInr: Math.round(total / Math.max(1, q.adults)),
    carrierCode: offer.owner.iata_code,
    carrierName: offer.owner.name,
    stops: segments.length - 1,
    via: segments.slice(1).map((s) => s.from),
    departAt: first.departAt,
    arriveAt: last.arriveAt,
    durationMinutes: parseIsoDuration(slice.duration) ?? Math.round((Date.parse(last.arriveAt) - Date.parse(first.departAt)) / 60_000),
    segments,
    baggage: { cabinKg: null, checkedPieces: checked, basis: 'fare' },
    deepLink: `https://www.google.com/travel/flights?q=${encodeURIComponent(`flights from ${first.from} to ${last.to} on ${q.date}`)}`,
    source: 'duffel',
    fetchedAt,
  };
}

export function createDuffelProvider(token: string, getRates: () => Promise<FxRates>): FlightProvider {
  return {
    name: 'duffel',
    async search(q) {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Duffel-Version': 'v2',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          data: {
            slices: [{ origin: q.from, destination: q.to, departure_date: q.date }],
            passengers: Array.from({ length: Math.max(1, q.adults) }, () => ({ type: 'adult' })),
            cabin_class: 'economy',
            max_connections: 1,
          },
        }),
        signal: AbortSignal.timeout(25_000),
      });
      if (!res.ok) throw new Error(`Duffel HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const body = (await res.json()) as { data?: { offers?: DuffelOffer[] } };
      const rates = await getRates();
      const fetchedAt = new Date().toISOString();
      return (body.data?.offers ?? [])
        .map((o) => mapDuffelOffer(o, q, rates, fetchedAt))
        .filter((o): o is FareOffer => o !== null)
        .sort((a, b) => a.priceInr - b.priceInr)
        .slice(0, 10);
    },
  };
}

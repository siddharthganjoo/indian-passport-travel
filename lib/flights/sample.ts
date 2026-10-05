import type { FareOffer, FareQuery, FlightProvider, FlightSegment } from '@/types/flight';
import { AIRLINES, getAirline, type AirlineInfo } from '@/data/airlines';
import { distanceKm, getAirport, instantToIso, localToIso } from '@/lib/geo';

/**
 * Deterministic sample fares for development and demos when no price API is
 * configured. Prices scale with distance, carrier type, market thinness and
 * booking window — realistic in shape, NOT real prices. Every offer is tagged
 * source: 'sample' and the UI labels it as such.
 */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: string) {
  let x = hash(seed) || 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) % 10_000) / 10_000;
  };
}

/** Thin markets (few competing carriers) price higher per km. */
const THIN_MARKETS = new Set(['BR', 'AR', 'PE', 'CO', 'CL', 'EC', 'BO', 'PY', 'UY', 'VE', 'MX', 'IS', 'NZ', 'FJ', 'MG', 'AO', 'NA', 'BW']);

function baseFare(km: number): number {
  return 1500 + 4.2 * Math.min(km, 2500) + 2.6 * Math.max(0, Math.min(km, 7000) - 2500) + 1.6 * Math.max(0, km - 7000);
}

function bookingWindowFactor(date: string, today = new Date()): number {
  const days = (Date.parse(`${date}T00:00:00Z`) - today.getTime()) / 86_400_000;
  const dow = new Date(`${date}T00:00:00Z`).getUTCDay();
  const window = days < 7 ? 1.35 : days < 21 ? 1.15 : days > 60 ? 0.95 : 1;
  const weekend = dow === 5 || dow === 0 ? 1.06 : 1;
  return window * weekend;
}

const flightMinutes = (km: number) => Math.round(km / 13.5 + 35);
const SLOTS = ['01:40', '06:15', '09:30', '13:05', '17:45', '21:20', '23:55'];

function carriersFor(from: string, to: string): AirlineInfo[] {
  const touching = AIRLINES.filter((a) => a.hubs.includes(from) || a.hubs.includes(to));
  return touching.length ? touching : [getAirline('AI')!];
}

function segment(carrier: AirlineInfo, from: string, to: string, departMs: number, r: () => number): FlightSegment {
  const a = getAirport(from)!;
  const b = getAirport(to)!;
  const minutes = flightMinutes(distanceKm(a, b));
  return {
    carrierCode: carrier.code,
    carrierName: carrier.name,
    flightNumber: `${carrier.code}${100 + Math.floor(r() * 899)}`,
    from,
    to,
    departAt: instantToIso(departMs, a.tz),
    arriveAt: instantToIso(departMs + minutes * 60_000, b.tz),
    durationMinutes: minutes,
  };
}

function skyscannerLink(from: string, to: string, date: string): string {
  const yymmdd = date.slice(2).replaceAll('-', '');
  return `https://www.skyscanner.co.in/transport/flights/${from.toLowerCase()}/${to.toLowerCase()}/${yymmdd}/`;
}

export function sampleSearch(q: FareQuery, today = new Date()): FareOffer[] {
  const a = getAirport(q.from);
  const b = getAirport(q.to);
  if (!a || !b || a.iata === b.iata) return [];

  const km = distanceKm(a, b);
  const r = rng(`${q.from}-${q.to}-${q.date}`);
  const thin = THIN_MARKETS.has(a.countryCode) || THIN_MARKETS.has(b.countryCode) ? 1.6 : 1;
  const factor = bookingWindowFactor(q.date, today) * thin;
  const fetchedAt = new Date().toISOString();
  const offers: FareOffer[] = [];

  const mk = (carrier: AirlineInfo, segs: FlightSegment[], price: number, idx: number): FareOffer => ({
    id: `sample-${q.from}-${q.to}-${q.date}-${idx}`,
    from: q.from,
    to: q.to,
    priceInr: Math.round(price / 10) * 10,
    carrierCode: carrier.code,
    carrierName: carrier.name,
    stops: segs.length - 1,
    via: segs.slice(1).map((s) => s.from),
    departAt: segs[0].departAt,
    arriveAt: segs[segs.length - 1].arriveAt,
    durationMinutes: Math.round((Date.parse(segs[segs.length - 1].arriveAt) - Date.parse(segs[0].departAt)) / 60_000),
    segments: segs,
    baggage: { cabinKg: carrier.cabinKg, checkedPieces: carrier.checkedPieces, basis: 'airline_policy' },
    deepLink: skyscannerLink(q.from, q.to, q.date),
    source: 'sample',
    fetchedAt,
  });

  const departMs = (slot: string) => Date.parse(localToIso(`${q.date}T${slot}`, a.tz));

  // Non-stop options on carriers based at either end. Low-cost carriers only fly
  // medium-haul; full-service hub carriers fly long-haul up to ~14,000km.
  if (km < 14000) {
    carriersFor(q.from, q.to)
      .filter((c) => km < 7500 || !c.lowCost)
      .slice(0, 3)
      .forEach((carrier, i) => {
        const seg = segment(carrier, q.from, q.to, departMs(SLOTS[Math.floor(r() * SLOTS.length)]), r);
        const price = baseFare(km) * factor * (carrier.lowCost ? 0.82 : 1.05) * (0.92 + r() * 0.16);
        offers.push(mk(carrier, [seg], price, i));
      });
  }

  // One-stop single tickets via a carrier's home hub that isn't a big detour.
  const viaCarriers = AIRLINES.filter((c) => !c.lowCost && !c.hubs.includes(q.from) && !c.hubs.includes(q.to))
    .map((c) => ({ c, hub: getAirport(c.hubs[0]) }))
    .filter((x): x is { c: AirlineInfo; hub: NonNullable<ReturnType<typeof getAirport>> } => !!x.hub)
    .map((x) => ({ ...x, detour: (distanceKm(a, x.hub) + distanceKm(x.hub, b)) / km }))
    .filter((x) => x.detour < 1.25)
    .sort((x, y) => x.detour - y.detour)
    .slice(0, 3);

  // Long single tickets out of India carry a market premium vs. buying legs separately.
  const singleTicketPremium = km > 7000 ? 1.35 : 1.08;
  viaCarriers.forEach(({ c, hub, detour }, i) => {
    const first = segment(c, q.from, hub.iata, departMs(SLOTS[Math.floor(r() * SLOTS.length)]), r);
    const connection = (120 + Math.floor(r() * 240)) * 60_000;
    const second = segment(c, hub.iata, q.to, Date.parse(first.arriveAt) + connection, r);
    const price = baseFare(km * detour) * factor * singleTicketPremium * (0.95 + r() * 0.15);
    offers.push(mk(c, [first, second], price, 10 + i));
  });

  return offers.sort((x, y) => x.priceInr - y.priceInr);
}

export const sampleProvider: FlightProvider = {
  name: 'sample',
  async search(q) {
    return sampleSearch(q);
  },
};

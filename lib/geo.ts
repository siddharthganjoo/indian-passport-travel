import { AIRPORTS } from '@/data/airports';
import type { Airport } from '@/types/flight';
export { addDays } from '@/lib/utils';

const BY_IATA = new Map(AIRPORTS.map((a) => [a.iata, a]));

export function getAirport(iata: string): Airport | undefined {
  return BY_IATA.get(iata.toUpperCase());
}

/** Great-circle distance in km. */
export function distanceKm(a: Pick<Airport, 'lat' | 'lon'>, b: Pick<Airport, 'lat' | 'lon'>): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function airportDistanceKm(from: string, to: string): number | null {
  const a = getAirport(from);
  const b = getAirport(to);
  return a && b ? distanceKm(a, b) : null;
}

/** UTC offset of an IANA timezone at a given instant, in minutes (e.g. +330 for India). */
export function tzOffsetMinutes(tz: string, at: Date): number {
  const part = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' })
    .formatToParts(at)
    .find((p) => p.type === 'timeZoneName')?.value;
  const m = part?.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  if (!m) return 0;
  const sign = m[1] === '-' ? -1 : 1;
  return sign * (Number(m[2]) * 60 + Number(m[3] ?? 0));
}

function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}

/** "2026-11-05T06:15" local wall time at `tz` -> "2026-11-05T06:15:00+05:30". */
export function localToIso(local: string, tz: string): string {
  const wall = local.length === 16 ? `${local}:00` : local.slice(0, 19);
  const asUtc = Date.parse(`${wall}Z`);
  let offset = tzOffsetMinutes(tz, new Date(asUtc));
  offset = tzOffsetMinutes(tz, new Date(asUtc - offset * 60_000));
  return `${wall}${formatOffset(offset)}`;
}

/** Absolute instant (ms) -> ISO string in the local wall time of `tz`. */
export function instantToIso(ms: number, tz: string): string {
  const offset = tzOffsetMinutes(tz, new Date(ms));
  const wall = new Date(ms + offset * 60_000).toISOString().slice(0, 19);
  return `${wall}${formatOffset(offset)}`;
}

export function minutesBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(toIso) - Date.parse(fromIso)) / 60_000);
}

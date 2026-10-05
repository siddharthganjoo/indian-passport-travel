export interface Airport {
  iata: string;
  name: string;
  city: string;
  countryCode: string;
  lat: number;
  lon: number;
  /** IANA timezone, used to compare local departure/arrival times across legs. */
  tz: string;
  /** Metro/city code where it differs from the airport code (e.g. GRU -> SAO). */
  metro?: string;
}

export interface FlightSegment {
  carrierCode: string;
  carrierName: string;
  flightNumber: string;
  from: string;
  to: string;
  /** ISO 8601 with UTC offset, e.g. 2026-11-05T06:15:00+05:30 (local wall time at `from`). */
  departAt: string;
  /** ISO 8601 with UTC offset (local wall time at `to`). */
  arriveAt: string;
  durationMinutes: number;
}

export interface BaggageAllowance {
  cabinKg: number | null;
  /** Checked pieces included in the fare. null = unknown. */
  checkedPieces: number | null;
  /** Where the allowance came from: the fare itself, or the airline's typical policy. */
  basis: 'fare' | 'airline_policy';
}

export type FareSource = 'travelpayouts' | 'duffel' | 'sample';

export interface FareOffer {
  id: string;
  from: string;
  to: string;
  priceInr: number;
  carrierCode: string;
  carrierName: string;
  stops: number;
  /** Intermediate airports on a single ticket. */
  via: string[];
  departAt: string;
  arriveAt: string;
  durationMinutes: number;
  segments: FlightSegment[];
  baggage: BaggageAllowance;
  deepLink: string;
  source: FareSource;
  fetchedAt: string;
}

export interface FareQuery {
  from: string;
  to: string;
  date: string; // YYYY-MM-DD
  adults: number;
}

export interface FlightProvider {
  name: FareSource;
  search(query: FareQuery): Promise<FareOffer[]>;
}

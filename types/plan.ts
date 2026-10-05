import type { FareOffer, FareSource } from './flight';
import type { BaseVisaCategory, HeldVisa } from './visa';

export type BagMode = 'cabin' | 'checked';

/** Values of the trip search form / URL. */
export interface TripSearchValues {
  from: string;
  to: string;
  date: string;
  bags: BagMode;
  visas: HeldVisa[];
}
export const BAG_MODES: BagMode[] = ['cabin', 'checked'];

export interface PlanQuery {
  origin: string;              // Indian departure airport, e.g. DEL
  destinationCountry: string;  // ISO-2, e.g. BR
  destinationAirport?: string; // optional, defaults to the country's main airport
  date: string;                // YYYY-MM-DD
  adults: number;
  heldVisas: HeldVisa[];
}

export type VisaRequirementKind =
  | BaseVisaCategory
  | 'airside_ok'        // stay in the transit zone, no visa needed
  | 'transit_visa';     // airport transit visa needed even to stay airside

export interface VisaStop {
  countryCode: string;
  countryName: string;
  airport?: string;
  role: 'transit' | 'destination';
  requirement: VisaRequirementKind;
  label: string;
  feeInr: number;
  processingDays: { min: number; max: number };
  /** Latest sensible date to apply, given processing time + buffer. */
  applyBy?: string;
  officialUrl?: string;
  notes?: string;
  upgradeSource?: HeldVisa;
  documents: string[];
  steps: string[];
  /** This visa cannot realistically be obtained before departure. */
  blocked: boolean;
  /** Data has not been checked by a human recently. */
  unverified: boolean;
  /** Date of desk research behind this rule, when not human-verified. */
  researchedAt?: string;
}

export interface ModeBreakdown {
  fares: number;
  bagFees: number;
  visaFees: number;
  extras: number;
  total: number;
  visas: VisaStop[];
  blocked: boolean;
  blockReason?: string;
  warnings: string[];
}

export interface PlanLeg {
  offer: FareOffer;
  /** Estimated fee to add one checked bag on this leg (0 when already included). */
  checkedBagFeeInr: number;
}

export interface PlanOption {
  id: string;
  kind: 'single_ticket' | 'self_transfer';
  hub?: { iata: string; city: string; countryCode: string; countryName: string };
  legs: PlanLeg[];
  layoverMinutes?: number;
  departAt: string;
  arriveAt: string;
  totalDurationMinutes: number;
  modes: Record<BagMode, ModeBreakdown>;
  /** Notes that apply regardless of bag choice. */
  notes: string[];
  curatedNote?: string;
}

export interface PlanResult {
  query: PlanQuery;
  origin: { iata: string; city: string };
  destination: { countryCode: string; countryName: string; airport: string; city: string };
  options: PlanOption[];
  priceSource: FareSource;
  liveCheckAvailable: boolean;
  generatedAt: string;
}

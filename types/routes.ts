import { HeldVisa, ResearchRecord } from './visa';

export interface RouteLeg {
  fromIata: string;
  fromCity: string;
  toIata: string;
  toCity: string;
  airline: string;
  airlineCode: string;
  typicalDurationHours: number;
  typicalFareInr: number;
  flightFrequency: string; // e.g. "2x daily", "Daily", "4x weekly"
  bookingSearchUrl?: string;
}

export interface TransitVisaRequirement {
  status: 'visa_free_airside' | 'transit_visa_required' | 'evisa_available' | 'voa_available' | 'conditional_free';
  badgeLabel: string;
  costInr: number;
  costUsd: number;
  allowedHours: number; // e.g. 24, 48, 96 hours
  description: string;
  exemptionNotes?: string; // e.g. "Free airside transit if staying within international zone under 12h on single ticket"
  officialLink?: string;
}

export interface LayoverNecessities {
  minRecommendedLayoverHours: number;
  baggageTransfer: 'through_checked' | 'self_transfer_recheck' | 'depends_on_airline';
  baggageAdvice: string;
  terminalTransferNotes: string;
  freeStopoverPerks?: {
    hasFreeHotel: boolean;
    hasFreeCityTour: boolean;
    description: string;
    airlineProgramName: string;
    link?: string;
  };
  recommendedTimingTips: string[];
}

export interface SmartRouteHack {
  id: string;
  originIata: string;            // e.g. "DEL" or "BOM" or "ALL_INDIA"
  originCity: string;
  destinationCountryCode: string;// e.g. "BR"
  destinationCountryName: string;// e.g. "Brazil"
  destinationIata: string;       // e.g. "GRU"
  destinationCity: string;       // e.g. "São Paulo"
  
  hubIata: string;               // e.g. "IST"
  hubCity: string;               // e.g. "Istanbul"
  hubCountry: string;            // e.g. "Turkey"

  standardDirectFareInr: number; // typical legacy/single-ticket price, e.g. 115000
  hackCombinedFareInr: number;   // typical combined hub price, e.g. 67000
  estimatedSavingsInr: number;   // e.g. 48000
  savingsPercentage: number;     // e.g. 42

  leg1: RouteLeg;                // India -> Hub
  leg2: RouteLeg;                // Hub -> Destination

  transitVisa: TransitVisaRequirement;
  layover: LayoverNecessities;

  bestAirlines: string[];
  notes: string;
  verifiedDate: string;
}

export interface TransitHubProfile {
  code: string;                  // IATA: 'IST', 'DXB', 'DOH', 'ADD', 'SIN', 'KUL', 'LHR', 'FRA'
  airportName: string;
  city: string;
  country: string;
  countryCode: string;           // ISO-2 of the hub country, links to its entry rules
  flagEmoji: string;
  airsideTransitAllowed: boolean;
  /** Can you connect between two separate tickets without passing immigration (cabin bag only, onward boarding pass in hand)? */
  airsideSelfTransfer: boolean;
  maxAirsideHours: number;
  transitVisaNeededForIndians: boolean;
  /** Held visas that waive the airport transit visa requirement. */
  transitVisaExemptWith?: HeldVisa[];
  transitVisaType: string;       // e.g. "Free 96-hour Transit Visa", "Instant eVisa", "Airport Transit Visa (DATV) Required"
  transitVisaCostInr: number;
  transitVisaCostUsd: number;
  terminalChangeRequiresVisa: boolean;
  freeStopoverHotelAvailable: boolean;
  freeTourAvailable: boolean;
  airlineProgramName?: string;
  keyAirlines: string[];
  rulesSummary: string;
  criticalWarnings: string[];
  stepByStepGuide: string[];
  officialPortalUrl: string;
  lastVerifiedAt?: string | null;
  research?: ResearchRecord;
}


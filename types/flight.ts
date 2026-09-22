export interface AirportInfo {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface FlightLeg {
  airline: string;
  airlineCode: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
}

export interface FlightOffer {
  id: string;
  airline: string;
  airlineCode: string;
  airlineLogo?: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  priceInr: number;
  stops: number; // 0 for non-stop, 1 for 1 stop
  durationMinutes: number;
  bookingUrl: string;
  legs: FlightLeg[];
  cabinClass: 'economy' | 'premium_economy' | 'business';
  source: 'amadeus' | 'duffel' | 'aggregator_cache';
}

export interface FlightSearchParams {
  origin: string; // 3-letter IATA (DEL, BOM, BLR, etc.)
  destinationCountryCode: string; // 2-letter ISO (TH, MY, AE, etc.)
  destinationAirport?: string;
  departureDate?: string;
  returnDate?: string;
  passengers?: number;
}

export interface FlightFareHistory {
  countryCode: string;
  originIata: string;
  monthlyFares: {
    month: string;
    lowestFareInr: number;
  }[];
  lastUpdated: string;
}

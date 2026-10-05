import { z } from 'zod';
import { HELD_VISAS, CONTINENTS } from '@/types/visa';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');
const iata = z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, 'Use a 3-letter airport code');
const iso2 = z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, 'Use a 2-letter country code');
const heldVisa = z.enum(HELD_VISAS as [string, ...string[]]);
const category = z.enum(['visa_free', 'voa', 'evisa', 'sticker_required']);

/* ── Trip planner query (URL search params) ───────────────────────────────── */

export const planQuerySchema = z.object({
  from: iata,
  to: iso2,
  airport: iata.optional(),
  date: isoDate,
  adults: z.coerce.number().int().min(1).max(9).default(1),
  visas: z
    .string()
    .optional()
    .transform((s) => (s ? s.split(',').filter(Boolean) : []))
    .pipe(z.array(heldVisa)),
  bags: z.enum(['cabin', 'checked']).default('cabin'),
});

export type PlanSearchParams = z.infer<typeof planQuerySchema>;

/* ── Admin payloads ───────────────────────────────────────────────────────── */

const waiver = z.object({
  eligibleCategory: z.enum(['visa_free', 'evisa', 'voa']),
  allowedStayDays: z.number().int().min(0),
  specialFeeUsd: z.number().min(0).optional(),
  conditionNotes: z.string(),
});

export const countrySchema = z
  .object({
    countryCode: iso2,
    countryName: z.string().trim().min(1),
    continent: z.enum(CONTINENTS as [string, ...string[]]),
    defaultCategory: category,
    processingTimeDays: z.object({ min: z.number().int().min(0), max: z.number().int().min(0) }),
    baseFeeUsd: z.number().min(0),
    baseFeeInr: z.number().min(0),
    stayDurationDays: z.number().int().min(0),
    conditionalUpgrades: z
      .object({ validSchengenHolder: waiver.optional(), validUSVisaHolder: waiver.optional(), validUKVisaHolder: waiver.optional() })
      .default({}),
    requiredDocuments: z.array(z.string()).default([]),
    applicationSteps: z.array(z.string()).optional(),
    officialPortalUrl: z.string().default(''),
    sourceUrl: z.string().optional(),
    isSchengen: z.boolean().optional(),
    capitalCity: z.string().default(''),
    popularAirports: z.array(iata).default([]),
    bestTimeToVisit: z.string().default(''),
    tagline: z.string().default(''),
    coverImage: z.string().optional(),
    sampleLowFareInr: z.number().min(0).optional(),
    fareTrends: z.array(z.object({ month: z.string(), fareInr: z.number(), isLowest: z.boolean().optional() })).optional(),
    recommendedHubs: z.array(iata).optional(),
    lastUpdated: z.string().optional(),
    lastVerifiedAt: z.string().nullable().optional(),
  })
  .refine((c) => c.processingTimeDays.max >= c.processingTimeDays.min, { message: 'Processing max must be ≥ min' });

export const hubSchema = z.object({
  code: iata,
  airportName: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  countryCode: iso2,
  flagEmoji: z.string().default(''),
  airsideTransitAllowed: z.boolean(),
  airsideSelfTransfer: z.boolean().default(false),
  maxAirsideHours: z.number().int().min(0),
  transitVisaNeededForIndians: z.boolean(),
  transitVisaExemptWith: z.array(heldVisa).default([]),
  transitVisaType: z.string().default(''),
  transitVisaCostInr: z.number().min(0),
  transitVisaCostUsd: z.number().min(0),
  terminalChangeRequiresVisa: z.boolean(),
  freeStopoverHotelAvailable: z.boolean().default(false),
  freeTourAvailable: z.boolean().default(false),
  airlineProgramName: z.string().optional(),
  keyAirlines: z.array(z.string()).default([]),
  rulesSummary: z.string().default(''),
  criticalWarnings: z.array(z.string()).default([]),
  stepByStepGuide: z.array(z.string()).default([]),
  officialPortalUrl: z.string().default(''),
  lastVerifiedAt: z.string().nullable().optional(),
});

const routeLeg = z.object({
  fromIata: z.string(),
  fromCity: z.string(),
  toIata: z.string(),
  toCity: z.string(),
  airline: z.string(),
  airlineCode: z.string(),
  typicalDurationHours: z.number(),
  typicalFareInr: z.number(),
  flightFrequency: z.string(),
  bookingSearchUrl: z.string().optional(),
});

export const routeSchema = z.object({
  id: z.string().default(''),
  originIata: z.string().min(3),
  originCity: z.string(),
  destinationCountryCode: iso2,
  destinationCountryName: z.string(),
  destinationIata: iata,
  destinationCity: z.string(),
  hubIata: iata,
  hubCity: z.string(),
  hubCountry: z.string(),
  standardDirectFareInr: z.number().min(0),
  hackCombinedFareInr: z.number().min(0),
  estimatedSavingsInr: z.number(),
  savingsPercentage: z.number(),
  leg1: routeLeg,
  leg2: routeLeg,
  transitVisa: z.object({
    status: z.enum(['visa_free_airside', 'transit_visa_required', 'evisa_available', 'voa_available', 'conditional_free']),
    badgeLabel: z.string(),
    costInr: z.number(),
    costUsd: z.number(),
    allowedHours: z.number(),
    description: z.string(),
    exemptionNotes: z.string().optional(),
    officialLink: z.string().optional(),
  }),
  layover: z.object({
    minRecommendedLayoverHours: z.number(),
    baggageTransfer: z.enum(['through_checked', 'self_transfer_recheck', 'depends_on_airline']),
    baggageAdvice: z.string(),
    terminalTransferNotes: z.string(),
    freeStopoverPerks: z
      .object({
        hasFreeHotel: z.boolean(),
        hasFreeCityTour: z.boolean(),
        description: z.string(),
        airlineProgramName: z.string(),
        link: z.string().optional(),
      })
      .optional(),
    recommendedTimingTips: z.array(z.string()),
  }),
  bestAirlines: z.array(z.string()),
  notes: z.string(),
  verifiedDate: z.string().default(''),
});

export const importSchema = z.object({
  destinations: z.array(countrySchema).optional(),
  routes: z.array(routeSchema).optional(),
  transitHubs: z.array(hubSchema).optional(),
});

/** Turn a ZodError into a short, human-readable message. */
export function formatZodError(err: z.ZodError): string {
  return err.issues
    .slice(0, 5)
    .map((i) => `${i.path.join('.') || 'body'}: ${i.message}`)
    .join('; ');
}

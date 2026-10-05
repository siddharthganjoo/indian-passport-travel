import { boolean, integer, jsonb, pgTable, text, timestamp, varchar, index } from 'drizzle-orm/pg-core';
import type { ConditionalPassRules, MonthlyFareTrend } from '@/types/visa';
import type { RouteLeg, TransitVisaRequirement, LayoverNecessities } from '@/types/routes';
import type { HeldVisa } from '@/types/visa';

/** Visa rules for Indian passport holders, one row per destination country. */
export const countries = pgTable(
  'countries',
  {
    code: varchar('code', { length: 2 }).primaryKey(),
    name: text('name').notNull(),
    continent: text('continent').notNull(),
    capital: text('capital').notNull().default(''),
    passport: varchar('passport', { length: 2 }).notNull().default('IN'),

    category: text('category').notNull(),
    stayDays: integer('stay_days').notNull(),
    feeUsd: integer('fee_usd').notNull().default(0),
    feeInr: integer('fee_inr').notNull().default(0),
    processingMinDays: integer('processing_min_days').notNull().default(0),
    processingMaxDays: integer('processing_max_days').notNull().default(0),
    isSchengen: boolean('is_schengen').notNull().default(false),
    waivers: jsonb('waivers').$type<ConditionalPassRules>().notNull().default({}),
    documents: jsonb('documents').$type<string[]>().notNull().default([]),
    steps: jsonb('steps').$type<string[]>().notNull().default([]),
    officialUrl: text('official_url').notNull().default(''),
    sourceUrl: text('source_url'),

    airports: jsonb('airports').$type<string[]>().notNull().default([]),
    recommendedHubs: jsonb('recommended_hubs').$type<string[]>(),
    tagline: text('tagline').notNull().default(''),
    bestTime: text('best_time').notNull().default(''),
    coverImage: text('cover_image'),
    sampleLowFareInr: integer('sample_low_fare_inr'),
    fareTrends: jsonb('fare_trends').$type<MonthlyFareTrend[]>(),

    lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('countries_category_idx').on(t.category), index('countries_verified_idx').on(t.lastVerifiedAt)]
);

/** Transit rules at connecting airports. */
export const transitHubs = pgTable('transit_hubs', {
  code: varchar('code', { length: 3 }).primaryKey(),
  countryCode: varchar('country_code', { length: 2 }).notNull(),
  airportName: text('airport_name').notNull(),
  city: text('city').notNull(),
  airsideTransitAllowed: boolean('airside_transit_allowed').notNull().default(true),
  airsideSelfTransfer: boolean('airside_self_transfer').notNull().default(false),
  maxAirsideHours: integer('max_airside_hours').notNull().default(24),
  transitVisaRequired: boolean('transit_visa_required').notNull().default(false),
  transitVisaExemptWith: jsonb('transit_visa_exempt_with').$type<HeldVisa[]>().notNull().default([]),
  transitVisaCostInr: integer('transit_visa_cost_inr').notNull().default(0),
  transitVisaCostUsd: integer('transit_visa_cost_usd').notNull().default(0),
  terminalChangeRequiresVisa: boolean('terminal_change_requires_visa').notNull().default(false),
  /** Display-only fields (country name, flag, guides, warnings, perks...). */
  profile: jsonb('profile').$type<HubDisplayProfile>().notNull(),
  lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export interface HubDisplayProfile {
  country: string;
  flagEmoji: string;
  transitVisaType: string;
  freeStopoverHotelAvailable: boolean;
  freeTourAvailable: boolean;
  airlineProgramName?: string;
  keyAirlines: string[];
  rulesSummary: string;
  criticalWarnings: string[];
  stepByStepGuide: string[];
  officialPortalUrl: string;
}

/** Editorial split-ticket route ideas. */
export const curatedRoutes = pgTable(
  'curated_routes',
  {
    id: text('id').primaryKey(),
    originIata: varchar('origin_iata', { length: 8 }).notNull(),
    hubIata: varchar('hub_iata', { length: 3 }).notNull(),
    destinationCountry: varchar('destination_country', { length: 2 }).notNull(),
    destinationIata: varchar('destination_iata', { length: 3 }).notNull(),
    route: jsonb('route').$type<CuratedRouteBody>().notNull(),
    verifiedDate: text('verified_date').notNull().default(''),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('curated_routes_dest_idx').on(t.destinationCountry)]
);

export interface CuratedRouteBody {
  originCity: string;
  destinationCountryName: string;
  destinationCity: string;
  hubCity: string;
  hubCountry: string;
  standardDirectFareInr: number;
  hackCombinedFareInr: number;
  estimatedSavingsInr: number;
  savingsPercentage: number;
  leg1: RouteLeg;
  leg2: RouteLeg;
  transitVisa: TransitVisaRequirement;
  layover: LayoverNecessities;
  bestAirlines: string[];
  notes: string;
}

export type BaseVisaCategory = 'visa_free' | 'voa' | 'evisa' | 'sticker_required';

/** Secondary visas an Indian traveller may already hold that unlock easier entry elsewhere. */
export type HeldVisa = 'US' | 'Schengen' | 'UK';
export const HELD_VISAS: HeldVisa[] = ['US', 'Schengen', 'UK'];

export interface ConditionalPassRuleDetails {
  eligibleCategory: 'visa_free' | 'evisa' | 'voa';
  allowedStayDays: number;
  specialFeeUsd?: number;
  conditionNotes: string;
}

export interface ConditionalPassRules {
  validSchengenHolder?: ConditionalPassRuleDetails;
  validUSVisaHolder?: ConditionalPassRuleDetails;
  validUKVisaHolder?: ConditionalPassRuleDetails;
}

export interface MonthlyFareTrend {
  month: string; // e.g. "Jan", "Feb"
  fareInr: number;
  isLowest?: boolean;
}

export type Continent = 'Asia' | 'Europe' | 'Africa' | 'Americas' | 'Oceania' | 'Middle East';
export const CONTINENTS: Continent[] = ['Asia', 'Middle East', 'Europe', 'Africa', 'Americas', 'Oceania'];

/** Desk research behind a record (not a human verification — see lastVerifiedAt). */
export interface ResearchRecord {
  checkedAt: string; // ISO date
  confidence: 'high' | 'medium' | 'low';
  /** What was checked and what changed, in one or two sentences. */
  summary: string;
  sources: { label: string; url: string }[];
}

export interface CountryVisaProfile {
  countryCode: string;          // ISO-3166-1 alpha-2 (e.g., 'TR', 'GE', 'AE')
  countryName: string;
  continent: Continent;
  defaultCategory: BaseVisaCategory;
  processingTimeDays: { min: number; max: number };
  baseFeeUsd: number;
  baseFeeInr: number;
  stayDurationDays: number;
  conditionalUpgrades: ConditionalPassRules;
  requiredDocuments: string[];
  /** Ordered "how to get this visa" walkthrough. */
  applicationSteps?: string[];
  officialPortalUrl: string;
  /** Where the rule was sourced from, for reviewers. */
  sourceUrl?: string;
  /** Member of the Schengen area — a valid Schengen visa grants entry. */
  isSchengen?: boolean;
  capitalCity: string;
  popularAirports: string[]; // e.g. ['IST', 'SAW']
  bestTimeToVisit: string;
  tagline: string;
  coverImage?: string;
  sampleLowFareInr?: number;
  fareTrends?: MonthlyFareTrend[];
  recommendedHubs?: string[];
  lastUpdated?: string;
  /** ISO timestamp of the last human check against the official source. null = never verified. */
  lastVerifiedAt?: string | null;
  research?: ResearchRecord;
}

export interface UserVisaProfile {
  hasSchengen: boolean;
  hasUSVisa: boolean;
  hasUKVisa: boolean;
}

export interface ResolvedVisaRequirements {
  effectiveCategory: BaseVisaCategory;
  processingTime: string;
  processingDays: { min: number; max: number };
  stayDays: number;
  feeInr: number;
  notes?: string;
  isUpgraded: boolean;
  upgradeSource?: HeldVisa;
}

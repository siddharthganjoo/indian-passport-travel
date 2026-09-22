export type BaseVisaCategory = 'visa_free' | 'voa' | 'evisa' | 'sticker_required';

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

export interface CountryVisaProfile {
  countryCode: string;          // ISO-3166-1 alpha-2 (e.g., 'TR', 'GE', 'AE')
  countryName: string;
  continent: 'Asia' | 'Europe' | 'Africa' | 'Americas' | 'Oceania' | 'Middle East';
  defaultCategory: BaseVisaCategory;
  processingTimeDays: { min: number; max: number };
  baseFeeUsd: number;
  baseFeeInr: number;
  stayDurationDays: number;
  conditionalUpgrades: ConditionalPassRules;
  requiredDocuments: string[];
  officialPortalUrl: string;
  capitalCity: string;
  popularAirports: string[]; // e.g. ['IST', 'SAW']
  bestTimeToVisit: string;
  tagline: string;
  coverImage: string;
  sampleLowFareInr: number;
  fareTrends: MonthlyFareTrend[];
}

export interface UserVisaProfile {
  hasSchengen: boolean;
  hasUSVisa: boolean;
  hasUKVisa: boolean;
}

export interface ResolvedVisaRequirements {
  effectiveCategory: BaseVisaCategory;
  processingTime: string;
  feeInr: number;
  notes?: string;
  isUpgraded: boolean;
  upgradeSource?: 'US' | 'Schengen' | 'UK';
}

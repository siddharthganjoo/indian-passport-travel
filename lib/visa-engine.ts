import {
  CountryVisaProfile,
  UserVisaProfile,
  ResolvedVisaRequirements,
} from '@/types/visa';

/**
 * Resolves the effective visa requirement for an Indian passport holder
 * based on secondary visa holdings (US, Schengen, UK) and destination country rules.
 */
export function resolveVisaRequirements(
  country: CountryVisaProfile,
  user: UserVisaProfile
): ResolvedVisaRequirements {
  // 1. Priority 1: Check US Visa conditional relaxation
  // (e.g., Turkey eVisa, UAE 14-day VoA, Mexico Visa-Free, Philippines Visa-Free)
  if (user.hasUSVisa && country.conditionalUpgrades.validUSVisaHolder) {
    const rule = country.conditionalUpgrades.validUSVisaHolder;
    const feeInr = rule.specialFeeUsd !== undefined 
      ? Math.round(rule.specialFeeUsd * 86) 
      : country.baseFeeInr;

    return {
      effectiveCategory: rule.eligibleCategory,
      processingTime: 'Instant - 24 hours',
      feeInr,
      notes: rule.conditionNotes,
      isUpgraded: true,
      upgradeSource: 'US',
    };
  }

  // 2. Priority 2: Check Schengen Visa conditional relaxation
  // (e.g., Georgia Visa-Free, Turkey eVisa, Philippines, Albania, UAE VoA)
  if (user.hasSchengen && country.conditionalUpgrades.validSchengenHolder) {
    const rule = country.conditionalUpgrades.validSchengenHolder;
    const feeInr = rule.specialFeeUsd !== undefined 
      ? Math.round(rule.specialFeeUsd * 86) 
      : country.baseFeeInr;

    return {
      effectiveCategory: rule.eligibleCategory,
      processingTime: 'Instant to 48 hours',
      feeInr,
      notes: rule.conditionNotes,
      isUpgraded: true,
      upgradeSource: 'Schengen',
    };
  }

  // 3. Priority 3: Check UK Visa conditional relaxation
  // (e.g., Turkey eVisa, UAE VoA, Mexico, Albania)
  if (user.hasUKVisa && country.conditionalUpgrades.validUKVisaHolder) {
    const rule = country.conditionalUpgrades.validUKVisaHolder;
    const feeInr = rule.specialFeeUsd !== undefined 
      ? Math.round(rule.specialFeeUsd * 86) 
      : country.baseFeeInr;

    return {
      effectiveCategory: rule.eligibleCategory,
      processingTime: 'Instant to 48 hours',
      feeInr,
      notes: rule.conditionNotes,
      isUpgraded: true,
      upgradeSource: 'UK',
    };
  }

  // 4. Baseline fallback for standard Indian passport
  const time = country.processingTimeDays.min === 0 
    ? 'On Arrival / Instant' 
    : `${country.processingTimeDays.min} - ${country.processingTimeDays.max} business days`;

  return {
    effectiveCategory: country.defaultCategory,
    processingTime: time,
    feeInr: country.baseFeeInr,
    notes: undefined,
    isUpgraded: false,
  };
}

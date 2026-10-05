import {
  BaseVisaCategory,
  ConditionalPassRuleDetails,
  CountryVisaProfile,
  HeldVisa,
  ResolvedVisaRequirements,
  UserVisaProfile,
} from '@/types/visa';
import { usdToInr, type FxRates } from '@/lib/fx';

/** Lower is easier. */
const CATEGORY_RANK: Record<BaseVisaCategory, number> = {
  visa_free: 0,
  voa: 1,
  evisa: 2,
  sticker_required: 3,
};

const UPGRADE_PROCESSING: Record<Exclude<BaseVisaCategory, 'sticker_required'>, { min: number; max: number }> = {
  visa_free: { min: 0, max: 0 },
  voa: { min: 0, max: 0 },
  evisa: { min: 0, max: 3 },
};

const WAIVER_FIELDS: [HeldVisa, keyof CountryVisaProfile['conditionalUpgrades'], keyof UserVisaProfile][] = [
  ['US', 'validUSVisaHolder', 'hasUSVisa'],
  ['Schengen', 'validSchengenHolder', 'hasSchengen'],
  ['UK', 'validUKVisaHolder', 'hasUKVisa'],
];

export function profileFromHeld(held: HeldVisa[]): UserVisaProfile {
  return { hasUSVisa: held.includes('US'), hasSchengen: held.includes('Schengen'), hasUKVisa: held.includes('UK') };
}

export function heldFromProfile(p: UserVisaProfile): HeldVisa[] {
  return WAIVER_FIELDS.filter(([, , flag]) => p[flag]).map(([held]) => held);
}

export function formatProcessing(days: { min: number; max: number }): string {
  if (days.max === 0) return 'Instant';
  if (days.min === days.max) return `${days.max} day${days.max === 1 ? '' : 's'}`;
  return `${days.min}–${days.max} days`;
}

/** The visa you already hold covers this country outright. */
function coveredByHeldVisa(country: CountryVisaProfile, held: HeldVisa[]): HeldVisa | undefined {
  if (country.isSchengen && held.includes('Schengen')) return 'Schengen';
  if (country.countryCode === 'US' && held.includes('US')) return 'US';
  if (country.countryCode === 'GB' && held.includes('UK')) return 'UK';
  return undefined;
}

/**
 * Effective entry requirement for an Indian passport holder, taking into
 * account visas they already hold. When several waivers apply, the easiest
 * category wins, then the cheapest fee, then the longest stay.
 */
export function resolveVisaRequirements(
  country: CountryVisaProfile,
  user: UserVisaProfile,
  rates?: FxRates
): ResolvedVisaRequirements {
  const held = heldFromProfile(user);

  const covering = coveredByHeldVisa(country, held);
  if (covering) {
    return {
      effectiveCategory: 'visa_free',
      processingTime: 'Already covered',
      processingDays: { min: 0, max: 0 },
      stayDays: country.stayDurationDays,
      feeInr: 0,
      notes: `Your valid ${covering} visa lets you enter ${country.countryName} — no new visa needed (stay within its validity and permitted days).`,
      isUpgraded: true,
      upgradeSource: covering,
    };
  }

  const candidates: { source: HeldVisa; rule: ConditionalPassRuleDetails; feeInr: number }[] = [];
  for (const [source, field] of WAIVER_FIELDS) {
    const rule = country.conditionalUpgrades?.[field];
    if (!rule || !held.includes(source)) continue;
    const feeInr = rule.specialFeeUsd !== undefined ? usdToInr(rule.specialFeeUsd, rates) : country.baseFeeInr;
    candidates.push({ source, rule, feeInr });
  }

  const best = candidates
    .filter((c) => CATEGORY_RANK[c.rule.eligibleCategory] <= CATEGORY_RANK[country.defaultCategory])
    .sort(
      (a, b) =>
        CATEGORY_RANK[a.rule.eligibleCategory] - CATEGORY_RANK[b.rule.eligibleCategory] ||
        a.feeInr - b.feeInr ||
        b.rule.allowedStayDays - a.rule.allowedStayDays
    )[0];

  if (best) {
    const processingDays = UPGRADE_PROCESSING[best.rule.eligibleCategory];
    return {
      effectiveCategory: best.rule.eligibleCategory,
      processingTime: formatProcessing(processingDays),
      processingDays,
      stayDays: best.rule.allowedStayDays,
      feeInr: best.feeInr,
      notes: best.rule.conditionNotes,
      isUpgraded: true,
      upgradeSource: best.source,
    };
  }

  const feeInr = rates && country.baseFeeUsd > 0 ? usdToInr(country.baseFeeUsd, rates) : country.baseFeeInr;
  return {
    effectiveCategory: country.defaultCategory,
    processingTime: country.processingTimeDays.max === 0 ? 'On arrival' : formatProcessing(country.processingTimeDays),
    processingDays: country.processingTimeDays,
    stayDays: country.stayDurationDays,
    feeInr,
    notes: undefined,
    isUpgraded: false,
  };
}

const STALE_AFTER_DAYS = 90;

/** "verified" (checked in the last 90 days), "stale" (checked earlier) or "unverified" (never). */
export function verificationStatus(lastVerifiedAt: string | null | undefined, now = new Date()): 'verified' | 'stale' | 'unverified' {
  if (!lastVerifiedAt) return 'unverified';
  const ageDays = (now.getTime() - new Date(lastVerifiedAt).getTime()) / 86_400_000;
  return ageDays > STALE_AFTER_DAYS ? 'stale' : 'verified';
}

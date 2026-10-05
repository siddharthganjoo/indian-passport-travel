import { describe, expect, it } from 'vitest';
import { profileFromHeld, resolveVisaRequirements, verificationStatus } from '@/lib/visa-engine';
import { country } from './fixtures';

const none = profileFromHeld([]);

describe('resolveVisaRequirements', () => {
  it('uses the default rule for a plain Indian passport', () => {
    const r = resolveVisaRequirements(country('TR'), none);
    expect(r.effectiveCategory).toBe('sticker_required');
    expect(r.isUpgraded).toBe(false);
    expect(r.processingDays).toEqual(country('TR').processingTimeDays);
  });

  it('upgrades Turkey to an eVisa for US visa holders', () => {
    const r = resolveVisaRequirements(country('TR'), profileFromHeld(['US']));
    expect(r.effectiveCategory).toBe('evisa');
    expect(r.upgradeSource).toBe('US');
    expect(r.feeInr).toBe(50 * 88);
  });

  it('makes Georgia visa-free for Schengen holders', () => {
    expect(resolveVisaRequirements(country('GE'), profileFromHeld(['Schengen'])).effectiveCategory).toBe('visa_free');
  });

  it('gives UAE visa on arrival for UK visa holders', () => {
    expect(resolveVisaRequirements(country('AE'), profileFromHeld(['UK'])).effectiveCategory).toBe('voa');
  });

  it('makes Mexico and Peru visa-free for US visa holders', () => {
    expect(resolveVisaRequirements(country('MX'), profileFromHeld(['US'])).effectiveCategory).toBe('visa_free');
    expect(resolveVisaRequirements(country('PE'), profileFromHeld(['US'])).effectiveCategory).toBe('visa_free');
  });

  it('picks the easiest waiver when several apply, not the first one listed', () => {
    const c = {
      ...country('TR'),
      conditionalUpgrades: {
        validUSVisaHolder: { eligibleCategory: 'evisa' as const, allowedStayDays: 30, specialFeeUsd: 50, conditionNotes: 'us' },
        validUKVisaHolder: { eligibleCategory: 'visa_free' as const, allowedStayDays: 30, conditionNotes: 'uk' },
      },
    };
    const r = resolveVisaRequirements(c, profileFromHeld(['US', 'UK']));
    expect(r.effectiveCategory).toBe('visa_free');
    expect(r.upgradeSource).toBe('UK');
  });

  it('treats a Schengen visa as covering every Schengen country', () => {
    const r = resolveVisaRequirements(country('DE'), profileFromHeld(['Schengen']));
    expect(r.effectiveCategory).toBe('visa_free');
    expect(r.feeInr).toBe(0);
    expect(resolveVisaRequirements(country('FR'), profileFromHeld(['Schengen'])).effectiveCategory).toBe('visa_free');
  });

  it('never downgrades: a waiver worse than the default is ignored', () => {
    const c = {
      ...country('TH'),
      conditionalUpgrades: { validUSVisaHolder: { eligibleCategory: 'evisa' as const, allowedStayDays: 30, conditionNotes: '' } },
    };
    expect(resolveVisaRequirements(c, profileFromHeld(['US'])).effectiveCategory).toBe('visa_free');
  });
});

describe('verificationStatus', () => {
  const now = new Date('2026-10-05T00:00:00Z');
  it('classifies never / recent / stale', () => {
    expect(verificationStatus(null, now)).toBe('unverified');
    expect(verificationStatus('2026-09-01T00:00:00Z', now)).toBe('verified');
    expect(verificationStatus('2026-03-01T00:00:00Z', now)).toBe('stale');
  });
});

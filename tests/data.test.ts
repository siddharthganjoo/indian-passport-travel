import { describe, expect, it } from 'vitest';
import { getAirport } from '@/lib/geo';
import { COUNTRIES, HUBS } from './fixtures';

/** Guards against data mistakes that would mislead travellers. */
describe('visa dataset', () => {
  it('has one record per country', () => {
    const codes = COUNTRIES.map((c) => c.countryCode);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('every country has a valid category, sane processing range and a research note', () => {
    for (const c of COUNTRIES) {
      expect(['visa_free', 'voa', 'evisa', 'sticker_required'], c.countryCode).toContain(c.defaultCategory);
      expect(c.processingTimeDays.min, c.countryCode).toBeLessThanOrEqual(c.processingTimeDays.max);
      expect(c.research?.sources.length ?? 0, c.countryCode).toBeGreaterThan(0);
    }
  });

  it('embassy visas never show as free', () => {
    const free = COUNTRIES.filter((c) => c.defaultCategory === 'sticker_required' && c.baseFeeUsd === 0 && c.baseFeeInr === 0);
    // Bangladesh and Pakistan issue visas to Indians without a fee.
    expect(free.map((c) => c.countryCode).filter((c) => !['BD', 'PK'].includes(c))).toEqual([]);
  });

  it('no record claims human verification from the research pass', () => {
    expect(COUNTRIES.filter((c) => c.lastVerifiedAt).map((c) => c.countryCode)).toEqual([]);
  });

  it('every country has at least one airport the route planner knows', () => {
    const missing = COUNTRIES.filter((c) => !c.popularAirports.some((a) => getAirport(a))).map((c) => c.countryCode);
    expect(missing).toEqual([]);
  });

  it('every hub is a known airport and links to its country', () => {
    const codes = new Set(COUNTRIES.map((c) => c.countryCode));
    for (const h of HUBS) {
      expect(getAirport(h.code), h.code).toBeDefined();
      expect(codes.has(h.countryCode), h.code).toBe(true);
    }
  });
});

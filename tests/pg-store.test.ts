import { beforeAll, describe, expect, it } from 'vitest';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { PgStore, type Db } from '@/lib/db/pg-store';
import { COUNTRIES, HUBS, ROUTES } from './fixtures';

/** Runs the real migrations and store against in-process Postgres (PGlite). */
describe('PgStore (Postgres)', () => {
  let store: PgStore;

  beforeAll(async () => {
    const db = drizzle(new PGlite());
    await migrate(db, { migrationsFolder: path.resolve(__dirname, '../drizzle') });
    store = new PgStore(db as unknown as Db);
    await store.replaceAll({ destinations: COUNTRIES, transitHubs: HUBS, routes: ROUTES });
  });

  it('seeds every record from the JSON dataset', async () => {
    expect(await store.listCountries()).toHaveLength(COUNTRIES.length);
    expect(await store.listHubs()).toHaveLength(HUBS.length);
    expect(await store.listRoutes()).toHaveLength(ROUTES.length);
  });

  it('round-trips a country without losing visa fields', async () => {
    const original = COUNTRIES.find((c) => c.countryCode === 'TR')!;
    const loaded = (await store.getCountry('tr'))!;
    expect(loaded.defaultCategory).toBe(original.defaultCategory);
    expect(loaded.processingTimeDays).toEqual(original.processingTimeDays);
    expect(loaded.conditionalUpgrades).toEqual(original.conditionalUpgrades);
    expect(loaded.requiredDocuments).toEqual(original.requiredDocuments);
    expect(loaded.popularAirports).toEqual(original.popularAirports);
    expect(loaded.lastVerifiedAt).toBeNull();
  });

  it('round-trips a hub including transit exemptions', async () => {
    const lhr = (await store.listHubs()).find((h) => h.code === 'LHR')!;
    const original = HUBS.find((h) => h.code === 'LHR')!;
    expect(lhr).toMatchObject({
      countryCode: 'GB',
      transitVisaNeededForIndians: true,
      transitVisaExemptWith: original.transitVisaExemptWith,
      criticalWarnings: original.criticalWarnings,
    });
  });

  it('upserts, verifies and deletes', async () => {
    const ge = (await store.getCountry('GE'))!;
    await store.upsertCountry({ ...ge, stayDurationDays: 365, lastVerifiedAt: '2026-10-05T00:00:00.000Z' });
    const updated = (await store.getCountry('GE'))!;
    expect(updated.stayDurationDays).toBe(365);
    expect(updated.lastVerifiedAt).toBe('2026-10-05T00:00:00.000Z');

    expect(await store.deleteCountry('GE')).toBe(true);
    expect(await store.getCountry('GE')).toBeUndefined();
    expect(await store.deleteCountry('GE')).toBe(false);
  });
});

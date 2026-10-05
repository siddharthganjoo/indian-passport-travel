import { asc, eq } from 'drizzle-orm';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import type { CountryVisaProfile, Continent, BaseVisaCategory } from '@/types/visa';
import type { SmartRouteHack, TransitHubProfile } from '@/types/routes';
import { countries, curatedRoutes, transitHubs } from './schema';
import type { DatabaseSnapshot, Store } from './store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Db = PgDatabase<PgQueryResultHKT, any>;

type CountryRow = typeof countries.$inferSelect;
type HubRow = typeof transitHubs.$inferSelect;
type RouteRow = typeof curatedRoutes.$inferSelect;

const iso = (d: Date | null) => (d ? d.toISOString() : null);
const date = (s: string | null | undefined) => (s ? new Date(s) : null);

export function countryFromRow(r: CountryRow): CountryVisaProfile {
  return {
    countryCode: r.code,
    countryName: r.name,
    continent: r.continent as Continent,
    capitalCity: r.capital,
    defaultCategory: r.category as BaseVisaCategory,
    stayDurationDays: r.stayDays,
    baseFeeUsd: r.feeUsd,
    baseFeeInr: r.feeInr,
    processingTimeDays: { min: r.processingMinDays, max: r.processingMaxDays },
    ...(r.isSchengen ? { isSchengen: true } : {}),
    conditionalUpgrades: r.waivers,
    requiredDocuments: r.documents,
    applicationSteps: r.steps,
    officialPortalUrl: r.officialUrl,
    ...(r.sourceUrl ? { sourceUrl: r.sourceUrl } : {}),
    popularAirports: r.airports,
    ...(r.recommendedHubs ? { recommendedHubs: r.recommendedHubs } : {}),
    tagline: r.tagline,
    bestTimeToVisit: r.bestTime,
    ...(r.coverImage ? { coverImage: r.coverImage } : {}),
    ...(r.sampleLowFareInr != null ? { sampleLowFareInr: r.sampleLowFareInr } : {}),
    ...(r.fareTrends ? { fareTrends: r.fareTrends } : {}),
    ...(r.research ? { research: r.research } : {}),
    lastVerifiedAt: iso(r.lastVerifiedAt),
    lastUpdated: r.updatedAt.toISOString(),
  };
}

export function countryToRow(c: CountryVisaProfile): typeof countries.$inferInsert {
  return {
    code: c.countryCode.toUpperCase(),
    name: c.countryName,
    continent: c.continent,
    capital: c.capitalCity ?? '',
    category: c.defaultCategory,
    stayDays: c.stayDurationDays,
    feeUsd: Math.round(c.baseFeeUsd),
    feeInr: Math.round(c.baseFeeInr),
    processingMinDays: c.processingTimeDays.min,
    processingMaxDays: c.processingTimeDays.max,
    isSchengen: !!c.isSchengen,
    waivers: c.conditionalUpgrades ?? {},
    documents: c.requiredDocuments ?? [],
    steps: c.applicationSteps ?? [],
    officialUrl: c.officialPortalUrl ?? '',
    sourceUrl: c.sourceUrl ?? null,
    airports: c.popularAirports ?? [],
    recommendedHubs: c.recommendedHubs ?? null,
    tagline: c.tagline ?? '',
    bestTime: c.bestTimeToVisit ?? '',
    coverImage: c.coverImage ?? null,
    sampleLowFareInr: c.sampleLowFareInr ?? null,
    fareTrends: c.fareTrends ?? null,
    research: c.research ?? null,
    lastVerifiedAt: date(c.lastVerifiedAt),
    updatedAt: new Date(),
  };
}

export function hubFromRow(r: HubRow): TransitHubProfile {
  return {
    ...r.profile,
    code: r.code,
    countryCode: r.countryCode,
    airportName: r.airportName,
    city: r.city,
    airsideTransitAllowed: r.airsideTransitAllowed,
    airsideSelfTransfer: r.airsideSelfTransfer,
    maxAirsideHours: r.maxAirsideHours,
    transitVisaNeededForIndians: r.transitVisaRequired,
    transitVisaExemptWith: r.transitVisaExemptWith,
    transitVisaCostInr: r.transitVisaCostInr,
    transitVisaCostUsd: r.transitVisaCostUsd,
    terminalChangeRequiresVisa: r.terminalChangeRequiresVisa,
    ...(r.research ? { research: r.research } : {}),
    lastVerifiedAt: iso(r.lastVerifiedAt),
  };
}

export function hubToRow(h: TransitHubProfile): typeof transitHubs.$inferInsert {
  return {
    code: h.code.toUpperCase(),
    countryCode: h.countryCode.toUpperCase(),
    airportName: h.airportName,
    city: h.city,
    airsideTransitAllowed: h.airsideTransitAllowed,
    airsideSelfTransfer: h.airsideSelfTransfer,
    maxAirsideHours: h.maxAirsideHours,
    transitVisaRequired: h.transitVisaNeededForIndians,
    transitVisaExemptWith: h.transitVisaExemptWith ?? [],
    transitVisaCostInr: h.transitVisaCostInr,
    transitVisaCostUsd: h.transitVisaCostUsd,
    terminalChangeRequiresVisa: h.terminalChangeRequiresVisa,
    profile: {
      country: h.country,
      flagEmoji: h.flagEmoji,
      transitVisaType: h.transitVisaType,
      freeStopoverHotelAvailable: h.freeStopoverHotelAvailable,
      freeTourAvailable: h.freeTourAvailable,
      ...(h.airlineProgramName ? { airlineProgramName: h.airlineProgramName } : {}),
      keyAirlines: h.keyAirlines,
      rulesSummary: h.rulesSummary,
      criticalWarnings: h.criticalWarnings,
      stepByStepGuide: h.stepByStepGuide,
      officialPortalUrl: h.officialPortalUrl,
    },
    research: h.research ?? null,
    lastVerifiedAt: date(h.lastVerifiedAt),
    updatedAt: new Date(),
  };
}

export function routeFromRow(r: RouteRow): SmartRouteHack {
  return {
    ...r.route,
    id: r.id,
    originIata: r.originIata,
    hubIata: r.hubIata,
    destinationCountryCode: r.destinationCountry,
    destinationIata: r.destinationIata,
    verifiedDate: r.verifiedDate,
  };
}

export function routeToRow(r: SmartRouteHack): typeof curatedRoutes.$inferInsert {
  const { id, originIata, hubIata, destinationCountryCode, destinationIata, verifiedDate, ...route } = r;
  return {
    id,
    originIata,
    hubIata,
    destinationCountry: destinationCountryCode.toUpperCase(),
    destinationIata,
    verifiedDate: verifiedDate ?? '',
    route,
    updatedAt: new Date(),
  };
}

export class PgStore implements Store {
  readonly kind = 'postgres' as const;
  readonly writable = true;

  constructor(private readonly db: Db) {}

  async listCountries() {
    const rows = await this.db.select().from(countries).orderBy(asc(countries.name));
    return rows.map(countryFromRow);
  }

  async getCountry(code: string) {
    const [row] = await this.db.select().from(countries).where(eq(countries.code, code.toUpperCase())).limit(1);
    return row ? countryFromRow(row) : undefined;
  }

  async upsertCountry(country: CountryVisaProfile) {
    const values = countryToRow(country);
    const [row] = await this.db
      .insert(countries)
      .values(values)
      .onConflictDoUpdate({ target: countries.code, set: values })
      .returning();
    return countryFromRow(row);
  }

  async deleteCountry(code: string) {
    const rows = await this.db.delete(countries).where(eq(countries.code, code.toUpperCase())).returning({ code: countries.code });
    return rows.length > 0;
  }

  async listHubs() {
    const rows = await this.db.select().from(transitHubs).orderBy(asc(transitHubs.code));
    return rows.map(hubFromRow);
  }

  async upsertHub(hub: TransitHubProfile) {
    const values = hubToRow(hub);
    const [row] = await this.db
      .insert(transitHubs)
      .values(values)
      .onConflictDoUpdate({ target: transitHubs.code, set: values })
      .returning();
    return hubFromRow(row);
  }

  async deleteHub(code: string) {
    const rows = await this.db.delete(transitHubs).where(eq(transitHubs.code, code.toUpperCase())).returning({ code: transitHubs.code });
    return rows.length > 0;
  }

  async listRoutes() {
    const rows = await this.db.select().from(curatedRoutes).orderBy(asc(curatedRoutes.id));
    return rows.map(routeFromRow);
  }

  async upsertRoute(route: SmartRouteHack) {
    const values = routeToRow(route);
    const [row] = await this.db
      .insert(curatedRoutes)
      .values(values)
      .onConflictDoUpdate({ target: curatedRoutes.id, set: values })
      .returning();
    return routeFromRow(row);
  }

  async deleteRoute(id: string) {
    const rows = await this.db.delete(curatedRoutes).where(eq(curatedRoutes.id, id)).returning({ id: curatedRoutes.id });
    return rows.length > 0;
  }

  async replaceAll(data: Partial<DatabaseSnapshot>) {
    await this.db.transaction(async (tx) => {
      if (data.destinations) {
        await tx.delete(countries);
        if (data.destinations.length) await tx.insert(countries).values(data.destinations.map(countryToRow));
      }
      if (data.transitHubs) {
        await tx.delete(transitHubs);
        if (data.transitHubs.length) await tx.insert(transitHubs).values(data.transitHubs.map(hubToRow));
      }
      if (data.routes) {
        await tx.delete(curatedRoutes);
        if (data.routes.length) await tx.insert(curatedRoutes).values(data.routes.map(routeToRow));
      }
    });
  }
}

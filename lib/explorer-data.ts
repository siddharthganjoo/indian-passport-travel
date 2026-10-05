import 'server-only';
import { getAllDestinations } from '@/lib/db';
import type { ExplorerCountry } from '@/components/visa/visa-explorer';

/** The slim per-country shape the visa map/list needs on the client. */
export async function getExplorerCountries(): Promise<ExplorerCountry[]> {
  const destinations = await getAllDestinations();
  return destinations.map((d) => ({
    countryCode: d.countryCode,
    countryName: d.countryName,
    continent: d.continent,
    defaultCategory: d.defaultCategory,
    processingTimeDays: d.processingTimeDays,
    baseFeeUsd: d.baseFeeUsd,
    baseFeeInr: d.baseFeeInr,
    stayDurationDays: d.stayDurationDays,
    conditionalUpgrades: d.conditionalUpgrades,
    isSchengen: d.isSchengen,
    officialPortalUrl: d.officialPortalUrl,
    capitalCity: d.capitalCity,
    popularAirports: [],
    bestTimeToVisit: '',
    tagline: '',
    requiredDocuments: [],
    lastVerifiedAt: d.lastVerifiedAt,
  }));
}

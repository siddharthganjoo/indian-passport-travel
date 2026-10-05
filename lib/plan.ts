import 'server-only';
import type { PlanQuery, PlanResult } from '@/types/plan';
import type { HeldVisa } from '@/types/visa';
import { getAllDestinations, getAllSmartRoutes, getAllTransitHubs } from '@/lib/db';
import { getLiveProvider, getScanProvider, searchFares } from '@/lib/flights';
import { getFxRates } from '@/lib/fx-server';
import { planTrip } from '@/lib/route-engine';
import type { PlanSearchParams } from '@/lib/schemas';

export function toPlanQuery(p: PlanSearchParams): PlanQuery {
  return {
    origin: p.from,
    destinationCountry: p.to,
    destinationAirport: p.airport,
    date: p.date,
    adults: p.adults,
    heldVisas: p.visas as HeldVisa[],
  };
}

/** Run the planner against the configured database, price source and FX rates. */
export async function runPlan(query: PlanQuery): Promise<PlanResult> {
  const provider = getScanProvider();
  const [countries, hubs, curated, rates] = await Promise.all([
    getAllDestinations(),
    getAllTransitHubs(),
    getAllSmartRoutes(),
    getFxRates(),
  ]);
  return planTrip(query, {
    countries,
    hubs,
    curated,
    rates,
    search: (q) => searchFares(provider, q),
    priceSource: provider.name,
    liveCheckAvailable: getLiveProvider() !== null,
  });
}

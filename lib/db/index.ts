import 'server-only';
import type { CountryVisaProfile } from '@/types/visa';
import type { SmartRouteHack, TransitHubProfile } from '@/types/routes';
import { JsonStore } from './json-store';
import type { DatabaseSnapshot, Store } from './store';

export { ReadOnlyStoreError } from './store';
export type { DatabaseSnapshot } from './store';

let store: Store | null = null;

/**
 * Postgres (Supabase) when DATABASE_URL is set; otherwise the JSON files in
 * data/ — writable in development, read-only in production.
 */
export async function getStore(): Promise<Store> {
  if (store) return store;
  const url = process.env.DATABASE_URL;
  if (url) {
    const [{ default: postgres }, { drizzle }, { PgStore }] = await Promise.all([
      import('postgres'),
      import('drizzle-orm/postgres-js'),
      import('./pg-store'),
    ]);
    // prepare:false is required for Supabase's transaction pooler (port 6543).
    const client = postgres(url, { prepare: false, max: 5 });
    store = new PgStore(drizzle(client));
  } else {
    const writable = process.env.NODE_ENV !== 'production' || process.env.ALLOW_JSON_WRITES === 'true';
    store = new JsonStore(writable);
  }
  return store;
}

export async function getStorageInfo() {
  const s = await getStore();
  return { kind: s.kind, writable: s.writable };
}

/* ── Countries ─────────────────────────────────────────────────────────────── */

export async function getAllDestinations(): Promise<CountryVisaProfile[]> {
  return (await getStore()).listCountries();
}

export async function getDestinationByCode(code: string): Promise<CountryVisaProfile | undefined> {
  return (await getStore()).getCountry(code);
}

export async function saveDestination(country: CountryVisaProfile): Promise<CountryVisaProfile> {
  return (await getStore()).upsertCountry(country);
}

export async function deleteDestination(code: string): Promise<boolean> {
  return (await getStore()).deleteCountry(code);
}

export async function markDestinationVerified(code: string): Promise<CountryVisaProfile | undefined> {
  const s = await getStore();
  const country = await s.getCountry(code);
  if (!country) return undefined;
  return s.upsertCountry({ ...country, lastVerifiedAt: new Date().toISOString() });
}

/* ── Curated routes ────────────────────────────────────────────────────────── */

export async function getAllSmartRoutes(): Promise<SmartRouteHack[]> {
  return (await getStore()).listRoutes();
}

export async function getSmartRoutesForDestination(code: string): Promise<SmartRouteHack[]> {
  const upper = code.toUpperCase();
  return (await getAllSmartRoutes()).filter((r) => r.destinationCountryCode.toUpperCase() === upper);
}

export async function saveSmartRoute(route: SmartRouteHack): Promise<SmartRouteHack> {
  const id = route.id || `route-${route.destinationCountryCode.toLowerCase()}-${route.hubIata.toLowerCase()}-${Date.now()}`;
  return (await getStore()).upsertRoute({ ...route, id, verifiedDate: route.verifiedDate || new Date().toISOString().slice(0, 10) });
}

export async function deleteSmartRoute(id: string): Promise<boolean> {
  return (await getStore()).deleteRoute(id);
}

/* ── Transit hubs ──────────────────────────────────────────────────────────── */

export async function getAllTransitHubs(): Promise<TransitHubProfile[]> {
  return (await getStore()).listHubs();
}

export async function getTransitHubByCode(code: string): Promise<TransitHubProfile | undefined> {
  const upper = code.toUpperCase();
  return (await getAllTransitHubs()).find((h) => h.code === upper);
}

export async function saveTransitHub(hub: TransitHubProfile): Promise<TransitHubProfile> {
  return (await getStore()).upsertHub(hub);
}

export async function deleteTransitHub(code: string): Promise<boolean> {
  return (await getStore()).deleteHub(code);
}

export async function markHubVerified(code: string): Promise<TransitHubProfile | undefined> {
  const hub = await getTransitHubByCode(code);
  if (!hub) return undefined;
  return saveTransitHub({ ...hub, lastVerifiedAt: new Date().toISOString() });
}

/* ── Backup & restore ──────────────────────────────────────────────────────── */

export async function exportDatabase(): Promise<DatabaseSnapshot & { exportedAt: string; version: string }> {
  const s = await getStore();
  const [destinations, routes, transitHubs] = await Promise.all([s.listCountries(), s.listRoutes(), s.listHubs()]);
  return { exportedAt: new Date().toISOString(), version: '2.0.0', destinations, routes, transitHubs };
}

export async function importDatabase(data: Partial<DatabaseSnapshot>): Promise<void> {
  await (await getStore()).replaceAll(data);
}

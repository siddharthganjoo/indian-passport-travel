import type { CountryVisaProfile } from '@/types/visa';
import type { SmartRouteHack, TransitHubProfile } from '@/types/routes';

export interface DatabaseSnapshot {
  destinations: CountryVisaProfile[];
  routes: SmartRouteHack[];
  transitHubs: TransitHubProfile[];
}

/** Persistence backend. Implemented by Postgres (production) and JSON files (local dev). */
export interface Store {
  readonly kind: 'postgres' | 'json';
  readonly writable: boolean;

  listCountries(): Promise<CountryVisaProfile[]>;
  getCountry(code: string): Promise<CountryVisaProfile | undefined>;
  upsertCountry(country: CountryVisaProfile): Promise<CountryVisaProfile>;
  deleteCountry(code: string): Promise<boolean>;

  listHubs(): Promise<TransitHubProfile[]>;
  upsertHub(hub: TransitHubProfile): Promise<TransitHubProfile>;
  deleteHub(code: string): Promise<boolean>;

  listRoutes(): Promise<SmartRouteHack[]>;
  upsertRoute(route: SmartRouteHack): Promise<SmartRouteHack>;
  deleteRoute(id: string): Promise<boolean>;

  /** Replace whole collections (backup restore). Omitted collections are left untouched. */
  replaceAll(data: Partial<DatabaseSnapshot>): Promise<void>;
}

export class ReadOnlyStoreError extends Error {
  constructor() {
    super('Storage is read-only. Set DATABASE_URL to enable edits in production.');
    this.name = 'ReadOnlyStoreError';
  }
}

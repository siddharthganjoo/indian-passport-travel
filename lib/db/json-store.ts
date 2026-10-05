import fs from 'fs/promises';
import path from 'path';
import type { CountryVisaProfile } from '@/types/visa';
import type { SmartRouteHack, TransitHubProfile } from '@/types/routes';
import bundledDestinations from '@/data/destinations.json';
import bundledRoutes from '@/data/smart-routes.json';
import bundledHubs from '@/data/transit-hubs.json';
import { ReadOnlyStoreError, type DatabaseSnapshot, type Store } from './store';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILES = {
  destinations: path.join(DATA_DIR, 'destinations.json'),
  routes: path.join(DATA_DIR, 'smart-routes.json'),
  transitHubs: path.join(DATA_DIR, 'transit-hubs.json'),
} as const;

const BUNDLED: DatabaseSnapshot = {
  destinations: bundledDestinations as CountryVisaProfile[],
  routes: bundledRoutes as SmartRouteHack[],
  transitHubs: bundledHubs as TransitHubProfile[],
};

type Key = keyof DatabaseSnapshot;

/**
 * File-backed store for local development (and a read-only fallback in
 * production, where serverless filesystems are ephemeral).
 */
export class JsonStore implements Store {
  readonly kind = 'json' as const;
  private cache: Partial<DatabaseSnapshot> = {};

  constructor(readonly writable: boolean) {}

  private async read<K extends Key>(key: K): Promise<DatabaseSnapshot[K]> {
    const hit = this.cache[key];
    if (hit) return hit;
    let data: DatabaseSnapshot[K];
    try {
      data = JSON.parse(await fs.readFile(FILES[key], 'utf-8'));
    } catch {
      data = BUNDLED[key];
    }
    this.cache[key] = data;
    return data;
  }

  private async write<K extends Key>(key: K, data: DatabaseSnapshot[K]): Promise<void> {
    if (!this.writable) throw new ReadOnlyStoreError();
    await fs.writeFile(FILES[key], JSON.stringify(data, null, 2) + '\n', 'utf-8');
    this.cache[key] = data;
  }

  async listCountries() {
    return this.read('destinations');
  }

  async getCountry(code: string) {
    const upper = code.toUpperCase();
    return (await this.read('destinations')).find((d) => d.countryCode === upper);
  }

  async upsertCountry(country: CountryVisaProfile) {
    const list = await this.read('destinations');
    const item = { ...country, countryCode: country.countryCode.toUpperCase(), lastUpdated: new Date().toISOString() };
    const next = list.some((d) => d.countryCode === item.countryCode)
      ? list.map((d) => (d.countryCode === item.countryCode ? item : d))
      : [...list, item].sort((a, b) => a.countryName.localeCompare(b.countryName));
    await this.write('destinations', next);
    return item;
  }

  async deleteCountry(code: string) {
    const list = await this.read('destinations');
    const next = list.filter((d) => d.countryCode !== code.toUpperCase());
    if (next.length === list.length) return false;
    await this.write('destinations', next);
    return true;
  }

  async listHubs() {
    return this.read('transitHubs');
  }

  async upsertHub(hub: TransitHubProfile) {
    const list = await this.read('transitHubs');
    const item = { ...hub, code: hub.code.toUpperCase() };
    const next = list.some((h) => h.code === item.code)
      ? list.map((h) => (h.code === item.code ? item : h))
      : [...list, item];
    await this.write('transitHubs', next);
    return item;
  }

  async deleteHub(code: string) {
    const list = await this.read('transitHubs');
    const next = list.filter((h) => h.code !== code.toUpperCase());
    if (next.length === list.length) return false;
    await this.write('transitHubs', next);
    return true;
  }

  async listRoutes() {
    return this.read('routes');
  }

  async upsertRoute(route: SmartRouteHack) {
    const list = await this.read('routes');
    const next = list.some((r) => r.id === route.id)
      ? list.map((r) => (r.id === route.id ? route : r))
      : [route, ...list];
    await this.write('routes', next);
    return route;
  }

  async deleteRoute(id: string) {
    const list = await this.read('routes');
    const next = list.filter((r) => r.id !== id);
    if (next.length === list.length) return false;
    await this.write('routes', next);
    return true;
  }

  async replaceAll(data: Partial<DatabaseSnapshot>) {
    if (data.destinations) await this.write('destinations', data.destinations);
    if (data.routes) await this.write('routes', data.routes);
    if (data.transitHubs) await this.write('transitHubs', data.transitHubs);
  }
}

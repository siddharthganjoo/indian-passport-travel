/**
 * Create tables and load the JSON dataset into Postgres (e.g. Supabase).
 *
 *   DATABASE_URL=postgres://... npx tsx scripts/db-setup.ts           # migrate + seed empty tables
 *   DATABASE_URL=postgres://... npx tsx scripts/db-setup.ts --force   # overwrite existing rows from JSON
 */
import path from 'node:path';
import fs from 'node:fs';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { PgStore } from '../lib/db/pg-store';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
  }
  const force = process.argv.includes('--force');
  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(client);

  await migrate(db, { migrationsFolder: path.join(__dirname, '..', 'drizzle') });
  console.log('✓ migrations applied');

  const store = new PgStore(db);
  const existing = await store.listCountries();
  if (existing.length && !force) {
    console.log(`Tables already contain ${existing.length} countries — skipping seed (use --force to overwrite).`);
  } else {
    const read = (f: string) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', f), 'utf-8'));
    await store.replaceAll({
      destinations: read('destinations.json'),
      transitHubs: read('transit-hubs.json'),
      routes: read('smart-routes.json'),
    });
    const [c, h, r] = await Promise.all([store.listCountries(), store.listHubs(), store.listRoutes()]);
    console.log(`✓ seeded ${c.length} countries, ${h.length} hubs, ${r.length} curated routes`);
  }
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

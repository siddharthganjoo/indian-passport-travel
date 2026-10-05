# jugo

Flight and visa planning for Indian passport holders. Enter where you're flying from, where you want to go and when. jugo then compares:

- **Single tickets**: non-stop, or one stop on one booking.
- **Self-transfer routes through hubs**: for example DEL → Istanbul → São Paulo on two separate tickets.

For every option it adds up **fares, checked-bag fees, visa fees and layover costs**. It works out totals both **with and without a checked bag**, because that choice changes which visa you need at the stopover:

- **Cabin bag only:** you can often stay airside and need no visa at the stop.
- **With a checked bag:** you must collect it, clear immigration and re-check it, so you need the stop country's visa.

## Features

| Page | What it does |
|---|---|
| `/` | Search: from (Indian airport), to (country), date, bag choice, and which visas you already hold (US / UK / Schengen) |
| `/plan` | Ranked routes, a cost chart (cabin-only vs. checked bag, split into flights / bags / visas / layover), and a visa checklist with apply-by dates for every country on the route |
| `/visas` | Entry rules for 193 countries, filterable, updating live as you tick the visas you hold |
| `/destination/[code]` | Per-country guide: entry type, stay, fee, processing time, waivers, how to apply, documents checklist |
| `/transit-hubs` | Airside, self-transfer and transit-visa rules at 14 hubs |
| `/admin` | Edit countries, hubs and route ideas; review queue with "Mark verified"; JSON backup and restore |

## How it works

```
lib/route-engine.ts   planTrip(): single tickets + self-transfers via hubs → visa check per stop → costs per bag mode
lib/visa-engine.ts    resolveVisaRequirements(): best waiver from held visas; Schengen/US/UK visas cover their own countries
lib/flights/          price sources behind one FlightProvider interface
  travelpayouts.ts      cached cheapest fares (used to scan many legs)
  duffel.ts             live price + exact baggage (only on "Check live price & bags")
  sample.ts             deterministic sample fares when no key is set (labelled "Sample prices" in the UI)
lib/db/               storage: Postgres via Drizzle when DATABASE_URL is set, else the JSON files in data/
data/                 destinations.json (193 countries), transit-hubs.json, smart-routes.json, airports.ts, airlines.ts
```

The planner's rules (minimum self-transfer time, maximum detour, layover cost, apply-by buffers) are in `RULES` in `lib/route-engine.ts`.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000 — works with no keys (JSON data + sample fares)
npm test             # vitest: engines, providers, Postgres store (via PGlite), admin auth
```

### Going live

1. **Database:** create a Supabase project and put its pooler connection string in `DATABASE_URL`. Then run:
   ```bash
   npm run db:setup     # creates tables and loads data/*.json
   ```
2. **Prices:** set `TRAVELPAYOUTS_TOKEN` and `TRAVELPAYOUTS_MARKER` (affiliate). Optionally set `DUFFEL_API_TOKEN` for live checks with exact baggage.
3. **Admin:** set `ADMIN_PASSWORD`. Without it, `/admin` is disabled in production.
4. **Caching:** set the `UPSTASH_REDIS_*` variables for a shared fare cache and rate limiting. Otherwise an in-memory fallback is used.

See `.env.example` for every variable.

## Visa data: please read

- 38 countries have hand-written profiles. The other ~155 were seeded from public sources by `scripts/build-dataset.ts`, using generic document lists and steps for each visa type.
- **No record is verified yet** (`lastVerifiedAt: null`), and the site labels them "Not yet verified".
- Use **/admin → Needs review** to check each country against its official portal and click **Mark verified**.
- Records go stale after 90 days.

To change the dataset in bulk, edit `data/seed/world-baseline.ts` or `data/destinations.json`. Then run `npm run data:build`; it is safe to re-run.

## Scripts

| Script | Purpose |
|---|---|
| `npm run data:build` | Merge the world baseline into `data/*.json` (idempotent) |
| `npm run db:generate` | Generate a migration after editing `lib/db/schema.ts` |
| `npm run db:setup` | Apply migrations and seed Postgres (`-- --force` to overwrite) |
| `npm run typecheck` / `npm test` | Checks |

jugo is not a visa agency or airline. Rules change, so always confirm on official government websites.

# jugo data: where it lives and how to maintain it

## 1. Where the data is

jugo stores three kinds of records. The same records live in one of two places, depending on whether a database is connected.

| Record | What it is | Count today |
|---|---|---|
| **Countries** | Visa rules for Indian passports: entry type, stay, fee, processing days, documents, steps, waivers for US/UK/Schengen visa holders, official link, "last verified" date | 193 |
| **Transit hubs** | Rules at connecting airports: airside transit, self-transfer, transit visa, warnings | 14 |
| **Route ideas** | Editor-picked "via a hub" routes shown on the home page and in results | 7 |

### Right now (no database connected): JSON files in the project

```
data/destinations.json    ← countries
data/transit-hubs.json    ← transit hubs
data/smart-routes.json    ← route ideas
```

- When you run the site on your computer (`npm run dev`), editing in `/admin` **writes straight into these files**.
- Commit and push them to keep the changes.
- On a live server without a database these files are **read-only**, and `/admin` shows a warning banner.

### When live: Supabase (Postgres)

Set `DATABASE_URL` and the site reads and writes Supabase instead of the JSON files. The tables are:

| Table | Holds |
|---|---|
| `countries` | One row per country. Searchable columns: category, fee, stay, processing days, `last_verified_at`. Lists (documents, steps, waivers) are stored as JSON. |
| `transit_hubs` | One row per airport (IST, DXB, …) |
| `curated_routes` | One row per route idea |

The table definitions are in `lib/db/schema.ts`; the SQL migrations are in `drizzle/`.

### Reference data in code (rarely changes; edit and redeploy)

| File | Holds |
|---|---|
| `data/airports.ts` | Airports with coordinates and time zones |
| `data/airlines.ts` | Typical cabin and checked-bag allowance and bag fees per airline |
| `data/world-map.json` | World map shapes |

**Flight prices are not stored.** They come live from Travelpayouts and Duffel and are cached for a few hours.

---

## 2. Going live with Supabase (one time, ~15 minutes)

1. **Create a project** at <https://supabase.com>. Choose the **Mumbai (ap-south-1)** region so it's close to your users.
2. **Copy the connection string.** In Supabase go to **Project Settings → Database → Connection string → Transaction pooler**; it uses port **6543**.
3. **Add it to your environment.** Put it in `.env.local` on your computer, and in your hosting dashboard (e.g. Vercel → Settings → Environment Variables):
   ```
   DATABASE_URL=postgres://postgres.xxxx:YOUR-PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ADMIN_PASSWORD=choose-a-long-password
   ```
4. **Create the tables and load the data.** Run this once from the project folder:
   ```bash
   npm run db:setup
   ```
   It prints `✓ seeded 193 countries, 14 hubs, 7 curated routes`.
5. **Redeploy.** From now on `/admin` edits save to Supabase.

> Running `npm run db:setup` again is safe. It skips loading if the tables already have data. Use `npm run db:setup -- --force` only if you want to **overwrite** the database with the JSON files.

---

## 3. Everyday maintenance

### Where to edit
- Go to **`https://your-site/admin`** and log in with `ADMIN_USER` (default `admin`) and `ADMIN_PASSWORD`.
- You can also edit rows directly in the Supabase **Table Editor**, but `/admin` is safer because it validates every field.

### Verifying a country (the most important job)

Every country starts as **Not verified**, and the site shows that to visitors. To verify one:

1. In `/admin` → **Countries**, click **Needs review**.
2. Open a country (pencil icon).
3. Open its official visa website in another tab and compare:
   - entry type (visa-free / on arrival / eVisa / embassy)
   - stay (days)
   - fee (USD and INR)
   - processing days (min–max)
   - waivers for US, Schengen or UK visa holders
   - documents and steps
4. Paste the page you checked into **Source checked**.
5. Click **Save & mark verified**.

The country now shows "Checked <date>" on the site. After **90 days** it counts as **stale** and returns to *Needs review*.

**Suggested rhythm:**
- **Weekly:** the 20 most-searched countries.
- **Monthly:** everything in *Needs review*.
- **Immediately:** when news breaks, for example a country adding visa-free entry for Indians.

### Transit hubs
- `/admin` → **Transit Hubs**: **Mark verified** or delete.
- To add or change a hub's details, edit it in Supabase (`transit_hubs`), or edit `data/transit-hubs.json` and import it (see Backups).
- Keep these three fields accurate. The route planner uses them to decide whether a traveller needs a visa at the stop:
  - `transitVisaNeededForIndians`
  - `transitVisaExemptWith` (which held visas waive it)
  - `airsideSelfTransfer` (can you change between separate tickets without entering the country?)

### Route ideas
- `/admin` → **Smart Route Hacks**: add, edit or delete.
- The fares there are your editorial "typical" prices. Live prices always come from the flight APIs.

### Adding a new country
- `/admin` → **Add New Country**.
- The **Popular Airports** codes must exist in `data/airports.ts`, otherwise the planner can't route there. Add the airport there first: IATA code, name, city, country, latitude/longitude, time zone.

---

## 4. Backups

- **Download:** `/admin` → **Backup & Sync** → **Download JSON Backup**. This is one file with everything. Do it before big edits, and weekly.
- **Restore:** same tab → **Import / Restore**. This **replaces** the collections in the file. Every record is validated before anything is written.
- **Supabase also backs up daily** on paid plans (Project Settings → Backups).
- **Keep git in sync:** after a busy editing week, download the backup and copy its three arrays into the `data/*.json` files, then commit. Local development then shows the same data as live.

---

## 5. Bulk changes

- **Many countries at once:** edit `data/seed/world-baseline.ts`, or `data/destinations.json` directly, then run:
  ```bash
  npm run data:build                 # merges the baseline into data/*.json (safe to re-run)
  npm run db:setup -- --force        # push the JSON into Supabase (overwrites!)
  ```
- **Changing the table structure:** edit `lib/db/schema.ts`, then run:
  ```bash
  npm run db:generate                # creates a new migration in drizzle/
  npm run db:setup                   # applies it
  ```

---

## 6. Quick answers

- **"I edited in /admin but the live site didn't change."** Pages refresh within about 5 minutes. Also check the admin banner: if it says *Read-only*, `DATABASE_URL` isn't set on the server.
- **"Can I edit Supabase directly?"** Yes. Keep `category` to one of `visa_free`, `voa`, `evisa`, `sticker_required`. Set `last_verified_at` to the date you checked.
- **"Where are user searches stored?"** Nowhere. jugo has no user accounts and does not store searches.
- **"What if Supabase is down?"** Pages that already rendered keep being served from cache. New searches fail until it's back.

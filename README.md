# DesiVisa: Indian Passport Travel & Visa Metasearch Platform

An editorial-grade travel discovery and visa intelligence platform built exclusively for Indian passport holders. Designed with high-contrast minimalism, dynamic conditional waiver algorithms, live flight aggregations from Indian metropolitan hubs, and full compliance with 20 production standards.

---

## 🏛 System Architecture & Tech Stack

```
                          ┌─────────────────────────────────┐
                          │         Next.js App Router       │
                          │   (Tailwind CSS + motion/react) │
                          └────────────────┬────────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    ▼                                             ▼
        ┌───────────────────────┐                     ┌───────────────────────┐
        │  Visa Engine Router   │                     │  Flight Aggregator    │
        │  (Static JSON/Cache)  │                     │  (Server Actions API) │
        └───────────┬───────────┘                     └───────────┬───────────┘
                    │                                             │
                    ▼                                             ▼
        ┌───────────────────────┐                     ┌───────────────────────┐
        │ Destination Filtering │                     │ Amadeus / Duffel      │
        │ Matrix (PostgreSQL)   │                     │ Flight Low-Fare API   │
        └───────────────────────┘                     └───────────────────────┘
```

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 19, TypeScript strict mode).
- **Styling**: Tailwind CSS v4 + Radix UI primitives.
- **Design Language (Manus.im)**: Monochrome base (`#09090b` / `#ffffff`), 1px subtle borders (`border-zinc-200` / `border-zinc-800`), wide editorial margins, generous whitespace, Inter typography hierarchy.
- **Micro-Interactions (Kokonut UI)**: Interactive pill selectors with spring physics (`transition={{ type: "spring", stiffness: 350, damping: 25 }}`), floating auto-complete search with `⌘K`, animated cookie consent modal, interactive document checklists.
- **Charts (Bklit UI / shadcn style)**: Custom SVG low-fare sparklines on destination cards and 12-month low-fare area trend distributions on country detail views.
- **Animation**: `motion` (`motion/react`) with shared layout transitions (`layoutId="activeTab"`).
- **Caching & Rate Limiting**: Upstash Redis rate-limiter (20 searches/min per IP) and flight fare snapshot caching with in-memory fallbacks.

---

## ⚡ Dynamic Conditional Visa Resolution Engine

Indian passport holders often hold valid visas for the **United States**, **Schengen Area**, or the **United Kingdom**. Many countries waive traditional sticker visa applications in favor of instant eVisas or Visa on Arrival (VoA) when these secondary visas are held.

Our resolution engine (`lib/visa-engine.ts`) calculates effective entry categories in real-time:

```typescript
export function resolveVisaRequirements(
  country: CountryVisaProfile,
  user: UserVisaProfile
): ResolvedVisaRequirements
```

### Supported Relaxation Examples
- **Turkey**: Sticker Required → **Instant eVisa** with valid US / Schengen / UK visa.
- **UAE**: Standard eVisa → **14-day Visa on Arrival** at DXB/AUH for US / Schengen / UK visa holders.
- **Georgia**: eVisa → **90-day 100% Visa-Free** entry for US / Schengen / UK visa holders.
- **Philippines**: eVisa → **14-day Visa-Free** entry under AJACSSUK bilateral rules.
- **Mexico**: Sticker Required → **180-day Visa-Free** entry with physical US / Schengen / UK visa.
- **Oman**: eVisa → **14-day Visa-Free** stay for US / Schengen / UK visa holders.
- **Albania**: eVisa → **90-day Visa-Free** stay for multiple-entry US / Schengen / UK visa holders.

---

## 📋 20-Point Production Standards Compliance

| # | Standard | Implementation Details |
|---|---|---|
| 1 | **Privacy Policy Page** | Route `/privacy`: Strict compliance with India's DPDP Act & GDPR, zero passport number retention guarantee. |
| 2 | **Terms & Conditions Page** | Route `/terms`: Explicit legal disclaimers; platform is not a visa agency and holds no liability for denied entry. |
| 3 | **Secrets Off the Frontend** | Audit verified: no sensitive keys prefixed with `NEXT_PUBLIC_`. All API integrations run in server route handlers. |
| 4 | **Force HTTPS & Security Headers** | HSTS (`max-age=63072000; includeSubDomains; preload`), `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`. |
| 5 | **Cookie Consent Banner** | Kokonut-styled fixed bottom modal with granular consent toggles (Essential, Analytics, Marketing) and `localStorage`. |
| 6 | **Meta Titles & Descriptions** | Dynamic OpenGraph metadata via `generateMetadata()` on every route (`/`, `/destination/[code]`, `/privacy`, `/terms`). |
| 7 | **Social Preview Image (OG)** | Dynamic `app/opengraph-image.tsx` using `@vercel/og` ImageResponse with destination flags, visa badge, and starting fares. |
| 8 | **Favicon Set** | Minimalist passport compass icon set: `app/icon.svg` and `public/icon.svg`. |
| 9 | **Sitemap & robots.txt** | Dynamic `app/sitemap.ts` listing all 40+ destinations; `app/robots.ts` disallowing `/api/*`. |
| 10 | **Alt Text on Images** | Descriptive accessibility alt attributes on all `next/image` components. |
| 11 | **Compress Images** | Configured `next.config.mjs` with AVIF/WebP formats and `minimumCacheTTL: 86400`. |
| 12 | **Page Load Speed** | Font preloading with `next/font/google`, React Suspense streaming boundaries, zero CLS. |
| 13 | **Fix Color Contrast** | WCAG AA compliance (4.5:1 ratio) with zinc/slate monochrome palette across light & dark modes. |
| 14 | **Mobile-First Responsiveness** | Fluid scaling across 375px (iPhone mini), 430px (Pro Max), and desktop viewports without horizontal overflow. |
| 15 | **Custom 404 Page** | Route `app/not-found.tsx`: Kokonut-styled animated layout with search recovery bar and home return CTA. |
| 16 | **Fix Broken Links** | All internal links and outbound official government immigration portals verified. |
| 17 | **Form Validation** | Flight search powered by `react-hook-form` and `zod` schema enforcing 3-letter uppercase IATA codes and valid dates. |
| 18 | **Spam & Rate Limiting** | Edge route protection via `@upstash/ratelimit` sliding window (20 searches/min per IP) with in-memory fallback. |
| 19 | **Set Up Analytics** | Privacy-focused telemetry in `lib/analytics.ts` with zero client-side tracking cookie bloat. |
| 20 | **Clear Call to Action (CTA)** | Unambiguous primary interactions: *"Explore Destinations by Visa Status"*, *"Go to Official Visa Portal"*, *"View Flights on Skyscanner"*. |

---

## 🛫 Departure Hubs Supported

The flight aggregation engine searches multi-city routes and seasonal pricing from major Indian international airports:
- **DEL**: Indira Gandhi International Airport (New Delhi)
- **BOM**: Chhatrapati Shivaji Maharaj International Airport (Mumbai)
- **BLR**: Kempegowda International Airport (Bengaluru)
- **MAA**: Chennai International Airport (Chennai)
- **HYD**: Rajiv Gandhi International Airport (Hyderabad)
- **CCU**: Netaji Subhash Chandra Bose International Airport (Kolkata)
- **COK**: Cochin International Airport (Kochi)

---

## 🛠 Local Development

```bash
# Clone the repository
git clone https://github.com/siddharthganjoo/indian-passport-travel.git
cd indian-passport-travel

# Install dependencies
npm install

# Configure environment variables (optional)
cp .env.example .env.local

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## ⚖️ License & Disclaimer

MIT License. Designed and engineered for Indian international travelers. Visa rules are volatile; travelers must always verify conditions on official sovereign immigration portals prior to departure.

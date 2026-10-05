/**
 * Builds data/destinations.json and data/transit-hubs.json from the curated
 * profiles plus the world baseline. Idempotent — safe to re-run; existing
 * entries are never duplicated and hand-edited fields are preserved.
 *
 *   npx tsx scripts/build-dataset.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import type { CountryVisaProfile, ConditionalPassRules, HeldVisa } from '../types/visa';
import type { TransitHubProfile } from '../types/routes';
import { WORLD_BASELINE } from '../data/seed/world-baseline';
import { GENERIC_DOCUMENTS, GENERIC_STEPS } from '../lib/visa-content';
import { DEFAULT_USD_INR } from '../lib/fx';

const DATA_DIR = path.join(__dirname, '..', 'data');
const DEST_FILE = path.join(DATA_DIR, 'destinations.json');
const HUBS_FILE = path.join(DATA_DIR, 'transit-hubs.json');

const readJson = <T>(file: string): T => JSON.parse(fs.readFileSync(file, 'utf-8')) as T;
const writeJson = (file: string, data: unknown) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
const toInr = (usd: number) => Math.round((usd * DEFAULT_USD_INR) / 10) * 10;

const WAIVER_KEY: Record<HeldVisa, keyof ConditionalPassRules> = {
  US: 'validUSVisaHolder',
  UK: 'validUKVisaHolder',
  Schengen: 'validSchengenHolder',
};

// ── Countries ────────────────────────────────────────────────────────────────
const destinations = readJson<CountryVisaProfile[]>(DEST_FILE);
const byCode = new Map(destinations.map((d) => [d.countryCode, d]));

// Corrections to the curated set.
const SCHENGEN_CURATED = new Set(['FR', 'IS']);
for (const d of destinations) {
  if (SCHENGEN_CURATED.has(d.countryCode)) d.isSchengen = true;
  if (!d.applicationSteps?.length) d.applicationSteps = GENERIC_STEPS[d.defaultCategory];
  if (d.lastVerifiedAt === undefined) d.lastVerifiedAt = null;
}
const kenya = byCode.get('KE');
if (kenya && kenya.defaultCategory === 'visa_free') {
  // Kenya replaced visas with a paid Electronic Travel Authorisation (eTA) in 2024.
  kenya.defaultCategory = 'evisa';
  kenya.applicationSteps = GENERIC_STEPS.evisa;
}

let added = 0;
for (const [code, name, continent, capital, category, stay, feeUsd, pMin, pMax, url, airports, extras] of WORLD_BASELINE) {
  if (byCode.has(code)) continue;
  const conditionalUpgrades: ConditionalPassRules = {};
  for (const [held, waiver] of Object.entries(extras?.waivers ?? {}) as [HeldVisa, [CountryVisaProfile['defaultCategory'], number, number?]][]) {
    const [eligibleCategory, allowedStayDays, specialFeeUsd] = waiver;
    if (eligibleCategory === 'sticker_required') continue;
    conditionalUpgrades[WAIVER_KEY[held]] = {
      eligibleCategory,
      allowedStayDays,
      ...(specialFeeUsd !== undefined ? { specialFeeUsd } : { specialFeeUsd: 0 }),
      conditionNotes: `Holders of a valid ${held === 'Schengen' ? 'Schengen' : held} visa qualify for ${eligibleCategory === 'visa_free' ? 'visa-free entry' : eligibleCategory === 'evisa' ? 'an eVisa' : 'visa on arrival'} (${allowedStayDays} days). The visa usually must be multiple-entry and valid for your whole stay.`,
    };
  }
  const profile: CountryVisaProfile = {
    countryCode: code,
    countryName: name,
    continent,
    defaultCategory: category,
    processingTimeDays: { min: pMin, max: pMax },
    baseFeeUsd: feeUsd,
    baseFeeInr: toInr(feeUsd),
    stayDurationDays: stay,
    conditionalUpgrades,
    requiredDocuments: GENERIC_DOCUMENTS[category],
    applicationSteps: GENERIC_STEPS[category],
    officialPortalUrl: url,
    ...(extras?.schengen ? { isSchengen: true } : {}),
    capitalCity: capital,
    popularAirports: airports.split(' '),
    bestTimeToVisit: '',
    tagline: extras?.note ?? '',
    lastVerifiedAt: null,
  };
  destinations.push(profile);
  byCode.set(code, profile);
  added++;
}

destinations.sort((a, b) => a.countryName.localeCompare(b.countryName));
writeJson(DEST_FILE, destinations);
console.log(`destinations.json: ${destinations.length} countries (${added} added)`);

// ── Transit hubs ─────────────────────────────────────────────────────────────
const hubs = readJson<TransitHubProfile[]>(HUBS_FILE);
const ALL_HELD: HeldVisa[] = ['US', 'Schengen', 'UK'];

const HUB_PATCHES: Record<string, Partial<TransitHubProfile>> = {
  IST: { countryCode: 'TR', airsideSelfTransfer: true },
  ADD: { countryCode: 'ET', airsideSelfTransfer: true },
  DXB: { countryCode: 'AE', airsideSelfTransfer: true },
  DOH: { countryCode: 'QA', airsideSelfTransfer: true },
  KUL: { countryCode: 'MY', airsideSelfTransfer: false },
  SIN: { countryCode: 'SG', airsideSelfTransfer: true },
  LHR: { countryCode: 'GB', airsideSelfTransfer: false, transitVisaExemptWith: ALL_HELD },
  FRA: { countryCode: 'DE', airsideSelfTransfer: false, transitVisaExemptWith: ['US', 'Schengen'] },
};

const NEW_HUBS: TransitHubProfile[] = [
  {
    code: 'AUH', airportName: 'Zayed International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates', countryCode: 'AE', flagEmoji: '🇦🇪',
    airsideTransitAllowed: true, airsideSelfTransfer: false, maxAirsideHours: 24, transitVisaNeededForIndians: false,
    transitVisaType: 'Free airside transit; UAE visa needed to leave the airport', transitVisaCostInr: 0, transitVisaCostUsd: 0,
    terminalChangeRequiresVisa: false, freeStopoverHotelAvailable: true, freeTourAvailable: false, airlineProgramName: 'Etihad Stopover',
    keyAirlines: ['Etihad Airways', 'Air Arabia Abu Dhabi', 'IndiGo', 'Wizz Air Abu Dhabi'],
    rulesSummary: 'Single-ticket connections stay airside with no visa. Separate tickets mean collecting bags and re-checking, which needs a UAE visa (eVisa, or visa on arrival with a valid US/UK/EU visa or residence).',
    criticalWarnings: ['Low-cost carriers here do not interline — a delay on leg 1 means a missed leg 2 with no protection.', 'Allow 4+ hours for a self-transfer with checked bags.'],
    stepByStepGuide: ['Follow "Transfers" signs if on one ticket.', 'For separate tickets: clear immigration with your UAE visa, collect bags, re-check at Departures.'],
    officialPortalUrl: 'https://icp.gov.ae', lastVerifiedAt: null,
  },
  {
    code: 'BKK', airportName: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', countryCode: 'TH', flagEmoji: '🇹🇭',
    airsideTransitAllowed: true, airsideSelfTransfer: true, maxAirsideHours: 12, transitVisaNeededForIndians: false,
    transitVisaType: 'Visa-free entry for Indians', transitVisaCostInr: 0, transitVisaCostUsd: 0,
    terminalChangeRequiresVisa: false, freeStopoverHotelAvailable: false, freeTourAvailable: false,
    keyAirlines: ['Thai Airways', 'IndiGo', 'Air India', 'Thai AirAsia (DMK)'],
    rulesSummary: 'Indians can enter Thailand visa-free, so a landside self-transfer is easy. Fill in the Thailand Digital Arrival Card (TDAC) online within 3 days of arrival.',
    criticalWarnings: ['Bangkok has two airports — AirAsia flies from Don Mueang (DMK), 1+ hour from BKK. Check both legs use the same airport.', 'TDAC is mandatory for every arrival, including self-transfers.'],
    stepByStepGuide: ['Submit TDAC online before landing.', 'Clear immigration, collect bags and re-check at the Departures hall.', 'For DMK connections allow 5+ hours.'],
    officialPortalUrl: 'https://tdac.immigration.go.th', lastVerifiedAt: null,
  },
  {
    code: 'CMB', airportName: 'Bandaranaike International Airport', city: 'Colombo', country: 'Sri Lanka', countryCode: 'LK', flagEmoji: '🇱🇰',
    airsideTransitAllowed: true, airsideSelfTransfer: false, maxAirsideHours: 24, transitVisaNeededForIndians: false,
    transitVisaType: 'Free online ETA for Indians', transitVisaCostInr: 0, transitVisaCostUsd: 0,
    terminalChangeRequiresVisa: false, freeStopoverHotelAvailable: false, freeTourAvailable: false,
    keyAirlines: ['SriLankan Airlines', 'IndiGo', 'Air India'],
    rulesSummary: 'Single-terminal airport. For separate tickets, get the free online ETA and clear immigration to re-check bags.',
    criticalWarnings: ['Apply for the ETA on the official site only — agent sites charge fees.'],
    stepByStepGuide: ['Apply for the Sri Lanka ETA online.', 'Clear immigration, collect bags, re-check at Departures.'],
    officialPortalUrl: 'https://www.eta.gov.lk', lastVerifiedAt: null,
  },
  {
    code: 'MCT', airportName: 'Muscat International Airport', city: 'Muscat', country: 'Oman', countryCode: 'OM', flagEmoji: '🇴🇲',
    airsideTransitAllowed: true, airsideSelfTransfer: false, maxAirsideHours: 24, transitVisaNeededForIndians: false,
    transitVisaType: 'Free airside transit; Oman eVisa to leave the airport', transitVisaCostInr: 0, transitVisaCostUsd: 0,
    terminalChangeRequiresVisa: false, freeStopoverHotelAvailable: false, freeTourAvailable: false,
    keyAirlines: ['Oman Air', 'SalamAir', 'IndiGo'],
    rulesSummary: 'Airside transit is free on one ticket. Separate tickets need an Oman eVisa (Indians holding a valid US/UK/Schengen visa get easier entry).',
    criticalWarnings: ['SalamAir fares are cabin-bag only — add bags when booking.'],
    stepByStepGuide: ['Apply for the Oman eVisa online if self-transferring.', 'Clear immigration, collect bags, re-check at Departures.'],
    officialPortalUrl: 'https://evisa.rop.gov.om', lastVerifiedAt: null,
  },
  {
    code: 'SGN', airportName: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', country: 'Vietnam', countryCode: 'VN', flagEmoji: '🇻🇳',
    airsideTransitAllowed: true, airsideSelfTransfer: false, maxAirsideHours: 24, transitVisaNeededForIndians: false,
    transitVisaType: 'Vietnam eVisa (~US$25) needed for self-transfer', transitVisaCostInr: 2200, transitVisaCostUsd: 25,
    terminalChangeRequiresVisa: true, freeStopoverHotelAvailable: false, freeTourAvailable: false,
    keyAirlines: ['VietJet Air', 'Vietnam Airlines', 'IndiGo'],
    rulesSummary: 'Transfer facilities for separate tickets are limited — plan to enter Vietnam on an eVisa, collect bags and re-check.',
    criticalWarnings: ['VietJet base fares include only 7kg cabin baggage.', 'Apply for the eVisa at least a week ahead.'],
    stepByStepGuide: ['Apply for the Vietnam eVisa on the official portal.', 'Clear immigration, collect bags, re-check at the international terminal.'],
    officialPortalUrl: 'https://evisa.gov.vn', lastVerifiedAt: null,
  },
  {
    code: 'NBO', airportName: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya', countryCode: 'KE', flagEmoji: '🇰🇪',
    airsideTransitAllowed: true, airsideSelfTransfer: false, maxAirsideHours: 24, transitVisaNeededForIndians: false,
    transitVisaType: 'Kenya eTA needed to leave the airport', transitVisaCostInr: 2900, transitVisaCostUsd: 34,
    terminalChangeRequiresVisa: false, freeStopoverHotelAvailable: false, freeTourAvailable: false,
    keyAirlines: ['Kenya Airways', 'IndiGo', 'Air India'],
    rulesSummary: 'Airside transit on one ticket is fine. Self-transfers need the Kenya Electronic Travel Authorisation (eTA).',
    criticalWarnings: ['eTA processing can take up to 3 working days.'],
    stepByStepGuide: ['Apply for the eTA online.', 'Clear immigration, collect bags, re-check at Departures.'],
    officialPortalUrl: 'https://www.etakenya.go.ke', lastVerifiedAt: null,
  },
];

for (const hub of hubs) {
  Object.assign(hub, HUB_PATCHES[hub.code] ?? {});
  hub.transitVisaExemptWith ??= [];
  if (hub.lastVerifiedAt === undefined) hub.lastVerifiedAt = null;
}
const hubCodes = new Set(hubs.map((h) => h.code));
let hubsAdded = 0;
for (const hub of NEW_HUBS) {
  if (hubCodes.has(hub.code)) continue;
  hubs.push(hub);
  hubsAdded++;
}
writeJson(HUBS_FILE, hubs);
console.log(`transit-hubs.json: ${hubs.length} hubs (${hubsAdded} added)`);

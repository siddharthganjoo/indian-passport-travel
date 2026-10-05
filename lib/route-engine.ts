import type { CountryVisaProfile, HeldVisa } from '@/types/visa';
import type { SmartRouteHack, TransitHubProfile } from '@/types/routes';
import type { FareOffer, FareQuery, FareSource } from '@/types/flight';
import type { BagMode, ModeBreakdown, PlanLeg, PlanOption, PlanQuery, PlanResult, VisaStop } from '@/types/plan';
import { profileFromHeld, resolveVisaRequirements, verificationStatus } from '@/lib/visa-engine';
import { GENERIC_DOCUMENTS, GENERIC_STEPS } from '@/lib/visa-content';
import { addDays, airportDistanceKm, distanceKm, getAirport, minutesBetween } from '@/lib/geo';
import { bagFeeForLeg } from '@/data/airlines';
import type { FxRates } from '@/lib/fx';
import { getVisaCategoryLabel } from '@/lib/utils';

export class PlanError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
    this.name = 'PlanError';
  }
}

export interface PlanDeps {
  countries: CountryVisaProfile[];
  hubs: TransitHubProfile[];
  curated: SmartRouteHack[];
  search: (q: FareQuery) => Promise<FareOffer[]>;
  priceSource: FareSource;
  liveCheckAvailable: boolean;
  rates?: FxRates;
  today?: Date;
}

/** Tunables — exported for tests and to keep the rules in one visible place. */
export const RULES = {
  /** Minimum connection between separate tickets (immigration + bag re-check + security). */
  minSelfTransferMinutes: 4 * 60,
  maxLayoverMinutes: 24 * 60,
  /** Hubs adding more than this much distance vs. flying direct are ignored. */
  maxDetourRatio: 1.4,
  maxHubsToPrice: 6,
  maxSingleTicketOptions: 4,
  /** Hide a self-transfer if it costs more than this multiple of the best single ticket in both bag modes. */
  maxSelfTransferPremium: 1.1,
  /** Budget for a bed when the layover is this long. */
  longLayoverMinutes: 10 * 60,
  longLayoverCostInr: 4000,
  /** How much an extra hour of layover (beyond 6h) is worth when choosing between connections. */
  layoverHourCostInr: 300,
  /** Buffer added on top of max processing when suggesting an apply-by date. */
  applyBufferDays: { evisa: 3, sticker_required: 10, transit_visa: 10 } as Record<string, number>,
  transitVisaProcessing: { min: 10, max: 20 },
} as const;

const DAY_MS = 86_400_000;

function daysUntil(date: string, today: Date): number {
  const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.round((Date.parse(`${date}T00:00:00Z`) - start) / DAY_MS);
}

function applyByDate(date: string, processingMax: number, kind: string, today: Date): string | undefined {
  const buffer = RULES.applyBufferDays[kind];
  if (buffer === undefined) return undefined;
  const by = addDays(date, -(processingMax + buffer));
  const todayIso = today.toISOString().slice(0, 10);
  return by < todayIso ? todayIso : by;
}

/* ── Visa evaluation ───────────────────────────────────────────────────────── */

interface VisaCtx {
  held: HeldVisa[];
  date: string;
  today: Date;
  rates?: FxRates;
  countriesByCode: Map<string, CountryVisaProfile>;
}

export function entryStop(country: CountryVisaProfile, role: VisaStop['role'], airport: string | undefined, ctx: VisaCtx): VisaStop {
  const resolved = resolveVisaRequirements(country, profileFromHeld(ctx.held), ctx.rates);
  const days = daysUntil(ctx.date, ctx.today);
  const needsApplication = resolved.effectiveCategory === 'evisa' || resolved.effectiveCategory === 'sticker_required';
  const blocked = needsApplication && resolved.processingDays.min > days;
  const tight = needsApplication && !blocked && resolved.processingDays.max > days;

  const notes = [resolved.notes, tight ? `Processing can take up to ${resolved.processingDays.max} days — apply immediately.` : undefined]
    .filter(Boolean)
    .join(' ');

  return {
    countryCode: country.countryCode,
    countryName: country.countryName,
    airport,
    role,
    requirement: resolved.effectiveCategory,
    label: getVisaCategoryLabel(resolved.effectiveCategory),
    feeInr: resolved.feeInr,
    processingDays: resolved.processingDays,
    applyBy: needsApplication ? applyByDate(ctx.date, resolved.processingDays.max, resolved.effectiveCategory, ctx.today) : undefined,
    officialUrl: country.officialPortalUrl || undefined,
    notes: notes || undefined,
    upgradeSource: resolved.upgradeSource,
    documents: country.requiredDocuments?.length ? country.requiredDocuments : GENERIC_DOCUMENTS[resolved.effectiveCategory],
    steps: country.applicationSteps?.length ? country.applicationSteps : GENERIC_STEPS[resolved.effectiveCategory],
    blocked,
    unverified: verificationStatus(country.lastVerifiedAt, ctx.today) !== 'verified',
    researchedAt: country.research?.checkedAt,
  };
}

function unknownCountryStop(countryCode: string, airport: string | undefined, role: VisaStop['role']): VisaStop {
  return {
    countryCode,
    countryName: countryCode,
    airport,
    role,
    requirement: 'sticker_required',
    label: 'Check rules',
    feeInr: 0,
    processingDays: { min: 0, max: 0 },
    notes: 'We have no visa data for this country yet — check the official immigration website.',
    documents: [],
    steps: [],
    blocked: false,
    unverified: true,
  };
}

/** Transit at a hub. `airside` = staying in the international transit zone. */
export function transitStop(hub: TransitHubProfile, airside: boolean, ctx: VisaCtx): VisaStop {
  const country = ctx.countriesByCode.get(hub.countryCode);
  if (!airside || !hub.airsideTransitAllowed) {
    if (!country) return unknownCountryStop(hub.countryCode, hub.code, 'transit');
    const stop = entryStop(country, 'transit', hub.code, ctx);
    return { ...stop, label: `${stop.label} to re-check bags` };
  }

  const exempt = (hub.transitVisaExemptWith ?? []).find((h) => ctx.held.includes(h));
  const unverified = verificationStatus(hub.lastVerifiedAt, ctx.today) !== 'verified';
  const base = {
    countryCode: hub.countryCode,
    countryName: hub.country,
    airport: hub.code,
    role: 'transit' as const,
    officialUrl: hub.officialPortalUrl,
    steps: hub.stepByStepGuide,
    unverified,
    researchedAt: hub.research?.checkedAt,
  };

  if (hub.transitVisaNeededForIndians && !exempt) {
    const processing = RULES.transitVisaProcessing;
    const days = daysUntil(ctx.date, ctx.today);
    return {
      ...base,
      requirement: 'transit_visa',
      label: 'Airport transit visa',
      feeInr: hub.transitVisaCostInr,
      processingDays: processing,
      applyBy: applyByDate(ctx.date, processing.max, 'transit_visa', ctx.today),
      notes: hub.transitVisaType,
      documents: GENERIC_DOCUMENTS.sticker_required,
      blocked: processing.min > days,
    };
  }

  return {
    ...base,
    requirement: 'airside_ok',
    label: 'No visa — stay airside',
    feeInr: 0,
    processingDays: { min: 0, max: 0 },
    notes: exempt ? `Transit visa waived because you hold a valid ${exempt} visa.` : undefined,
    upgradeSource: exempt,
    documents: [],
    blocked: false,
  };
}

/** Prefer a usable, cheaper requirement when there's a choice (airside vs. entering). */
function easierStop(a: VisaStop, b: VisaStop): VisaStop {
  if (a.blocked !== b.blocked) return a.blocked ? b : a;
  return a.feeInr <= b.feeInr ? a : b;
}

/* ── Costing ───────────────────────────────────────────────────────────────── */

function legCheckedBagFee(offer: FareOffer): number {
  if (offer.baggage.checkedPieces !== 0) return 0;
  const km = airportDistanceKm(offer.from, offer.to) ?? 5000;
  return bagFeeForLeg(offer.carrierCode, km);
}

function toLegs(offers: FareOffer[]): PlanLeg[] {
  return offers.map((offer) => ({ offer, checkedBagFeeInr: legCheckedBagFee(offer) }));
}

function breakdown(mode: BagMode, legs: PlanLeg[], visas: VisaStop[], extras: number, warnings: string[]): ModeBreakdown {
  const fares = legs.reduce((s, l) => s + l.offer.priceInr, 0);
  const bagFees = mode === 'checked' ? legs.reduce((s, l) => s + l.checkedBagFeeInr, 0) : 0;
  const visaFees = visas.reduce((s, v) => s + v.feeInr, 0);
  const blockedStop = visas.find((v) => v.blocked);
  const unknownBags = mode === 'checked' ? legs.filter((l) => l.offer.baggage.checkedPieces === null) : [];
  return {
    fares,
    bagFees,
    visaFees,
    extras,
    total: fares + bagFees + visaFees + extras,
    visas,
    blocked: !!blockedStop,
    blockReason: blockedStop
      ? `${blockedStop.countryName} ${blockedStop.label.toLowerCase()} can't be issued before departure (takes ${blockedStop.processingDays.min}+ days).`
      : undefined,
    warnings: [
      ...warnings,
      ...unknownBags.map((l) => `Checked-bag allowance on ${l.offer.carrierName} is unknown — check before booking.`),
    ],
  };
}

/* ── Planner ───────────────────────────────────────────────────────────────── */

export async function planTrip(query: PlanQuery, deps: PlanDeps): Promise<PlanResult> {
  const today = deps.today ?? new Date();
  const countriesByCode = new Map(deps.countries.map((c) => [c.countryCode, c]));
  const destCountry = countriesByCode.get(query.destinationCountry.toUpperCase());
  if (!destCountry) throw new PlanError(`Unknown destination country: ${query.destinationCountry}`);

  const origin = getAirport(query.origin);
  if (!origin || origin.countryCode !== 'IN') throw new PlanError(`Choose an Indian departure airport (got ${query.origin}).`);

  const destIata = [query.destinationAirport, ...destCountry.popularAirports].find((code) => code && getAirport(code));
  const dest = destIata ? getAirport(destIata) : undefined;
  if (!dest) throw new PlanError(`No airport data for ${destCountry.countryName} yet.`);

  if (daysUntil(query.date, today) < 0) throw new PlanError('Travel date is in the past.');

  const ctx: VisaCtx = { held: query.heldVisas, date: query.date, today, rates: deps.rates, countriesByCode };
  const destStop = entryStop(destCountry, 'destination', dest.iata, ctx);
  const hubsByCode = new Map(deps.hubs.map((h) => [h.code, h]));
  const fq = (from: string, to: string, date = query.date): FareQuery => ({ from, to, date, adults: query.adults });

  // ── 1. Single tickets (non-stop or connecting on one booking)
  const singleOffersP = deps.search(fq(origin.iata, dest.iata));

  // ── 2. Self-transfer via hubs
  const directKm = distanceKm(origin, dest);
  const recommended = new Set(destCountry.recommendedHubs ?? []);
  const hubCandidates = deps.hubs
    .filter((h) => h.code !== origin.iata && h.code !== dest.iata && h.countryCode !== 'IN' && h.countryCode !== destCountry.countryCode)
    .map((h) => ({ hub: h, airport: getAirport(h.code) }))
    .filter((x): x is { hub: TransitHubProfile; airport: NonNullable<ReturnType<typeof getAirport>> } => !!x.airport)
    .map((x) => ({ ...x, detour: (distanceKm(origin, x.airport) + distanceKm(x.airport, dest)) / directKm }))
    .filter((x) => x.detour <= (recommended.has(x.hub.code) ? RULES.maxDetourRatio + 0.2 : RULES.maxDetourRatio))
    .sort((a, b) => Number(recommended.has(b.hub.code)) - Number(recommended.has(a.hub.code)) || a.detour - b.detour)
    .slice(0, RULES.maxHubsToPrice);

  const hubOptionsP = hubCandidates.map(async ({ hub }) => {
    const [leg1, leg2a, leg2b] = await Promise.all([
      deps.search(fq(origin.iata, hub.code)),
      deps.search(fq(hub.code, dest.iata)),
      deps.search(fq(hub.code, dest.iata, addDays(query.date, 1))),
    ]);
    return { hub, pair: bestPair(leg1, [...leg2a, ...leg2b]) };
  });

  const [singleOffers, hubResults] = await Promise.all([singleOffersP, Promise.all(hubOptionsP)]);
  const options: PlanOption[] = [];

  // Single-ticket options: cheapest few, plus the fastest if it isn't among them.
  const byPrice = [...singleOffers].sort((a, b) => a.priceInr - b.priceInr);
  const picked = byPrice.slice(0, RULES.maxSingleTicketOptions - 1);
  const fastest = [...singleOffers].sort((a, b) => a.durationMinutes - b.durationMinutes)[0];
  if (fastest && !picked.includes(fastest)) picked.push(fastest);
  else if (byPrice[RULES.maxSingleTicketOptions - 1]) picked.push(byPrice[RULES.maxSingleTicketOptions - 1]);

  for (const offer of picked) {
    const legs = toLegs([offer]);
    const notes: string[] = [];
    const transitStops: VisaStop[] = [];
    for (const via of offer.via) {
      const hub = hubsByCode.get(via);
      if (hub) transitStops.push(transitStop(hub, !hub.terminalChangeRequiresVisa, ctx));
      else notes.push(`Connects in ${getAirport(via)?.city ?? via} (${via}) — check transit rules there before booking.`);
    }
    if (offer.stops > 0 && offer.via.length === 0) {
      notes.push(`${offer.stops} stop${offer.stops > 1 ? 's' : ''} — check which airport you connect in and its transit rules.`);
    }
    const visas = [...transitStops, destStop];
    options.push({
      id: `single-${offer.id}`,
      kind: 'single_ticket',
      legs,
      departAt: offer.departAt,
      arriveAt: offer.arriveAt,
      totalDurationMinutes: offer.durationMinutes,
      modes: {
        cabin: breakdown('cabin', legs, visas, 0, []),
        checked: breakdown('checked', legs, visas, 0, []),
      },
      notes,
    });
  }

  for (const { hub, pair } of hubResults) {
    if (!pair) continue;
    const [l1, l2] = pair;
    const legs = toLegs([l1, l2]);
    const layover = minutesBetween(l1.arriveAt, l2.departAt);

    // Checked bags on separate tickets always mean entering the hub country.
    const landside = transitStop(hub, false, ctx);
    const canStayAirside = hub.airsideSelfTransfer && hub.airsideTransitAllowed && !hub.terminalChangeRequiresVisa;
    const cabinStop = canStayAirside ? easierStop(transitStop(hub, true, ctx), landside) : landside;

    const extras = layover >= RULES.longLayoverMinutes ? RULES.longLayoverCostInr : 0;
    const hubCity = getAirport(hub.code)?.city ?? hub.city;
    const notes = [
      'Separate tickets: if your first flight is late, the second airline does not have to rebook you. Leave buffer time or buy insurance with missed-connection cover.',
      ...(extras ? [`Long layover in ${hubCity} — budget ~₹${RULES.longLayoverCostInr.toLocaleString('en-IN')} for a hotel or lounge.`] : []),
    ];
    const curated = deps.curated.find(
      (r) =>
        r.hubIata === hub.code &&
        r.destinationCountryCode === destCountry.countryCode &&
        (r.originIata === origin.iata || r.originIata === 'ALL_INDIA')
    );

    options.push({
      id: `hub-${hub.code}`,
      kind: 'self_transfer',
      hub: { iata: hub.code, city: hubCity, countryCode: hub.countryCode, countryName: hub.country },
      legs,
      layoverMinutes: layover,
      departAt: l1.departAt,
      arriveAt: l2.arriveAt,
      totalDurationMinutes: minutesBetween(l1.departAt, l2.arriveAt),
      modes: {
        cabin: breakdown('cabin', legs, [cabinStop, destStop], extras,
          cabinStop.requirement === 'airside_ok' ? [`Check in online for both flights and stay airside in ${hubCity} — carry-on only.`] : []),
        checked: breakdown('checked', legs, [landside, destStop], extras,
          [`Collect your bags in ${hubCity}, clear immigration and check in again for the second flight.`]),
      },
      notes,
      curatedNote: curated?.notes,
    });
  }

  // Drop self-transfers that are clearly worse than simply buying one ticket —
  // they add risk without saving money in either bag mode.
  const bestSingle = (mode: BagMode) =>
    Math.min(...options.filter((o) => o.kind === 'single_ticket').map((o) => o.modes[mode].total));
  const singleCabin = bestSingle('cabin');
  const singleChecked = bestSingle('checked');
  const worthShowing = options.filter(
    (o) =>
      o.kind === 'single_ticket' ||
      o.modes.cabin.total <= singleCabin * RULES.maxSelfTransferPremium ||
      o.modes.checked.total <= singleChecked * RULES.maxSelfTransferPremium
  );

  worthShowing.sort((a, b) => Number(a.modes.cabin.blocked) - Number(b.modes.cabin.blocked) || a.modes.cabin.total - b.modes.cabin.total);

  return {
    query,
    origin: { iata: origin.iata, city: origin.city },
    destination: { countryCode: destCountry.countryCode, countryName: destCountry.countryName, airport: dest.iata, city: dest.city },
    options: worthShowing,
    priceSource: deps.priceSource,
    liveCheckAvailable: deps.liveCheckAvailable,
    generatedAt: new Date().toISOString(),
  };
}

/** Cheapest leg1+leg2 combination that leaves enough time to self-transfer. */
export function bestPair(leg1: FareOffer[], leg2: FareOffer[]): [FareOffer, FareOffer] | null {
  let best: { pair: [FareOffer, FareOffer]; score: number } | null = null;
  for (const a of leg1) {
    for (const b of leg2) {
      const gap = minutesBetween(a.arriveAt, b.departAt);
      if (gap < RULES.minSelfTransferMinutes || gap > RULES.maxLayoverMinutes) continue;
      // Prefer shorter layovers: each hour beyond 6h counts as ₹300 (time, food, fatigue).
      const score = a.priceInr + b.priceInr + Math.max(0, gap - 360) * (RULES.layoverHourCostInr / 60);
      if (!best || score < best.score) best = { pair: [a, b], score };
    }
  }
  return best?.pair ?? null;
}

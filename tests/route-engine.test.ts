import { describe, expect, it } from 'vitest';
import { bestPair, planTrip, PlanError, type PlanDeps } from '@/lib/route-engine';
import type { FareOffer, FareQuery } from '@/types/flight';
import type { PlanQuery } from '@/types/plan';
import { COUNTRIES, HUBS, ROUTES, offer } from './fixtures';

const TODAY = new Date('2026-10-05T06:00:00Z');

function deps(table: Record<string, FareOffer[]>): PlanDeps {
  return {
    countries: COUNTRIES,
    hubs: HUBS,
    curated: ROUTES,
    search: async (q: FareQuery) => table[`${q.from}-${q.to}-${q.date}`] ?? [],
    priceSource: 'sample',
    liveCheckAvailable: false,
    today: TODAY,
  };
}

const brazil = (heldVisas: PlanQuery['heldVisas'] = []): PlanQuery => ({
  origin: 'DEL',
  destinationCountry: 'BR',
  date: '2026-11-20',
  adults: 1,
  heldVisas,
});

// DEL→GRU on one ticket via Dubai, or DEL→IST (low-cost, no bag) + IST→GRU on separate tickets.
const brazilFares = {
  'DEL-GRU-2026-11-20': [offer('DEL', 'GRU', '2026-11-20T04:00', 1500, 110_000, { carrier: 'EK', via: ['DXB'] })],
  'DEL-IST-2026-11-20': [offer('DEL', 'IST', '2026-11-20T06:00', 390, 20_000, { carrier: '6E', checked: 0 })],
  'IST-GRU-2026-11-20': [offer('IST', 'GRU', '2026-11-20T18:00', 780, 45_000, { carrier: 'TK' })],
};

describe('planTrip — self-transfer visa logic', () => {
  it('cabin-only can stay airside in Istanbul; a checked bag forces Turkish entry', async () => {
    const result = await planTrip(brazil(), deps(brazilFares));
    const ist = result.options.find((o) => o.id === 'hub-IST')!;
    expect(ist).toBeDefined();
    expect(ist.layoverMinutes).toBe(8 * 60);

    const cabinTurkey = ist.modes.cabin.visas.find((v) => v.countryCode === 'TR')!;
    expect(cabinTurkey.requirement).toBe('airside_ok');
    expect(ist.modes.cabin.total).toBe(65_000 + 8_000); // fares + Brazil embassy visa

    const checkedTurkey = ist.modes.checked.visas.find((v) => v.countryCode === 'TR')!;
    expect(checkedTurkey.requirement).toBe('sticker_required');
    // fares + IndiGo bag (4,550km → medium band ₹4,500) + Turkey sticker + Brazil embassy visa
    expect(ist.modes.checked.total).toBe(65_000 + 4_500 + 15_480 + 8_000);
  });

  it('a US visa turns the Turkish stop into a cheap eVisa', async () => {
    const result = await planTrip(brazil(['US']), deps(brazilFares));
    const checkedTurkey = result.options.find((o) => o.id === 'hub-IST')!.modes.checked.visas.find((v) => v.countryCode === 'TR')!;
    expect(checkedTurkey.requirement).toBe('evisa');
    expect(checkedTurkey.feeInr).toBe(4_400);
    expect(checkedTurkey.upgradeSource).toBe('US');
  });

  it('single tickets stay airside at known hubs and include the destination visa', async () => {
    const result = await planTrip(brazil(), deps(brazilFares));
    const single = result.options.find((o) => o.kind === 'single_ticket')!;
    expect(single.modes.cabin.visas.map((v) => [v.countryCode, v.requirement])).toEqual([
      ['AE', 'airside_ok'],
      ['BR', 'sticker_required'],
    ]);
    expect(single.modes.checked.total).toBe(single.modes.cabin.total); // bag already included
  });

  it('the checked-bag total is never below the cabin-only total', async () => {
    const result = await planTrip(brazil(), deps(brazilFares));
    for (const o of result.options) expect(o.modes.checked.total).toBeGreaterThanOrEqual(o.modes.cabin.total);
  });

  it('suggests an apply-by date before departure for visas that need processing', async () => {
    const result = await planTrip(brazil(), deps(brazilFares));
    const br = result.options[0].modes.cabin.visas.find((v) => v.role === 'destination')!;
    expect(br.applyBy).toBeDefined();
    expect(br.applyBy! < '2026-11-20').toBe(true);
  });

  it('hides self-transfers that cost clearly more than one ticket', async () => {
    const pricey = { ...brazilFares, 'IST-GRU-2026-11-20': [offer('IST', 'GRU', '2026-11-20T18:00', 780, 150_000, { carrier: 'TK' })] };
    const result = await planTrip(brazil(), deps(pricey));
    expect(result.options.some((o) => o.id === 'hub-IST')).toBe(false);
  });
});

describe('planTrip — transit visas and timing', () => {
  const mexico = (heldVisas: PlanQuery['heldVisas']): PlanQuery => ({ origin: 'DEL', destinationCountry: 'MX', date: '2026-12-01', adults: 1, heldVisas });
  const viaLondon = { 'DEL-MEX-2026-12-01': [offer('DEL', 'MEX', '2026-12-01T03:00', 1300, 95_000, { carrier: 'BA', via: ['LHR'] })] };

  it('flags the UK airport transit visa, waived for US visa holders', async () => {
    const plain = await planTrip(mexico([]), deps(viaLondon));
    expect(plain.options[0].modes.cabin.visas[0]).toMatchObject({ countryCode: 'GB', requirement: 'transit_visa' });

    const withUs = await planTrip(mexico(['US']), deps(viaLondon));
    expect(withUs.options[0].modes.cabin.visas[0]).toMatchObject({ countryCode: 'GB', requirement: 'airside_ok', upgradeSource: 'US' });
    expect(withUs.options[0].modes.cabin.visas[1]).toMatchObject({ countryCode: 'MX', requirement: 'visa_free' });
  });

  it('blocks trips when the embassy visa cannot be issued before departure', async () => {
    const soon: PlanQuery = { origin: 'BLR', destinationCountry: 'DE', date: '2026-10-10', adults: 1, heldVisas: [] };
    const fares = { 'BLR-FRA-2026-10-10': [offer('BLR', 'FRA', '2026-10-10T02:00', 600, 40_000, { carrier: 'LH' })] };
    const blocked = await planTrip(soon, deps(fares));
    expect(blocked.options[0].modes.cabin.blocked).toBe(true);
    expect(blocked.options[0].modes.cabin.blockReason).toMatch(/Germany/);

    const withSchengen = await planTrip({ ...soon, heldVisas: ['Schengen'] }, deps(fares));
    expect(withSchengen.options[0].modes.cabin.blocked).toBe(false);
  });

  it('rejects non-Indian origins and past dates', async () => {
    await expect(planTrip({ ...brazil(), origin: 'DXB' }, deps({}))).rejects.toBeInstanceOf(PlanError);
    await expect(planTrip({ ...brazil(), date: '2026-01-01' }, deps({}))).rejects.toBeInstanceOf(PlanError);
  });
});

describe('bestPair', () => {
  const leg1 = offer('DEL', 'IST', '2026-11-20T06:00', 390, 20_000); // lands 10:00 Istanbul time
  it('skips connections shorter than the self-transfer minimum', () => {
    const tooTight = offer('IST', 'GRU', '2026-11-20T12:00', 780, 30_000); // 2h
    const ok = offer('IST', 'GRU', '2026-11-20T15:00', 780, 45_000); // 5h
    expect(bestPair([leg1], [tooTight, ok])?.[1]).toBe(ok);
  });

  it('returns null when nothing connects within 24h', () => {
    expect(bestPair([leg1], [offer('IST', 'GRU', '2026-11-22T10:00', 780, 30_000)])).toBeNull();
  });
});

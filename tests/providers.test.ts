import { describe, expect, it } from 'vitest';
import { mapTravelpayoutsItem } from '@/lib/flights/travelpayouts';
import { mapDuffelOffer, parseIsoDuration } from '@/lib/flights/duffel';
import { sampleSearch } from '@/lib/flights/sample';
import { planQuerySchema } from '@/lib/schemas';

const q = { from: 'DEL', to: 'IST', date: '2026-11-20', adults: 1 };

describe('Travelpayouts mapping', () => {
  it('maps price, times in local zones, policy-based bags and affiliate link', () => {
    const o = mapTravelpayoutsItem(
      {
        origin: 'DEL',
        destination: 'IST',
        origin_airport: 'DEL',
        destination_airport: 'IST',
        price: 21450,
        airline: '6E',
        flight_number: 11,
        departure_at: '2026-11-20T06:00:00+05:30',
        transfers: 0,
        duration_to: 390,
        link: '/search/DEL2011IST1?t=abc',
      },
      q,
      'mymarker',
      '2026-10-05T00:00:00Z',
      0
    )!;
    expect(o.priceInr).toBe(21450);
    expect(o.departAt).toBe('2026-11-20T06:00:00+05:30');
    expect(o.arriveAt).toBe('2026-11-20T10:00:00+03:00');
    expect(o.baggage).toEqual({ cabinKg: 7, checkedPieces: 1, basis: 'airline_policy' });
    expect(o.deepLink).toBe('https://www.aviasales.com/search/DEL2011IST1?t=abc&marker=mymarker');
  });
});

describe('Duffel mapping', () => {
  it('parses ISO durations', () => {
    expect(parseIsoDuration('PT6H30M')).toBe(390);
    expect(parseIsoDuration('P1DT2H')).toBe(1560);
  });

  it('converts currency, uses the tightest checked-bag allowance and per-adult price', () => {
    const rates = { toInr: { USD: 88, INR: 1 }, fetchedAt: '', live: true };
    const o = mapDuffelOffer(
      {
        id: 'off_1',
        total_amount: '500.00',
        total_currency: 'USD',
        owner: { iata_code: 'TK', name: 'Turkish Airlines' },
        slices: [
          {
            duration: 'PT9H',
            segments: [
              {
                origin: { iata_code: 'DEL', time_zone: 'Asia/Kolkata' },
                destination: { iata_code: 'IST', time_zone: 'Europe/Istanbul' },
                departing_at: '2026-11-20T06:00:00',
                arriving_at: '2026-11-20T10:00:00',
                marketing_carrier: { iata_code: 'TK', name: 'Turkish Airlines' },
                marketing_carrier_flight_number: '717',
                passengers: [{ baggages: [{ type: 'checked', quantity: 1 }, { type: 'carry_on', quantity: 1 }] }],
              },
            ],
          },
        ],
      },
      { ...q, adults: 2 },
      rates,
      ''
    )!;
    expect(o.priceInr).toBe(22_000);
    expect(o.baggage).toEqual({ cabinKg: null, checkedPieces: 1, basis: 'fare' });
    expect(o.durationMinutes).toBe(540);
    expect(o.segments[0].flightNumber).toBe('TK717');
  });
});

describe('sample provider', () => {
  it('is deterministic and labels itself', () => {
    const a = sampleSearch(q, new Date('2026-10-05'));
    const b = sampleSearch(q, new Date('2026-10-05'));
    expect(a.map((o) => o.priceInr)).toEqual(b.map((o) => o.priceInr));
    expect(a.length).toBeGreaterThan(0);
    expect(a.every((o) => o.source === 'sample')).toBe(true);
  });
});

describe('planQuerySchema', () => {
  it('normalises codes and parses held visas', () => {
    const p = planQuerySchema.parse({ from: 'del', to: 'br', date: '2026-11-20', visas: 'US,Schengen' });
    expect(p).toMatchObject({ from: 'DEL', to: 'BR', adults: 1, bags: 'cabin', visas: ['US', 'Schengen'] });
  });

  it('rejects unknown held visas', () => {
    expect(planQuerySchema.safeParse({ from: 'DEL', to: 'BR', date: '2026-11-20', visas: 'XX' }).success).toBe(false);
  });
});

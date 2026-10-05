import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getLiveProvider, searchFares } from '@/lib/flights';
import { formatZodError } from '@/lib/schemas';
import { rateLimited } from '@/lib/http';

const querySchema = z.object({
  from: z.string().regex(/^[A-Z]{3}$/),
  to: z.string().regex(/^[A-Z]{3}$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.coerce.number().int().min(1).max(9).default(1),
  carrier: z.string().regex(/^[A-Z0-9]{2}$/).optional(),
});

/**
 * GET /api/fares/live?from=DEL&to=IST&date=2026-11-20&carrier=TK
 * Live price + exact baggage for one leg (Duffel). Called only on demand
 * because Duffel bills excess searches.
 */
export async function GET(request: NextRequest) {
  const provider = getLiveProvider();
  if (!provider) return NextResponse.json({ error: 'Live fare checks are not configured.' }, { status: 501 });

  const limited = await rateLimited(request, 'live');
  if (limited) return limited;

  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  const { from, to, date, adults, carrier } = parsed.data;

  const offers = await searchFares(provider, { from, to, date, adults });
  const sameCarrier = carrier ? offers.filter((o) => o.carrierCode === carrier) : [];
  return NextResponse.json({ offers: (sameCarrier.length ? sameCarrier : offers).slice(0, 5) });
}

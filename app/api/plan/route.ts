import { NextRequest, NextResponse } from 'next/server';
import { planQuerySchema, formatZodError } from '@/lib/schemas';
import { runPlan, toPlanQuery } from '@/lib/plan';
import { PlanError } from '@/lib/route-engine';
import { rateLimited } from '@/lib/http';

/**
 * GET /api/plan?from=DEL&to=BR&date=2026-11-20&adults=1&visas=US,Schengen
 * Compares single tickets with self-transfer routes via hubs, including visa
 * and baggage costs for both "cabin only" and "checked bag" travel.
 */
export async function GET(request: NextRequest) {
  const limited = await rateLimited(request, 'plan');
  if (limited) return limited;

  const parsed = planQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }

  try {
    const result = await runPlan(toPlanQuery(parsed.data));
    return NextResponse.json(result, { headers: { 'Cache-Control': 'private, max-age=300' } });
  } catch (err) {
    if (err instanceof PlanError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error('[api/plan]', err);
    return NextResponse.json({ error: 'Could not plan this trip right now.' }, { status: 500 });
  }
}

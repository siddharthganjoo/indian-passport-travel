import { NextRequest, NextResponse } from 'next/server';
import { getAllSmartRoutes, saveSmartRoute, deleteSmartRoute } from '@/lib/db';
import { routeSchema } from '@/lib/schemas';
import { adminWrite } from '@/lib/admin-api';
import type { SmartRouteHack } from '@/types/routes';

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get('destinationCountryCode');
  let routes = await getAllSmartRoutes();
  if (country) routes = routes.filter((r) => r.destinationCountryCode.toUpperCase() === country.toUpperCase());
  return NextResponse.json({ routes, count: routes.length });
}

export async function POST(request: NextRequest) {
  return adminWrite(async () => {
    const body = routeSchema.parse(await request.json()) as SmartRouteHack;
    const route = await saveSmartRoute(body);
    return NextResponse.json({ message: 'Route saved', route });
  });
}

export async function DELETE(request: NextRequest) {
  return adminWrite(async () => {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Route ID is required' }, { status: 400 });
    if (!(await deleteSmartRoute(id))) return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    return NextResponse.json({ message: `Route ${id} deleted` });
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { getAllSmartRoutes, getSmartRoutesForDestination } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const destination = searchParams.get('destination');
  const origin = searchParams.get('origin');

  let routes = await getAllSmartRoutes();

  if (destination) {
    routes = routes.filter((r) => r.destinationCountryCode.toUpperCase() === destination.toUpperCase());
  }

  if (origin && origin !== 'ALL') {
    routes = routes.filter((r) => r.originIata.toUpperCase() === origin.toUpperCase() || r.originIata === 'ALL_INDIA');
  }

  return NextResponse.json({
    routes,
    total: routes.length,
  });
}


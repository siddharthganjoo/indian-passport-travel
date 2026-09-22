import { NextRequest, NextResponse } from 'next/server';
import { searchFlights } from '@/lib/flight-service';
import { checkRateLimit } from '@/lib/ratelimit';
import { getCachedData, setCachedData } from '@/lib/redis';
import { FlightOffer } from '@/types/flight';

export async function GET(request: NextRequest) {
  // 1. Production Standard 18: Spam & Rate Limiting Protection (20 req / min per IP)
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

  const rateCheck = await checkRateLimit(ip);
  if (!rateCheck.success) {
    return NextResponse.json(
      {
        error: 'Too many search requests. Please slow down.',
        limit: rateCheck.limit,
        remaining: rateCheck.remaining,
      },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': String(rateCheck.limit),
          'X-RateLimit-Remaining': String(rateCheck.remaining),
        },
      }
    );
  }

  // 2. Validate parameters
  const searchParams = request.nextUrl.searchParams;
  const origin = (searchParams.get('origin') || 'DEL').toUpperCase();
  const destinationCountryCode = (searchParams.get('destinationCountryCode') || '').toUpperCase();
  const departureDate = searchParams.get('departureDate') || '';
  const returnDate = searchParams.get('returnDate') || undefined;
  const passengers = parseInt(searchParams.get('passengers') || '1', 10);

  if (!destinationCountryCode) {
    return NextResponse.json(
      { error: 'Missing required destinationCountryCode parameter.' },
      { status: 400 }
    );
  }

  // 3. Cache lookup
  const cacheKey = `flights:${origin}:${destinationCountryCode}:${departureDate}:${passengers}`;
  const cachedOffers = await getCachedData<FlightOffer[]>(cacheKey);

  if (cachedOffers) {
    return NextResponse.json({
      offers: cachedOffers,
      source: 'cached_snapshot',
      count: cachedOffers.length,
    });
  }

  // 4. Perform Flight Aggregation Search
  try {
    const offers = await searchFlights({
      origin,
      destinationCountryCode,
      departureDate,
      returnDate,
      passengers,
    });

    // Cache snapshot for 1 hour (3600 seconds)
    await setCachedData(cacheKey, offers, 3600);

    return NextResponse.json({
      offers,
      source: 'live_aggregation',
      count: offers.length,
    });
  } catch (error) {
    console.error('Flight aggregation error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve flight offers.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { DESTINATIONS } from '@/lib/destinations-data';
import { resolveVisaRequirements } from '@/lib/visa-engine';
import { UserVisaProfile } from '@/types/visa';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const hasUSVisa = searchParams.get('hasUSVisa') === 'true';
  const hasSchengen = searchParams.get('hasSchengen') === 'true';
  const hasUKVisa = searchParams.get('hasUKVisa') === 'true';
  const continent = searchParams.get('continent') || 'All';
  const search = (searchParams.get('search') || '').toLowerCase().trim();
  const category = searchParams.get('category') || 'all';

  const userProfile: UserVisaProfile = {
    hasUSVisa,
    hasSchengen,
    hasUKVisa,
  };

  let results = DESTINATIONS.map((country) => {
    const resolved = resolveVisaRequirements(country, userProfile);
    return {
      country,
      resolvedVisa: resolved,
    };
  });

  // Filter by search term
  if (search) {
    results = results.filter(
      (item) =>
        item.country.countryName.toLowerCase().includes(search) ||
        item.country.capitalCity.toLowerCase().includes(search) ||
        item.country.continent.toLowerCase().includes(search) ||
        item.country.popularAirports.some((a) => a.toLowerCase().includes(search))
    );
  }

  // Filter by continent
  if (continent !== 'All') {
    results = results.filter((item) => item.country.continent === continent);
  }

  // Filter by category
  if (category !== 'all') {
    results = results.filter((item) => item.resolvedVisa.effectiveCategory === category);
  }

  return NextResponse.json({
    destinations: results,
    total: results.length,
    userProfile,
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { getAllDestinations, saveDestination, deleteDestination } from '@/lib/db';
import { countrySchema } from '@/lib/schemas';
import { adminWrite } from '@/lib/admin-api';
import type { CountryVisaProfile } from '@/types/visa';

export async function GET() {
  const destinations = await getAllDestinations();
  return NextResponse.json({ destinations, count: destinations.length });
}

export async function POST(request: NextRequest) {
  return adminWrite(async () => {
    const body = countrySchema.parse(await request.json()) as CountryVisaProfile;
    const destination = await saveDestination(body);
    return NextResponse.json({ message: 'Destination saved', destination });
  });
}

export async function DELETE(request: NextRequest) {
  return adminWrite(async () => {
    const countryCode = request.nextUrl.searchParams.get('countryCode');
    if (!countryCode) return NextResponse.json({ error: 'countryCode query param is required' }, { status: 400 });
    if (!(await deleteDestination(countryCode))) return NextResponse.json({ error: 'Country not found' }, { status: 404 });
    return NextResponse.json({ message: `Country ${countryCode} deleted` });
  });
}

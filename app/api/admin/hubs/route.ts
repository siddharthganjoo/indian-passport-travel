import { NextRequest, NextResponse } from 'next/server';
import { getAllTransitHubs, saveTransitHub, deleteTransitHub } from '@/lib/db';
import { hubSchema } from '@/lib/schemas';
import { adminWrite } from '@/lib/admin-api';
import type { TransitHubProfile } from '@/types/routes';

export async function GET() {
  const hubs = await getAllTransitHubs();
  return NextResponse.json({ hubs, count: hubs.length });
}

export async function POST(request: NextRequest) {
  return adminWrite(async () => {
    const body = hubSchema.parse(await request.json()) as TransitHubProfile;
    const hub = await saveTransitHub(body);
    return NextResponse.json({ message: 'Hub saved', hub });
  });
}

export async function DELETE(request: NextRequest) {
  return adminWrite(async () => {
    const code = request.nextUrl.searchParams.get('code');
    if (!code) return NextResponse.json({ error: 'code query param is required' }, { status: 400 });
    if (!(await deleteTransitHub(code))) return NextResponse.json({ error: 'Hub not found' }, { status: 404 });
    return NextResponse.json({ message: `Hub ${code} deleted` });
  });
}

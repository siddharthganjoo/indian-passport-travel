import { NextResponse } from 'next/server';
import { getAllTransitHubs } from '@/lib/db';

export async function GET() {
  const hubs = await getAllTransitHubs();
  return NextResponse.json({
    hubs,
    total: hubs.length,
  });
}


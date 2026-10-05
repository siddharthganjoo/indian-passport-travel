import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { markDestinationVerified, markHubVerified } from '@/lib/db';
import { adminWrite } from '@/lib/admin-api';

const bodySchema = z.object({ type: z.enum(['country', 'hub']), code: z.string().min(2).max(3) });

/** POST { type: 'country' | 'hub', code } — stamp a record as checked against its official source today. */
export async function POST(request: NextRequest) {
  return adminWrite(async () => {
    const { type, code } = bodySchema.parse(await request.json());
    const record = type === 'country' ? await markDestinationVerified(code) : await markHubVerified(code);
    if (!record) return NextResponse.json({ error: `${type} ${code} not found` }, { status: 404 });
    return NextResponse.json({ message: `${code} marked as verified`, record });
  });
}

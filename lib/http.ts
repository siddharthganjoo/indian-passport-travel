import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/ratelimit';

export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') ?? '127.0.0.1';
}

/** Returns a 429 response when the caller is over the limit, otherwise null. */
export async function rateLimited(request: NextRequest, bucket: string): Promise<NextResponse | null> {
  const check = await checkRateLimit(`${bucket}:${clientIp(request)}`);
  if (check.success) return null;
  return NextResponse.json(
    { error: 'Too many searches — please wait a minute and try again.' },
    { status: 429, headers: { 'Retry-After': '60', 'X-RateLimit-Limit': String(check.limit) } }
  );
}

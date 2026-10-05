import { NextRequest, NextResponse } from 'next/server';

/**
 * Protects /admin and /api/admin/* with HTTP Basic auth.
 *   ADMIN_USER (default "admin") / ADMIN_PASSWORD
 * Without ADMIN_PASSWORD, admin is open in development and disabled in production.
 */
export function middleware(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    if (process.env.NODE_ENV !== 'production') return NextResponse.next();
    return new NextResponse('Admin is disabled. Set ADMIN_PASSWORD to enable it.', { status: 503 });
  }

  const user = process.env.ADMIN_USER || 'admin';
  const header = request.headers.get('authorization') ?? '';
  const [scheme, encoded] = header.split(' ');
  if (scheme === 'Basic' && encoded) {
    try {
      const [u, ...rest] = atob(encoded).split(':');
      if (safeEqual(u, user) && safeEqual(rest.join(':'), password)) return NextResponse.next();
    } catch {
      // fall through to 401
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="jugo admin", charset="UTF-8"' },
  });
}

/** Length-independent comparison to avoid leaking match position through timing. */
function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

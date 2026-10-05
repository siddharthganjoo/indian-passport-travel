import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

const req = (auth?: string) =>
  new NextRequest('http://localhost/api/admin/database', { headers: auth ? { authorization: auth } : {} });
const basic = (u: string, p: string) => `Basic ${btoa(`${u}:${p}`)}`;

describe('admin middleware', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('rejects missing or wrong credentials', () => {
    vi.stubEnv('ADMIN_PASSWORD', 's3cret');
    expect(middleware(req()).status).toBe(401);
    expect(middleware(req(basic('admin', 'nope'))).status).toBe(401);
  });

  it('accepts the configured credentials', () => {
    vi.stubEnv('ADMIN_PASSWORD', 's3cret:with-colon');
    expect(middleware(req(basic('admin', 's3cret:with-colon'))).status).toBe(200);
  });

  it('is disabled in production when no password is set', () => {
    vi.stubEnv('ADMIN_PASSWORD', '');
    vi.stubEnv('NODE_ENV', 'production');
    expect(middleware(req()).status).toBe(503);
  });
});

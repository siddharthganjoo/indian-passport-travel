import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import { ReadOnlyStoreError } from '@/lib/db';
import { formatZodError } from '@/lib/schemas';

/** Wraps an admin write: maps validation/storage errors to HTTP and refreshes public pages. */
export async function adminWrite(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    const res = await fn();
    if (res.ok) revalidatePath('/', 'layout');
    return res;
  } catch (err) {
    if (err instanceof ZodError) return NextResponse.json({ error: formatZodError(err) }, { status: 400 });
    if (err instanceof ReadOnlyStoreError) return NextResponse.json({ error: err.message }, { status: 409 });
    if (err instanceof SyntaxError) return NextResponse.json({ error: 'Body must be valid JSON.' }, { status: 400 });
    console.error('[admin]', err);
    return NextResponse.json({ error: 'Something went wrong while saving.' }, { status: 500 });
  }
}

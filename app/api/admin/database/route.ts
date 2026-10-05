import { NextRequest, NextResponse } from 'next/server';
import { exportDatabase, importDatabase, getStorageInfo, type DatabaseSnapshot } from '@/lib/db';
import { importSchema } from '@/lib/schemas';
import { adminWrite } from '@/lib/admin-api';

export async function GET() {
  const [data, storage] = await Promise.all([exportDatabase(), getStorageInfo()]);
  return NextResponse.json({ ...data, storage });
}

export async function POST(request: NextRequest) {
  return adminWrite(async () => {
    const body = importSchema.parse(await request.json()) as Partial<DatabaseSnapshot>;
    await importDatabase(body);
    return NextResponse.json({ message: 'Database imported', data: await exportDatabase() });
  });
}

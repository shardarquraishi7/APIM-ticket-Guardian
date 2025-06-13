import { NextRequest, NextResponse } from 'next/server';
import { version } from '../../../../package.json';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (req.method !== 'GET') {
    return NextResponse.json({ message: 'Must be a GET request' }, { status: 400 });
  }

  return NextResponse.json({ version }, { status: 200 });
}

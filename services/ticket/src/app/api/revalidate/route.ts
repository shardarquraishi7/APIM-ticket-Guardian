import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  if (searchParams.get('secret') !== process.env.NEXT_REVALIDATE_TOKEN) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  try {
    if (typeof searchParams.get('pages') === 'string') {
      const pages = searchParams.get('pages')!.split(',');
      pages.map((page: string) => revalidatePath(page.trim()));
      return NextResponse.json({ revalidated: true });
    }
    return NextResponse.json({ message: "'pages' are undefined" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}

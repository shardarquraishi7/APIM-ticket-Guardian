import { NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';
import { syncKnowledgeBase } from '@/workflows/sync-knowledge-base';

export const fetchCache = 'force-no-store';
export const revalidate = 0;

const logger = createLogger('sync-knowledge-base-api');

export async function POST(req: Request) {
  try {
    const start = Date.now();
    logger.info('Syncing knowledge base');
    const results = await syncKnowledgeBase();

    logger.info('Knowledge base synced', {
      results,
      duration: `${Date.now() - start}ms`,
    });

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    logger.error('Failed to sync knowledge base', error);
    return NextResponse.json({ error: 'Failed to sync knowledge base' }, { status: 500 });
  }
}

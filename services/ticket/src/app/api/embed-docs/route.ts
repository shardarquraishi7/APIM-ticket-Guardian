import { NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';
import { syncGithubRepos } from '@/workflows/sync-github-repos';

export const fetchCache = 'force-no-store';
export const revalidate = 0;

const logger = createLogger('embed-docs');

export async function POST(req: Request) {
  try {
    const start = Date.now();
    logger.info('Syncing github repos');
    const results = await syncGithubRepos();

    logger.info('Github repos synced', {
      results,
      duration: `${Date.now() - start}ms`,
    });

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    logger.error('Failed to sync github repos', error);
    return NextResponse.json({ error: 'Failed to sync github repos' }, { status: 500 });
  }
}

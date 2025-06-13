import { NextRequest, NextResponse } from 'next/server';
import { feedbackData } from '@/data/feedback';
import { createDb } from '@/db';
import { createLogger } from '@/lib/logger';
import { userService } from '@/services/user';

const logger = createLogger('feedback');

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> },
) {
  const { messageId } = await params;
  const db = await createDb();
  const user = await userService.getUser();

  if (!user) {
    logger.error('Unauthorized');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await feedbackData.getByUserIdAndMessageId(db, user.id, messageId);

    logger.info('Feedback fetched', {
      messageId,
      userId: user.id,
      feedback: response,
    });

    return NextResponse.json(response ?? null, { status: 200 });
  } catch (error) {
    logger.error('Failed to get feedback', error);
    return NextResponse.json({ error: 'Failed to get feedback' }, { status: 500 });
  }
}

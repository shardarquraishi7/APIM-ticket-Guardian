import { NextResponse } from 'next/server';
import { feedbackData } from '@/data/feedback';
import { createDb } from '@/db';
import { createLogger } from '@/lib/logger';
import { userService } from '@/services/user';
import { feedbackSchema } from '@/validations/feedback';

const logger = createLogger('feedback');

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function POST(request: Request) {
  const { messageId, isPositive, comments } = await request.json();
  const user = await userService.getUser();

  if (!user) {
    logger.error('Unauthorized');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await createDb();

    const parsedFeedback = feedbackSchema.safeParse({
      messageId,
      isPositive,
      comments,
    });

    if (!parsedFeedback.success) {
      logger.error(
        {
          messageId,
          userId: user.id,
          error: parsedFeedback.error,
        },
        'Invalid feedback data',
      );

      return NextResponse.json(
        { message: 'Invalid feedback data', error: parsedFeedback.error },
        { status: 400 },
      );
    }

    const response = await feedbackData.upsertFeedback(db, {
      messageId: parsedFeedback.data.messageId,
      isPositive: parsedFeedback.data.isPositive,
      comments: parsedFeedback.data.comments || null,
      userId: user.id,
    });

    logger.info(
      {
        messageId,
        userId: user.id,
        feedback: response.at(0),
      },
      'Feedback successfully submitted',
    );

    return NextResponse.json(response.at(0));
  } catch (error) {
    logger.error(
      {
        messageId,
        userId: user.id,
        error,
      },
      'Error submitting feedback',
    );
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

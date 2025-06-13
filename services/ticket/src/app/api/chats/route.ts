import { NextResponse } from 'next/server';
import { chatsData } from '@/data/chats';
import { createDb } from '@/db';
import { createLogger } from '@/lib/logger';
import { userService } from '@/services/user';

const logger = createLogger('chats');

export async function GET() {
  const user = await userService.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await createDb();
    const userChats = await chatsData.getByUserId(db, user.id);

    logger.info('User chats', {
      userId: user.id,
      chats: userChats.length,
    });

    return NextResponse.json(userChats);
  } catch (error) {
    logger.error('Error getting user chats', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

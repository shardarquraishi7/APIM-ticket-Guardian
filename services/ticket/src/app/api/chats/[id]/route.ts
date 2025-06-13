import { NextResponse } from 'next/server';
import { chatsData } from '@/data/chats';
import { createDb } from '@/db';
import { createLogger } from '@/lib/logger';
import { userService } from '@/services/user';

const logger = createLogger('chats');

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await userService.getUser();
  if (!user) {
    logger.error('Unauthorized');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const db = await createDb();
    await chatsData.deleteById(db, id);

    logger.info('Chat deleted', {
      id,
      userId: user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting chat:', error);
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}

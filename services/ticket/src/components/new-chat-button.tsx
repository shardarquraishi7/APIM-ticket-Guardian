'use client';

import { useRouter } from 'next/navigation';
import { Button } from './button';
import { PlusIcon } from './icons/plus';

export function NewChatButton() {
  const router = useRouter();

  return (
    <Button
      data-testid="new-chat-button"
      variant="purple"
      className="inline-flex items-center space-x-2"
      onClick={async () => {
        router.push('/');
      }}
      leadingIcon={<PlusIcon className="w-4 h-4" />}
    >
      <span>New Chat</span>
    </Button>
  );
}

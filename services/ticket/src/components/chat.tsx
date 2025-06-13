'use client';

import { useChat } from '@ai-sdk/react';
import { ChatHeader } from '@/components/chat-header';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';

export function Chat() {
  const { messages, handleSubmit, handleInputChange, input, status, stop, setMessages } = useChat({
    maxSteps: 5,
    sendExtraMessageFields: true,
  });

  return (
    <div className="flex flex-col min-w-0 h-dvh">
      <ChatHeader />

      <div className="relative flex-1">
        <Messages isLoading={status === 'submitted'} messages={messages} />
      </div>

      <div className="h-[150px]"></div>

      <MultimodalInput
        setMessages={setMessages}
        handleInputChange={handleInputChange}
        input={input}
        handleSubmit={handleSubmit}
        isLoading={status === 'submitted'}
        stop={stop}
      />
    </div>
  );
}

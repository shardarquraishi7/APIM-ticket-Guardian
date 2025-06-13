import { Message } from 'ai';
import equal from 'fast-deep-equal';
import { memo } from 'react';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import { PreviewMessage, ThinkingMessage, DataMessage } from './message';
import { Overview } from './overview';


interface MessagesProps {
  isLoading: boolean;
  messages: Array<Message>;
}

function PureMessages({ isLoading, messages }: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4 max-h-[calc(100vh-250px)]"
    >
      {messages.length === 0 && <Overview />}

      {messages.map((message) => {
        // Check if this is a message with custom data that needs special rendering
        if (message.data && message.role === 'assistant') {
          const dataMessage = <DataMessage key={`data-${message.id}`} message={message} />;
          if (dataMessage) {
            return dataMessage;
          }
        }
        
        // Default message rendering
        return <PreviewMessage key={message.id} message={message} />;
      })}

      {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
        <ThinkingMessage />
      )}

      <div ref={messagesEndRef} className="shrink-0 min-w-[24px] min-h-[24px]" />
      
      {/* Extra spacer to prevent overlap with input box */}
      <div className="h-56 shrink-0" />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.isLoading && nextProps.isLoading) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;

  return true;
});

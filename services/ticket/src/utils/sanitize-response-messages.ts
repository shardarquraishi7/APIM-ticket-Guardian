import { CoreAssistantMessage, CoreToolMessage } from 'ai';

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

export function sanitizeResponseMessages({ messages }: { messages: Array<ResponseMessage> }) {
  const toolResultIds: Array<string> = [];

  // First pass: collect all tool result IDs
  for (const message of messages) {
    if (message.role === 'tool') {
      for (const content of message.content) {
        if (content.type === 'tool-result') {
          toolResultIds.push(content.toolCallId);
        }
      }
    }
  }

  // Second pass: sanitize content
  const messagesBySanitizedContent = messages.map((message) => {
    if (message.role !== 'assistant') return message;

    if (typeof message.content === 'string') return message;

    const sanitizedContent = message.content.filter((content) => {
      if (content.type === 'tool-call') {
        return toolResultIds.includes(content.toolCallId);
      }
      if (content.type === 'text') {
        return content.text.length > 0;
      }
      return true;
    });

    return {
      ...message,
      content: sanitizedContent,
    };
  });

  // Filter out empty messages
  return messagesBySanitizedContent.filter((message) => {
    if (typeof message.content === 'string') {
      return message.content.length > 0;
    }
    return message.content.length > 0;
  });
}

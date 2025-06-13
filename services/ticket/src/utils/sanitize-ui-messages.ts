import type { Message } from 'ai';

export function sanitizeUIMessages(messages: Array<Message>): Array<Message> {
  // First pass: collect all tool result IDs across all messages
  const toolResultIds = new Set<string>();
  messages.forEach((message) => {
    if (message.parts) {
      message.parts.forEach((part) => {
        if (part.type === 'tool-invocation' && part.toolInvocation.state === 'result') {
          toolResultIds.add(part.toolInvocation.toolCallId);
        }
      });
    }
  });

  const messagesBySanitizedParts = messages.map((message) => {
    if (message.role !== 'assistant' || !message.parts) return message;

    // Filter parts based on global tool results
    const sanitizedParts = message.parts.filter((part) => {
      if (part.type === 'tool-invocation') {
        return (
          part.toolInvocation.state === 'result' ||
          toolResultIds.has(part.toolInvocation.toolCallId)
        );
      }
      return true;
    });

    return {
      ...message,
      parts: sanitizedParts,
    };
  });

  return messagesBySanitizedParts.filter(
    (message) => message.content.length > 0 || (message.parts && message.parts.length > 0),
  );
}

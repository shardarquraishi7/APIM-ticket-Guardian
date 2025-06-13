import { CoreToolMessage, Message, ToolInvocation } from 'ai';

// Extend the Message type to include feedback
export interface UIMessageWithFeedback extends Message {
  feedback?: any;
}

function addToolMessageToChat({
  toolMessage,
  messages,
}: {
  toolMessage: CoreToolMessage;
  messages: Array<UIMessageWithFeedback>;
}): Array<UIMessageWithFeedback> {
  return messages.map((message) => {
    if (message.parts) {
      return {
        ...message,
        parts: message.parts.map((part) => {
          if (part.type === 'tool-invocation') {
            const toolResult = toolMessage.content.find(
              (tool) => tool.toolCallId === part.toolInvocation.toolCallId,
            );

            if (toolResult) {
              return {
                type: 'tool-invocation',
                toolInvocation: {
                  ...part.toolInvocation,
                  state: 'result',
                  result: toolResult.result,
                },
              };
            }
          }
          return part;
        }),
      };
    }

    return message;
  });
}

export function convertToUIMessages(messages: Array<any>): Array<UIMessageWithFeedback> {
  const toolResults = new Map<string, any>();

  // First pass: collect all tool results
  messages.forEach((message) => {
    if (message.role === 'tool') {
      message.content.forEach((content: any) => {
        if (content.type === 'tool-result') {
          toolResults.set(content.toolCallId, content.result);
        }
      });
    }
  });

  return messages.reduce((chatMessages: Array<UIMessageWithFeedback>, message) => {
    if (message.role === 'tool') {
      return addToolMessageToChat({
        toolMessage: message as CoreToolMessage,
        messages: chatMessages,
      });
    }

    let textContent = '';
    let reasoning: string | undefined = undefined;
    const parts: Message['parts'] = [];

    if (typeof message.content === 'string') {
      textContent = message.content;
      parts.push({ type: 'text', text: message.content });
    } else if (Array.isArray(message.content)) {
      for (const content of message.content) {
        if (content.type === 'text') {
          textContent += content.text;
          parts.push({ type: 'text', text: content.text });
        } else if (content.type === 'tool-call') {
          const toolResult = toolResults.get(content.toolCallId);
          const toolInvocation: ToolInvocation = {
            state: toolResult ? 'result' : 'call',
            toolCallId: content.toolCallId,
            toolName: content.toolName,
            args: content.args,
            result: toolResult,
          };
          parts.push({ type: 'tool-invocation', toolInvocation });
        } else if (content.type === 'reasoning') {
          reasoning = content.reasoning;
        }
      }
    }

    chatMessages.push({
      id: message.id,
      role: message.role as Message['role'],
      content: textContent,
      reasoning,
      parts,
      feedback: message.feedback,
    });

    return chatMessages;
  }, []);
}

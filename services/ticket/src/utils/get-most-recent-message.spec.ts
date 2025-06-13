import type { Message } from 'ai';
import { describe, expect, it } from 'vitest';
import { getMostRecentUserMessage } from './get-most-recent-message';

describe('getMostRecentUserMessage', () => {
  it('should return the most recent user message', () => {
    // Create test messages
    const messages: Message[] = [
      { id: '1', role: 'user', content: 'First message' },
      { id: '2', role: 'assistant', content: 'Assistant response' },
      { id: '3', role: 'user', content: 'Second message' },
      { id: '4', role: 'assistant', content: 'Another response' },
      { id: '5', role: 'user', content: 'Third message' },
    ];

    // Call the function
    const result = getMostRecentUserMessage(messages);

    // Verify the result is the last user message
    expect(result).toEqual({
      id: '5',
      role: 'user',
      content: 'Third message',
    });
  });

  it('should return undefined if there are no user messages', () => {
    // Create test messages with no user messages
    const messages: Message[] = [
      { id: '1', role: 'assistant', content: 'Assistant message' },
      { id: '2', role: 'assistant', content: 'Another assistant message' },
    ];

    // Call the function
    const result = getMostRecentUserMessage(messages);

    // Verify the result is undefined
    expect(result).toBeUndefined();
  });

  it('should handle an empty messages array', () => {
    // Call the function with an empty array
    const result = getMostRecentUserMessage([]);

    // Verify the result is undefined
    expect(result).toBeUndefined();
  });
});

import { CoreAssistantMessage, CoreToolMessage } from 'ai';
import { describe, expect, it } from 'vitest';
import { sanitizeResponseMessages } from './sanitize-response-messages';

describe('sanitizeResponseMessages', () => {
  it('should filter out tool calls without matching tool results', () => {
    // Create test messages with tool calls and results
    const messages = [
      {
        id: '1',
        role: 'assistant',
        content: [
          { type: 'text', text: 'Hello' },
          { type: 'tool-call', toolCallId: 'tool1', toolName: 'test', args: {} },
          { type: 'tool-call', toolCallId: 'tool2', toolName: 'test', args: {} },
        ],
      } as CoreAssistantMessage & { id: string },
      {
        id: '2',
        role: 'tool',
        content: [
          { type: 'tool-result', toolCallId: 'tool1', result: 'Result 1' },
          // No result for tool2
        ],
      } as CoreToolMessage & { id: string },
    ];

    const result = sanitizeResponseMessages({ messages });

    // Verify tool2 call is filtered out
    expect(result).toHaveLength(2);
    expect(result[0].content).toHaveLength(2); // text + tool1 call
    expect(result[0].content[1]).toEqual({
      type: 'tool-call',
      toolCallId: 'tool1',
      toolName: 'test',
      args: {},
    });
  });

  it('should filter out empty text content', () => {
    const messages = [
      {
        id: '1',
        role: 'assistant',
        content: [
          { type: 'text', text: '' }, // Empty text should be filtered
          { type: 'text', text: 'Hello' },
        ],
      } as CoreAssistantMessage & { id: string },
    ];

    const result = sanitizeResponseMessages({ messages });

    expect(result).toHaveLength(1);
    expect(result[0].content).toHaveLength(1);
    expect(result[0].content[0]).toEqual({ type: 'text', text: 'Hello' });
  });

  it('should keep non-assistant messages unchanged', () => {
    const messages = [
      {
        id: '1',
        role: 'user',
        content: 'Hello',
      } as unknown as CoreAssistantMessage & { id: string },
      {
        id: '2',
        role: 'tool',
        content: [{ type: 'tool-result', toolCallId: 'tool1', result: 'Result 1' }],
      } as CoreToolMessage & { id: string },
    ];

    const result = sanitizeResponseMessages({ messages });

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(messages[0]);
    expect(result[1]).toEqual(messages[1]);
  });

  it('should handle string content in assistant messages', () => {
    const messages = [
      {
        id: '1',
        role: 'assistant',
        content: 'Hello',
      } as unknown as CoreAssistantMessage & { id: string },
    ];

    const result = sanitizeResponseMessages({ messages });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(messages[0]);
  });

  it('should filter out messages with empty content after sanitization', () => {
    const messages = [
      {
        id: '1',
        role: 'assistant',
        content: [{ type: 'tool-call', toolCallId: 'tool1', toolName: 'test', args: {} }],
      } as CoreAssistantMessage & { id: string },
      {
        id: '2',
        role: 'tool',
        content: [
          // No result for tool1
        ],
      } as CoreToolMessage & { id: string },
    ];

    const result = sanitizeResponseMessages({ messages });

    // Both messages should be filtered out
    expect(result).toHaveLength(0);
  });

  it('should handle empty messages array', () => {
    const result = sanitizeResponseMessages({ messages: [] });
    expect(result).toEqual([]);
  });
});

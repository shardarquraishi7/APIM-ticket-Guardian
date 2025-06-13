import type { Message } from 'ai';
import { describe, expect, it } from 'vitest';
import { sanitizeUIMessages } from './sanitize-ui-messages';

describe('sanitizeUIMessages', () => {
  it('should filter out assistant messages with empty content and no parts', () => {
    const messages: Message[] = [
      { id: '1', role: 'user', content: 'Hello' },
      { id: '2', role: 'assistant', content: '', parts: [] }, // Should be filtered out
      { id: '3', role: 'user', content: 'How are you?' },
    ];

    const result = sanitizeUIMessages(messages);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('3');
  });

  it('should keep assistant messages with non-empty content', () => {
    const messages: Message[] = [
      { id: '1', role: 'user', content: 'Hello' },
      {
        id: '2',
        role: 'assistant',
        content: 'Hi there',
        parts: [{ type: 'text', text: 'Hi there' }],
      },
      { id: '3', role: 'user', content: 'How are you?' },
    ];

    const result = sanitizeUIMessages(messages);

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
    expect(result[2].id).toBe('3');
  });

  it('should keep assistant messages with tool invocations in parts', () => {
    const messages: Message[] = [
      { id: '1', role: 'user', content: 'Hello' },
      {
        id: '2',
        role: 'assistant',
        content: '',
        parts: [
          {
            type: 'tool-invocation',
            toolInvocation: {
              toolCallId: 'tool1',
              toolName: 'testTool',
              args: { test: 'value' },
              state: 'result',
              result: 'Test result',
            },
          },
        ],
      },
      { id: '3', role: 'user', content: 'How are you?' },
    ];

    const result = sanitizeUIMessages(messages);

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
    expect(result[2].id).toBe('3');
  });

  it('should filter out tool invocations without matching results', () => {
    const messages: Message[] = [
      { id: '1', role: 'user', content: 'Hello' },
      {
        id: '2',
        role: 'assistant',
        content: 'Testing tools',
        parts: [
          { type: 'text', text: 'Testing tools' },
          {
            type: 'tool-invocation',
            toolInvocation: {
              toolCallId: 'tool1',
              toolName: 'testTool',
              args: { test: 'value' },
              state: 'call', // No result yet
            },
          },
          {
            type: 'tool-invocation',
            toolInvocation: {
              toolCallId: 'tool2',
              toolName: 'testTool2',
              args: { test: 'value2' },
              state: 'result',
              result: 'Test result 2',
            },
          },
        ],
      },
    ];

    const result = sanitizeUIMessages(messages);

    expect(result).toHaveLength(2);

    const toolInvocationParts = result[1].parts?.filter((part) => part.type === 'tool-invocation');

    expect(toolInvocationParts?.length).toBe(1);
    expect(toolInvocationParts?.[0].toolInvocation.toolCallId).toBe('tool2');
  });

  it('should handle messages without parts property', () => {
    const messages: Message[] = [
      { id: '1', role: 'user', content: 'Hello' },
      { id: '2', role: 'assistant', content: 'Hi there' },
    ];

    const result = sanitizeUIMessages(messages);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
  });

  it('should handle empty messages array', () => {
    const result = sanitizeUIMessages([]);
    expect(result).toEqual([]);
  });

  it('should keep text parts and filter only tool invocation parts', () => {
    const messages: Message[] = [
      {
        id: '1',
        role: 'assistant',
        content: 'Some text content',
        parts: [
          { type: 'text', text: 'Some text content' },
          {
            type: 'tool-invocation',
            toolInvocation: {
              toolCallId: 'tool1',
              toolName: 'testTool',
              args: { test: 'value' },
              state: 'call', // Should be filtered out
            },
          },
          {
            type: 'tool-invocation',
            toolInvocation: {
              toolCallId: 'tool2',
              toolName: 'testTool2',
              args: { test: 'value2' },
              state: 'result',
              result: 'Test result 2',
            },
          },
        ],
      },
    ];

    const result = sanitizeUIMessages(messages);

    expect(result).toHaveLength(1);
    expect(result[0].parts?.length).toBe(2);

    // Text part should be kept
    expect(result[0].parts?.[0].type).toBe('text');

    // Only the tool invocation with result should be kept
    const toolPart = result[0].parts?.find((part) => part.type === 'tool-invocation');
    expect(toolPart?.toolInvocation.toolCallId).toBe('tool2');
  });
});

import { CoreToolMessage, ToolResultPart } from 'ai';
import { describe, expect, it } from 'vitest';
import { convertToUIMessages } from './convert-to-ui-messages';

describe('convertToUIMessages', () => {
  it('should convert simple string content messages', () => {
    const messages = [
      { id: '1', role: 'user', content: 'Hello' },
      { id: '2', role: 'assistant', content: 'Hi there' },
    ];

    const result = convertToUIMessages(messages);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: '1',
      role: 'user',
      content: 'Hello',
      parts: [{ type: 'text', text: 'Hello' }],
    });
    expect(result[1]).toMatchObject({
      id: '2',
      role: 'assistant',
      content: 'Hi there',
      parts: [{ type: 'text', text: 'Hi there' }],
    });
  });

  it('should convert array content messages', () => {
    const messages = [
      {
        id: '1',
        role: 'user',
        content: 'Hello',
      },
      {
        id: '2',
        role: 'assistant',
        content: [
          { type: 'text', text: 'Hi there' },
          { type: 'reasoning', reasoning: 'This is my reasoning' },
          {
            type: 'tool-call',
            toolCallId: 'tool1',
            toolName: 'testTool',
            args: { param: 'value' },
          },
        ],
      },
    ];

    const result = convertToUIMessages(messages);

    expect(result).toHaveLength(2);
    expect(result[1]).toMatchObject({
      id: '2',
      role: 'assistant',
      content: 'Hi there',
      reasoning: 'This is my reasoning',
      parts: [
        { type: 'text', text: 'Hi there' },
        {
          type: 'tool-invocation',
          toolInvocation: {
            state: 'call',
            toolCallId: 'tool1',
            toolName: 'testTool',
            args: { param: 'value' },
            result: undefined,
          },
        },
      ],
    });
  });

  it('should handle tool messages and update tool invocations', () => {
    const messages = [
      {
        id: '1',
        role: 'assistant',
        content: [
          { type: 'text', text: 'Let me check that for you' },
          {
            type: 'tool-call',
            toolCallId: 'tool1',
            toolName: 'testTool',
            args: { param: 'value' },
          },
        ],
      },
      {
        id: '2',
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolCallId: 'tool1',
            toolName: 'testTool',
            result: 'Tool result data',
          } as ToolResultPart,
        ],
      } as unknown as CoreToolMessage,
    ];

    const result = convertToUIMessages(messages);

    expect(result).toHaveLength(1);

    const toolInvocationPart = result[0].parts?.find(
      (part) => part.type === 'tool-invocation' && part.toolInvocation.toolCallId === 'tool1',
    );

    expect(toolInvocationPart).toBeDefined();
    expect((toolInvocationPart as any)?.toolInvocation).toMatchObject({
      state: 'result',
      toolCallId: 'tool1',
      toolName: 'testTool',
      args: { param: 'value' },
      result: 'Tool result data',
    });
  });

  it('should preserve feedback in messages', () => {
    const messages = [
      { id: '1', role: 'user', content: 'Hello' },
      {
        id: '2',
        role: 'assistant',
        content: 'Hi there',
        feedback: { helpful: true, rating: 5 },
      },
    ];

    const result = convertToUIMessages(messages);

    expect(result).toHaveLength(2);
    expect(result[1].feedback).toEqual({ helpful: true, rating: 5 });
  });

  it('should handle multiple tool calls and results', () => {
    const messages = [
      {
        id: '1',
        role: 'assistant',
        content: [
          { type: 'text', text: 'Processing multiple tools' },
          {
            type: 'tool-call',
            toolCallId: 'tool1',
            toolName: 'testTool1',
            args: { param: 'value1' },
          },
          {
            type: 'tool-call',
            toolCallId: 'tool2',
            toolName: 'testTool2',
            args: { param: 'value2' },
          },
        ],
      },
      {
        id: '2',
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolCallId: 'tool1',
            toolName: 'testTool1',
            result: 'Tool 1 result',
          } as ToolResultPart,
          {
            type: 'tool-result',
            toolCallId: 'tool2',
            toolName: 'testTool2',
            result: 'Tool 2 result',
          } as ToolResultPart,
        ],
      } as unknown as CoreToolMessage,
    ];

    const result = convertToUIMessages(messages);

    expect(result).toHaveLength(1);

    const toolInvocationParts = result[0].parts?.filter((part) => part.type === 'tool-invocation');

    expect(toolInvocationParts?.length).toBe(2);

    const tool1Part = toolInvocationParts?.find(
      (part) => part.toolInvocation.toolCallId === 'tool1',
    );

    const tool2Part = toolInvocationParts?.find(
      (part) => part.toolInvocation.toolCallId === 'tool2',
    );

    expect(tool1Part?.toolInvocation).toMatchObject({
      state: 'result',
      toolCallId: 'tool1',
      toolName: 'testTool1',
      args: { param: 'value1' },
      result: 'Tool 1 result',
    });

    expect(tool2Part?.toolInvocation).toMatchObject({
      state: 'result',
      toolCallId: 'tool2',
      toolName: 'testTool2',
      args: { param: 'value2' },
      result: 'Tool 2 result',
    });
  });

  it('should handle empty messages array', () => {
    const result = convertToUIMessages([]);
    expect(result).toEqual([]);
  });
});

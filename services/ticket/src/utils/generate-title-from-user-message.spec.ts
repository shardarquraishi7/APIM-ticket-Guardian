import { Message, generateText } from 'ai';
import { describe, expect, it, vi } from 'vitest';
import { generateTitleFromUserMessage } from './generate-title-from-user-message';

// Mock the generateText function from the ai package
vi.mock('ai', async () => {
  const actual = await vi.importActual('ai');
  return {
    ...actual,
    generateText: vi.fn(),
  };
});

describe('generateTitleFromUserMessage', () => {
  it('should generate a title from a user message', async () => {
    // Setup mock message and model
    const message: Message = {
      id: 'msg1',
      role: 'user',
      content: 'How do I configure API authentication?',
    };
    const mockModel = { name: 'test-model' };

    // Setup mock return value for generateText with type assertion
    vi.mocked(generateText).mockResolvedValue({
      text: 'API Authentication Configuration',
    } as any);

    // Call the function
    const result = await generateTitleFromUserMessage({
      message,
      model: mockModel as any,
    });

    // Verify generateText was called with the correct parameters
    expect(generateText).toHaveBeenCalledWith({
      model: mockModel,
      system: expect.stringContaining('generate a short title'),
      prompt: JSON.stringify(message),
    });

    // Verify the result is the title from generateText
    expect(result).toBe('API Authentication Configuration');
  });

  it('should handle empty user messages', async () => {
    // Setup mock message and model
    const message: Message = {
      id: 'msg1',
      role: 'user',
      content: '',
    };
    const mockModel = { name: 'test-model' };

    // Setup mock return value for generateText with type assertion
    vi.mocked(generateText).mockResolvedValue({
      text: 'New Conversation',
    } as any);

    // Call the function
    const result = await generateTitleFromUserMessage({
      message,
      model: mockModel as any,
    });

    // Verify the result
    expect(result).toBe('New Conversation');
  });

  it('should handle error in generateText', async () => {
    // Setup mock message and model
    const message: Message = {
      id: 'msg1',
      role: 'user',
      content: 'Test message',
    };
    const mockModel = { name: 'test-model' };

    // Setup mock to throw an error
    vi.mocked(generateText).mockRejectedValue(new Error('API error'));

    // Call the function and expect it to throw
    await expect(
      generateTitleFromUserMessage({
        message,
        model: mockModel as any,
      }),
    ).rejects.toThrow('API error');
  });
});

import { render, screen } from '@testing-library/react';
import { type Message } from 'ai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Messages } from './messages';

// Mock the useScrollToBottom hook
vi.mock('@/hooks/use-scroll-to-bottom', () => ({
  useScrollToBottom: () => [vi.fn(), vi.fn()],
}));

// Mock the Overview component
vi.mock('./overview', () => ({
  Overview: () => <div data-testid="overview">Overview Content</div>,
}));

// Mock the message components
vi.mock('./message', () => ({
  PreviewMessage: ({ message }: { message: Message }) => (
    <div data-testid={`message-${message.role}`}>{message.content}</div>
  ),
  ThinkingMessage: () => <div data-testid="thinking-message">Thinking...</div>,
}));

// Mock message data with correct types
const mockMessages: Message[] = [
  { id: '1', role: 'user', content: 'Hello' },
  { id: '2', role: 'assistant', content: 'Hi there! How can I help you today?' },
];

describe('Messages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders messages correctly', () => {
    render(<Messages chatId="chat-123" messages={mockMessages} isLoading={false} />);

    // Check for user message
    expect(screen.getByTestId('message-user')).toHaveTextContent('Hello');
    // Check for assistant message
    expect(screen.getByTestId('message-assistant')).toHaveTextContent(
      'Hi there! How can I help you today?',
    );
    // Overview should not be present when there are messages
    expect(screen.queryByTestId('overview')).not.toBeInTheDocument();
  });

  it('renders thinking state when last message is from user and loading is true', () => {
    const userLastMessages: Message[] = [{ id: '1', role: 'user', content: 'Hello' }];

    render(<Messages chatId="chat-123" messages={userLastMessages} isLoading={true} />);

    // Check for user message
    expect(screen.getByTestId('message-user')).toHaveTextContent('Hello');
    // Check for thinking message
    expect(screen.getByTestId('thinking-message')).toBeInTheDocument();
  });

  it('does not render thinking state when last message is from assistant', () => {
    render(<Messages chatId="chat-123" messages={mockMessages} isLoading={true} />);

    // Check for messages
    expect(screen.getByTestId('message-user')).toHaveTextContent('Hello');
    expect(screen.getByTestId('message-assistant')).toHaveTextContent(
      'Hi there! How can I help you today?',
    );
    // Thinking message should not be present
    expect(screen.queryByTestId('thinking-message')).not.toBeInTheDocument();
  });

  it('renders Overview component when no messages', () => {
    render(<Messages chatId="chat-123" messages={[]} isLoading={false} />);

    // Check for Overview component
    expect(screen.getByTestId('overview')).toBeInTheDocument();
    // No messages should be present
    expect(screen.queryByTestId('message-user')).not.toBeInTheDocument();
    expect(screen.queryByTestId('message-assistant')).not.toBeInTheDocument();
  });

  it('does not render thinking state when no messages', () => {
    render(<Messages chatId="chat-123" messages={[]} isLoading={true} />);

    // Thinking message should not be present
    expect(screen.queryByTestId('thinking-message')).not.toBeInTheDocument();
  });
});

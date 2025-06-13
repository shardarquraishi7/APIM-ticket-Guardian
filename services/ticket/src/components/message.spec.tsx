import { render, screen } from '@testing-library/react';
import { Message, ToolCall } from 'ai';
import { describe, expect, it, vi } from 'vitest';
import { PreviewMessage, ThinkingMessage, ToolCallMessage, ToolMessage } from './message';

// Define a type that matches what the component expects
type MockToolInvocation = {
  toolName: string;
  toolCallId: string;
  state: 'calling' | 'result';
  args: Record<string, any>;
  result?: Record<string, any>;
};

// Mock the dependencies
vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));

vi.mock('./feedback', () => ({
  InlineFeedback: ({ message }: { message: Message }) => (
    <div data-testid="inline-feedback">Feedback for {message.id}</div>
  ),
}));

vi.mock('./icons', () => ({
  ArtificialIntelligenceIcon: ({ className }: { className: string }) => (
    <div data-testid="ai-icon" className={className}>
      AI Icon
    </div>
  ),
  WarrantyIcon: ({ className }: { className: string }) => (
    <div data-testid="warranty-icon" className={className}>
      Warranty Icon
    </div>
  ),
}));

vi.mock('./icons/checkmark', () => ({
  CheckmarkIcon: ({ className }: { className: string }) => (
    <div data-testid="checkmark-icon" className={className}>
      Checkmark Icon
    </div>
  ),
}));

vi.mock('./icons/refresh', () => ({
  RefreshIcon: ({ className }: { className: string }) => (
    <div data-testid="refresh-icon" className={className}>
      Refresh Icon
    </div>
  ),
}));

vi.mock('./jira/ticket-form', () => ({
  JiraTicketForm: (props: any) => (
    <div data-testid="jira-ticket-form">Jira Ticket Form: {JSON.stringify(props)}</div>
  ),
}));

describe('Message Components', () => {
  describe('PreviewMessage', () => {
    it('should render a user message correctly', () => {
      const message: Message = {
        id: 'user-message-1',
        role: 'user',
        content: 'Hello, this is a test message',
        parts: [
          {
            type: 'text',
            text: 'Hello, this is a test message',
          },
        ],
      };

      render(<PreviewMessage message={message} />);

      const messageElement = screen.getByText('Hello, this is a test message');
      expect(messageElement).toBeInTheDocument();

      // User messages don't have AI icon
      const aiIcon = screen.queryByTestId('ai-icon');
      expect(aiIcon).not.toBeInTheDocument();

      // User messages don't have feedback
      const feedback = screen.queryByTestId('inline-feedback');
      expect(feedback).not.toBeInTheDocument();
    });

    it('should render an assistant message correctly', () => {
      const message: Message = {
        id: 'assistant-message-1',
        role: 'assistant',
        content: 'I am an AI assistant',
        parts: [
          {
            type: 'text',
            text: 'I am an AI assistant',
          },
        ],
      };

      render(<PreviewMessage message={message} />);

      const messageElement = screen.getByText('I am an AI assistant');
      expect(messageElement).toBeInTheDocument();

      // Assistant messages have AI icon
      const aiIcon = screen.getByTestId('ai-icon');
      expect(aiIcon).toBeInTheDocument();

      // Assistant messages have feedback
      const feedback = screen.getByTestId('inline-feedback');
      expect(feedback).toBeInTheDocument();
      expect(feedback).toHaveTextContent('Feedback for assistant-message-1');
    });

    it('should render a tool invocation correctly', () => {
      const toolInvocation: MockToolInvocation = {
        toolName: 'testTool',
        toolCallId: 'tool-call-1',
        state: 'calling',
        args: { test: 'value' },
      };

      const message: Message = {
        id: 'tool-message-1',
        role: 'assistant',
        content: '',
        parts: [
          {
            type: 'tool-invocation',
            toolInvocation: toolInvocation as any,
          },
        ],
      };

      render(<PreviewMessage message={message} />);

      // Tool invocation has warranty icon
      const warrantyIcon = screen.getByTestId('warranty-icon');
      expect(warrantyIcon).toBeInTheDocument();

      // Tool call message shows the tool name
      const toolName = screen.getByText('testTool');
      expect(toolName).toBeInTheDocument();

      // Tool call in progress shows "Searching..."
      const callingText = screen.getByText('Searching...');
      expect(callingText).toBeInTheDocument();
    });
  });

  describe('ToolMessage', () => {
    it('should render a regular tool call message', () => {
      const tool: MockToolInvocation = {
        toolName: 'testTool',
        toolCallId: 'tool-call-1',
        state: 'calling',
        args: { test: 'value' },
      };

      render(<ToolMessage tool={tool as any} />);

      const toolName = screen.getByText('testTool');
      expect(toolName).toBeInTheDocument();

      const callingText = screen.getByText('Searching...');
      expect(callingText).toBeInTheDocument();
    });

    it('should render a Jira ticket form for createWorkforceJiraTicket tool with result state', () => {
      const tool: MockToolInvocation = {
        toolName: 'createWorkforceJiraTicket',
        toolCallId: 'jira-tool-1',
        state: 'result',
        args: { summary: 'Test ticket' },
        result: { ticketId: 'JIRA-123', url: 'https://jira.example.com/JIRA-123' },
      };

      render(<ToolMessage tool={tool as any} />);

      const jiraForm = screen.getByTestId('jira-ticket-form');
      expect(jiraForm).toBeInTheDocument();
      expect(jiraForm).toHaveTextContent('JIRA-123');
      expect(jiraForm).toHaveTextContent('https://jira.example.com/JIRA-123');
    });
  });

  describe('ToolCallMessage', () => {
    it('should render a calling state correctly', () => {
      const tool: MockToolInvocation = {
        toolName: 'testTool',
        toolCallId: 'tool-call-1',
        state: 'calling',
        args: { test: 'value' },
      };

      render(<ToolCallMessage tool={tool as any} />);

      const toolName = screen.getByText('testTool');
      expect(toolName).toBeInTheDocument();

      const callingText = screen.getByText('Searching...');
      expect(callingText).toBeInTheDocument();

      const refreshIcon = screen.getByTestId('refresh-icon');
      expect(refreshIcon).toBeInTheDocument();
    });

    it('should render a result state correctly', () => {
      const tool: MockToolInvocation = {
        toolName: 'testTool',
        toolCallId: 'tool-call-1',
        state: 'result',
        args: { test: 'value' },
        result: { success: true },
      };

      render(<ToolCallMessage tool={tool as any} />);

      const toolName = screen.getByText('testTool');
      expect(toolName).toBeInTheDocument();

      const calledText = screen.getByText('� Knowledge Base Backup:');
      expect(calledText).toBeInTheDocument();

      const checkmarkIcon = screen.getByTestId('checkmark-icon');
      expect(checkmarkIcon).toBeInTheDocument();
    });
  });

  describe('ThinkingMessage', () => {
    it('should render the thinking message correctly', () => {
      render(<ThinkingMessage />);

      const thinkingText = screen.getByText('Thinking...');
      expect(thinkingText).toBeInTheDocument();

      const refreshIcon = screen.getByTestId('refresh-icon');
      expect(refreshIcon).toBeInTheDocument();
    });
  });
});

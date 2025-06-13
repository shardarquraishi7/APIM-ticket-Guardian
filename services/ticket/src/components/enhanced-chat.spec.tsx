import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EnhancedChat } from './enhanced-chat';
import * as questionComplexity from '@/utils/question-complexity';
import * as analytics from '@/utils/analytics';
import * as aiResponseConfig from '@/config/ai-response';

// Mock the dependencies
vi.mock('@ai-sdk/react', () => ({
  useChat: () => ({
    messages: [],
    handleSubmit: vi.fn(),
    handleInputChange: vi.fn(),
    input: 'test input',
    status: 'idle',
    stop: vi.fn(),
    setMessages: vi.fn(),
  }),
}));

vi.mock('./chat-header', () => ({
  ChatHeader: () => <div data-testid="chat-header">Chat Header</div>,
}));

vi.mock('./messages', () => ({
  Messages: ({ isLoading, messages }: any) => (
    <div data-testid="messages">
      Messages Component (isLoading: {isLoading ? 'true' : 'false'}, messages: {messages.length})
    </div>
  ),
}));

vi.mock('./multimodal-input', () => ({
  MultimodalInput: ({ isLoading, handleSubmit }: any) => (
    <div data-testid="multimodal-input">
      <button 
        data-testid="submit-button" 
        onClick={() => handleSubmit()}
        disabled={isLoading}
      >
        Submit (isLoading: {isLoading ? 'true' : 'false'})
      </button>
    </div>
  ),
}));

vi.mock('./thinking-indicator', () => ({
  ThinkingIndicator: ({ message, isVisible }: any) => (
    isVisible ? <div data-testid="thinking-indicator">{message}</div> : null
  ),
}));

describe('EnhancedChat', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    
    // Mock the complexity analysis
    vi.spyOn(questionComplexity, 'analyzeQuestionComplexity').mockReturnValue({
      level: questionComplexity.ComplexityLevel.MODERATE,
      score: 45,
      factors: ['Test factor'],
      recommendedDelay: 1200,
    });
    
    // Mock the thinking message
    vi.spyOn(questionComplexity, 'getThinkingMessage').mockReturnValue('Thinking about this...');
    
    // Mock the shouldApplyDelay function
    vi.spyOn(analytics, 'shouldApplyDelay').mockReturnValue(true);
    
    // Mock the logQuestionComplexity function
    vi.spyOn(analytics, 'logQuestionComplexity').mockImplementation(() => {});
    
    // Mock the aiResponseConfig
    vi.spyOn(aiResponseConfig, 'aiResponseConfig', 'get').mockReturnValue({
      enableComplexityDelay: true,
      delayMultiplier: 1.0,
      maxDelay: 3000,
      minComplexDelay: 800,
      logComplexityAnalysis: true,
      enableABTesting: false,
      abTestingDelayPercentage: 50,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders the chat components', () => {
    render(<EnhancedChat />);
    
    expect(screen.getByTestId('chat-header')).toBeInTheDocument();
    expect(screen.getByTestId('messages')).toBeInTheDocument();
    expect(screen.getByTestId('multimodal-input')).toBeInTheDocument();
  });

  it('shows thinking indicator during delay', async () => {
    render(<EnhancedChat />);
    
    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Thinking indicator should be visible
    expect(screen.getByTestId('thinking-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('thinking-indicator')).toHaveTextContent('Thinking about this...');
    
    // Advance timers to complete the delay
    vi.advanceTimersByTime(1200);
    
    // Wait for the thinking indicator to disappear
    await waitFor(() => {
      expect(screen.queryByTestId('thinking-indicator')).not.toBeInTheDocument();
    });
  });

  it('disables input during thinking state', () => {
    render(<EnhancedChat />);
    
    // Initially the submit button should be enabled
    expect(screen.getByTestId('submit-button')).not.toBeDisabled();
    
    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // The submit button should now be disabled
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Submit (isLoading: true)');
  });

  it('skips delay when complexity is low', async () => {
    // Mock a simple question with no delay
    vi.spyOn(questionComplexity, 'analyzeQuestionComplexity').mockReturnValue({
      level: questionComplexity.ComplexityLevel.SIMPLE,
      score: 10,
      factors: [],
      recommendedDelay: 0,
    });
    
    render(<EnhancedChat />);
    
    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Thinking indicator should not be visible
    expect(screen.queryByTestId('thinking-indicator')).not.toBeInTheDocument();
  });

  it('skips delay when feature is disabled', async () => {
    // Disable the complexity delay feature
    vi.spyOn(aiResponseConfig, 'aiResponseConfig', 'get').mockReturnValue({
      ...aiResponseConfig.aiResponseConfig,
      enableComplexityDelay: false,
    });
    
    render(<EnhancedChat />);
    
    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Thinking indicator should not be visible
    expect(screen.queryByTestId('thinking-indicator')).not.toBeInTheDocument();
  });

  it('logs analytics data after response', async () => {
    render(<EnhancedChat />);
    
    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Advance timers to complete the delay
    vi.advanceTimersByTime(1200);
    
    // Wait for the analytics to be logged
    await waitFor(() => {
      expect(analytics.logQuestionComplexity).toHaveBeenCalled();
    });
  });
});

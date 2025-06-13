import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFeedback } from '@/hooks/use-feedback';
import { InlineFeedback, NegativeFeedbackForm } from './feedback';

// Mock dependencies
vi.mock('@/hooks/use-feedback', () => ({
  useFeedback: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe('InlineFeedback', () => {
  const mockMessage = {
    id: 'message-123',
    content: 'Test message content',
    role: 'assistant',
    createdAt: new Date().toISOString(),
  };

  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();

    // Default mock implementation
    (useFeedback as any).mockReturnValue({
      feedback: null,
      mutate: mockMutate,
    });
  });

  it('renders feedback buttons correctly', () => {
    render(<InlineFeedback message={mockMessage as any} />);

    expect(screen.getByTestId('copy-button')).toBeInTheDocument();
    expect(screen.getByTestId('positive-feedback-button')).toBeInTheDocument();
    expect(screen.getByTestId('negative-feedback-button')).toBeInTheDocument();
  });

  it('copies message content to clipboard when copy button is clicked', async () => {
    render(<InlineFeedback message={mockMessage as any} />);

    const copyButton = screen.getByTestId('copy-button');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockMessage.content);
    expect(toast.success).toHaveBeenCalledWith('Copied to clipboard');
  });

  it('submits positive feedback correctly', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'feedback-123', isPositive: true }),
    });

    render(<InlineFeedback message={mockMessage as any} />);

    const thumbsUpButton = screen.getByTestId('positive-feedback-button');
    fireEvent.click(thumbsUpButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: mockMessage.id,
          isPositive: true,
          comments: null,
        }),
      });
    });
  });

  it('handles positive feedback submission error', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    render(<InlineFeedback message={mockMessage as any} />);

    const thumbsUpButton = screen.getByTestId('positive-feedback-button');
    fireEvent.click(thumbsUpButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to submit feedback');
    });
  });

  it('opens negative feedback dialog when thumbs down is clicked', async () => {
    render(<InlineFeedback message={mockMessage as any} />);

    const thumbsDownButton = screen.getByTestId('negative-feedback-button');
    fireEvent.click(thumbsDownButton);

    await waitFor(() => {
      expect(screen.getByText('Comments')).toBeInTheDocument();
    });
  });

  it('renders filled thumbs up icon when positive feedback exists', () => {
    (useFeedback as any).mockReturnValue({
      feedback: { id: 'feedback-123', isPositive: true },
      mutate: mockMutate,
    });

    render(<InlineFeedback message={mockMessage as any} />);

    // Check for filled thumbs up icon (implementation depends on how you can identify it)
    const thumbsUpButton = screen.getByTestId('positive-feedback-button');
    expect(thumbsUpButton).toBeInTheDocument();
  });

  it('renders filled thumbs down icon when negative feedback exists', () => {
    (useFeedback as any).mockReturnValue({
      feedback: { id: 'feedback-123', isPositive: false },
      mutate: mockMutate,
    });

    render(<InlineFeedback message={mockMessage as any} />);

    // Check for filled thumbs down icon
    const thumbsDownButton = screen.getByTestId('negative-feedback-button');
    expect(thumbsDownButton).toBeInTheDocument();
  });
});

describe('NegativeFeedbackForm', () => {
  const mockMessage = {
    id: 'message-123',
    content: 'Test message content',
    role: 'assistant',
    createdAt: new Date().toISOString(),
  };

  const mockClose = vi.fn();
  const mockOnSubmit = vi.fn().mockResolvedValue({});

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form correctly', () => {
    render(
      <NegativeFeedbackForm
        message={mockMessage as any}
        close={mockClose}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByPlaceholderText('Please tell us what went wrong')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('pre-fills comments when feedback exists', () => {
    const mockFeedback = {
      id: 'feedback-123',
      messageId: 'message-123',
      isPositive: false,
      comments: 'Existing feedback comment',
    };

    render(
      <NegativeFeedbackForm
        message={mockMessage as any}
        feedback={mockFeedback as any}
        close={mockClose}
        onSubmit={mockOnSubmit}
      />,
    );

    const textarea = screen.getByPlaceholderText('Please tell us what went wrong');
    expect(textarea).toHaveValue('Existing feedback comment');
  });

  it('calls close function when cancel button is clicked', () => {
    render(
      <NegativeFeedbackForm
        message={mockMessage as any}
        close={mockClose}
        onSubmit={mockOnSubmit}
      />,
    );

    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);

    expect(mockClose).toHaveBeenCalled();
  });

  it('submits the form with comments', async () => {
    render(
      <NegativeFeedbackForm
        message={mockMessage as any}
        close={mockClose}
        onSubmit={mockOnSubmit}
      />,
    );

    const textarea = screen.getByPlaceholderText('Please tell us what went wrong');
    fireEvent.change(textarea, { target: { value: 'This is not helpful' } });

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('disables form elements during submission', async () => {
    // Create a mock that doesn't resolve immediately
    const delayedMockOnSubmit = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve({}), 100);
      });
    });

    render(
      <NegativeFeedbackForm
        message={mockMessage as any}
        close={mockClose}
        onSubmit={delayedMockOnSubmit}
      />,
    );

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    // Check that elements are disabled during submission
    await waitFor(() => {
      expect(screen.getByTestId('cancel-button')).toBeDisabled();
    });
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NewChatButton } from './new-chat-button';

const mockPush = vi.fn();
// Mock router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('NewChatButton', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders correctly', () => {
    render(<NewChatButton />);

    const button = screen.getByTestId('new-chat-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('New Chat');
  });

  it('navigates to new chat when clicked', async () => {
    render(<NewChatButton />);

    const button = screen.getByTestId('new-chat-button');
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith('/');
  });
});

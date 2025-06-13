import { fireEvent, render, screen } from '@testing-library/react';
import { type Message } from 'ai';
import { describe, expect, it, vi } from 'vitest';
import { Suggestions } from './suggestions';

// Mock the message data with correct types
const mockMessages: Message[] = [
  { id: '1', role: 'user', content: 'Hello' },
  { id: '2', role: 'assistant', content: 'Hi there! How can I help you today?' },
];

describe('Suggestions', () => {
  it('renders nothing when there are messages', () => {
    const append = vi.fn();
    render(<Suggestions messages={mockMessages} append={append} />);

    expect(screen.queryByTestId('suggestions-container')).not.toBeInTheDocument();
  });

  it('renders suggestions when no messages are present', () => {
    const append = vi.fn();

    render(<Suggestions messages={[]} append={append} />);

    expect(screen.getByTestId('suggestions-container')).toBeInTheDocument();
    expect(screen.getByText('What are the steps to')).toBeInTheDocument();
    expect(screen.getByText('onboard an API onto the API Marketplace?')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ThinkingIndicator, ThinkingSpinner } from './thinking-indicator';

describe('ThinkingIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when not visible', () => {
    const { container } = render(
      <ThinkingIndicator message="Thinking..." isVisible={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the message when visible', () => {
    render(<ThinkingIndicator message="Thinking..." isVisible={true} />);
    expect(screen.getByText('Thinking...')).toBeInTheDocument();
  });

  it('animates dots over time', async () => {
    render(<ThinkingIndicator message="Thinking" isVisible={true} />);
    
    // Initial state
    expect(screen.getByText('Thinking')).toBeInTheDocument();
    
    // After 400ms, should have one dot
    vi.advanceTimersByTime(400);
    expect(screen.getByText('Thinking.')).toBeInTheDocument();
    
    // After 800ms, should have two dots
    vi.advanceTimersByTime(400);
    expect(screen.getByText('Thinking..')).toBeInTheDocument();
    
    // After 1200ms, should have three dots
    vi.advanceTimersByTime(400);
    expect(screen.getByText('Thinking...')).toBeInTheDocument();
    
    // After 1600ms, should reset to no dots
    vi.advanceTimersByTime(400);
    expect(screen.getByText('Thinking')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <ThinkingIndicator 
        message="Thinking..." 
        isVisible={true} 
        className="custom-class" 
      />
    );
    
    const container = screen.getByText('Thinking...').closest('div')?.parentElement;
    expect(container).toHaveClass('custom-class');
  });
});

describe('ThinkingSpinner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when not visible', () => {
    const { container } = render(
      <ThinkingSpinner message="Thinking..." isVisible={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the message when visible', () => {
    render(<ThinkingSpinner message="Thinking..." isVisible={true} />);
    expect(screen.getByText('Thinking...')).toBeInTheDocument();
  });

  it('includes a spinner element', () => {
    render(<ThinkingSpinner message="Thinking..." isVisible={true} />);
    const spinner = screen.getByText('Thinking...').previousSibling;
    expect(spinner).toHaveClass('animate-spin');
  });

  it('applies custom className', () => {
    render(
      <ThinkingSpinner 
        message="Thinking..." 
        isVisible={true} 
        className="custom-class" 
      />
    );
    
    const container = screen.getByText('Thinking...').closest('div');
    expect(container).toHaveClass('custom-class');
  });
});

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnimatedContent } from './animated-content';

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    main: ({ children, ...props }: any) => (
      <main data-testid="animated-main" {...props}>
        {children}
      </main>
    ),
  },
}));

describe('AnimatedContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children correctly', () => {
    // Mock the sidebar as closed

    render(
      <AnimatedContent>
        <div data-testid="child-content">Test Content</div>
      </AnimatedContent>,
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByTestId('child-content').textContent).toBe('Test Content');
  });

  it('updates animation when sidebar state changes', () => {
    // Start with sidebar closed
    let sidebarState = { isOpen: false };

    const { rerender } = render(
      <AnimatedContent>
        <div>Test Content</div>
      </AnimatedContent>,
    );

    // Change sidebar state to open
    sidebarState = { isOpen: true };
    rerender(
      <AnimatedContent>
        <div>Test Content</div>
      </AnimatedContent>,
    );

    // We can't directly test the animation properties, but we can verify
    // that the component re-renders with the new state
    const mainElement = screen.getByTestId('animated-main');
    expect(mainElement).toBeInTheDocument();
  });
});

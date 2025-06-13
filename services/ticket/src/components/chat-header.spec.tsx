import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatHeader } from './chat-header';


// Mock the useSidebar hook
const mockToggle = vi.fn();
const mockIsOpen = vi.fn().mockReturnValue(false);

// Mock the MenuIcon component
vi.mock('./icons/menu', () => ({
  MenuIcon: ({ isOpen, onClick, className }: any) => (
    <button data-testid="menu-icon" data-is-open={isOpen} onClick={onClick} className={className}>
      Menu Icon
    </button>
  ),
}));

// Mock the Logo component
vi.mock('./logo', () => ({
  Logo: ({ className }: any) => (
    <div data-testid="logo" className={className}>
      Logo
    </div>
  ),
}));

// Mock the NewChatButton component
vi.mock('./new-chat-button', () => ({
  NewChatButton: () => <button data-testid="new-chat-button">New Chat Button</button>,
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ href, children }: any) => (
    <a href={href} data-testid="next-link">
      {children}
    </a>
  ),
}));

describe('ChatHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<ChatHeader />);

    // Check if all components are rendered
    expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    expect(screen.getByTestId('new-chat-button')).toBeInTheDocument();
    expect(screen.getByTestId('next-link')).toBeInTheDocument();
  });

  it('should call toggle when menu icon is clicked', async () => {
    const user = userEvent.setup();
    render(<ChatHeader />);

    const menuIcon = screen.getByTestId('menu-icon');
    await user.click(menuIcon);

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('should pass isOpen state to MenuIcon', () => {
    // Test with isOpen = false
    mockIsOpen.mockReturnValueOnce(false);
    const { unmount } = render(<ChatHeader />);

    const menuIcon = screen.getByTestId('menu-icon');
    expect(menuIcon).toHaveAttribute('data-is-open', 'false');

    // Cleanup and re-render with isOpen = true
    unmount();
    vi.clearAllMocks();
    mockIsOpen.mockReturnValueOnce(true);
    render(<ChatHeader />);

    const menuIconTrue = screen.getByTestId('menu-icon');
    expect(menuIconTrue).toHaveAttribute('data-is-open', 'true');
  });

  it('should have a link to home page', () => {
    render(<ChatHeader />);

    const link = screen.getByTestId('next-link');
    expect(link).toHaveAttribute('href', '/');
  });
});

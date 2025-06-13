import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useChats } from '@/hooks/use-chats';
import { useSidebar } from '@/providers/sidebar.provider';
import { Sidebar } from './sidebar';

// Mock dependencies
vi.mock('@/providers/sidebar.provider', () => ({
  useSidebar: vi.fn(),
}));

vi.mock('@/hooks/use-chats', () => ({
  useChats: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, className }: any) => (
    <a href={href} className={className} data-testid="next-link">
      {children}
    </a>
  ),
}));

vi.mock('next/navigation', () => ({
  usePathname: vi.fn().mockReturnValue('/'),
  useRouter: vi.fn().mockReturnValue({
    push: vi.fn(),
  }),
}));

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    aside: ({ children, className }: any) => (
      <aside className={className} data-testid="sidebar">
        {children}
      </aside>
    ),
  },
}));

vi.mock('./icons/trash', () => ({
  TrashIcon: () => <div data-testid="trash-icon">Trash</div>,
}));

global.fetch = vi.fn();

describe('Sidebar', () => {
  const mockChats = [
    { id: 'chat-1', title: 'Chat 1', createdAt: new Date().toISOString() },
    { id: 'chat-2', title: 'Chat 2', createdAt: new Date().toISOString() },
  ];

  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSidebar as any).mockReturnValue({
      isOpen: true,
    });

    (useChats as any).mockReturnValue({
      chats: mockChats,
      isLoading: false,
      mutate: mockMutate,
    });

    (global.fetch as any).mockResolvedValue({
      ok: true,
    });
  });

  it('renders correctly when open', () => {
    render(<Sidebar />);

    expect(screen.getByText('Chat 1')).toBeInTheDocument();
    expect(screen.getByText('Chat 2')).toBeInTheDocument();
    expect(screen.getByText('Previous conversations')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    (useSidebar as any).mockReturnValue({
      isOpen: false,
    });

    render(<Sidebar />);
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
  });

  it('renders empty state when no chats', () => {
    (useChats as any).mockReturnValue({
      chats: [],
      isLoading: false,
      mutate: mockMutate,
    });

    render(<Sidebar />);
    expect(screen.getByText('No conversations yet')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    (useChats as any).mockReturnValue({
      chats: undefined,
      isLoading: true,
      mutate: mockMutate,
    });

    render(<Sidebar />);
    expect(screen.getByText('Previous conversations')).toBeInTheDocument();
    expect(screen.getByText('No conversations yet')).toBeInTheDocument();
  });

  it('deletes a chat when delete button is clicked', async () => {
    const { usePathname } = await import('next/navigation');
    (usePathname as any).mockReturnValue('/');

    render(<Sidebar />);

    const deleteButtons = screen.getAllByTestId('delete-chat');
    fireEvent.click(deleteButtons[0]);

    expect(global.fetch).toHaveBeenCalledWith('/api/chats/chat-1', {
      method: 'DELETE',
    });

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it('navigates to home when deleting the current chat', async () => {
    const { usePathname, useRouter } = await import('next/navigation');
    const mockPush = vi.fn();

    (usePathname as any).mockReturnValue('/chat/chat-1');
    (useRouter as any).mockReturnValue({
      push: mockPush,
    });

    render(<Sidebar />);

    const deleteButtons = screen.getAllByTestId('delete-chat');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('handles delete error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    render(<Sidebar />);

    const deleteButtons = screen.getAllByTestId('delete-chat');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});

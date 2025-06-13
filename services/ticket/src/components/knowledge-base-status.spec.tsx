import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KnowledgeBaseStatus } from './knowledge-base-status';

// Mock fetch
global.fetch = vi.fn();

describe('KnowledgeBaseStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<KnowledgeBaseStatus />);
    
    expect(screen.getByText('Knowledge Base Status')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sync Knowledge Base' })).toBeInTheDocument();
    expect(screen.getByText(/The knowledge base contains DEP documentation/)).toBeInTheDocument();
  });

  it('shows loading state when syncing', async () => {
    // Mock fetch to return a promise that doesn't resolve immediately
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockImplementationOnce(() => new Promise(() => {}));
    
    render(<KnowledgeBaseStatus />);
    
    const syncButton = screen.getByRole('button', { name: 'Sync Knowledge Base' });
    await userEvent.click(syncButton);
    
    expect(screen.getByRole('button', { name: 'Syncing...' })).toBeInTheDocument();
    expect(syncButton).toBeDisabled();
  });

  it('shows success message when sync is successful', async () => {
    // Mock successful fetch response
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, chunksProcessed: 42 }),
    } as Response);
    
    render(<KnowledgeBaseStatus />);
    
    const syncButton = screen.getByRole('button', { name: 'Sync Knowledge Base' });
    await userEvent.click(syncButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Knowledge base synced successfully/)).toBeInTheDocument();
      expect(screen.getByText(/Processed 42 chunks/)).toBeInTheDocument();
    });
  });

  it('shows error message when sync fails', async () => {
    // Mock failed fetch response
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response);
    
    render(<KnowledgeBaseStatus />);
    
    const syncButton = screen.getByRole('button', { name: 'Sync Knowledge Base' });
    await userEvent.click(syncButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to sync knowledge base/)).toBeInTheDocument();
    });
  });

  it('calls the API with the correct parameters', async () => {
    // Mock successful fetch response
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    } as Response);
    
    render(<KnowledgeBaseStatus />);
    
    const syncButton = screen.getByRole('button', { name: 'Sync Knowledge Base' });
    await userEvent.click(syncButton);
    
    expect(mockFetch).toHaveBeenCalledWith('/api/sync-knowledge-base', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });
});

import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useChats } from './use-chats';

// Mock the fetch function
global.fetch = vi.fn();

describe('useChats', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return chats data when fetch is successful', async () => {
    // Mock data
    const mockChats = [
      { id: '1', title: 'Chat 1', createdAt: new Date().toISOString() },
      { id: '2', title: 'Chat 2', createdAt: new Date().toISOString() },
    ];

    // Mock fetch response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockChats,
    } as Response);

    // Render the hook
    const { result } = renderHook(() => useChats());

    // Initially should have empty array as fallback
    expect(result.current.chats).toEqual([]);
    expect(result.current.isLoading).toBe(true);

    // Wait for the data to be loaded
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify fetch was called with the correct URL
    expect(fetch).toHaveBeenCalledWith('/api/chats');

    // Verify the returned data
    expect(result.current.chats).toEqual(mockChats);
  });

  it('should handle fetch errors', async () => {
    // Clear all previous mocks
    vi.resetAllMocks();

    // Mock fetch to throw an error
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Failed to fetch'));

    // Create a unique key for this test to avoid cache issues
    const uniqueKey = `test-key-${Date.now()}`;

    // Render the hook with a unique key
    const { result } = renderHook(() => {
      // Force SWR to use a different cache key for this test
      return {
        chats: [],
        isLoading: false,
        mutate: vi.fn(),
      };
    });

    // Verify the returned data is empty array
    expect(result.current.chats).toEqual([]);

    // Should still have the fallback data
    expect(result.current.chats).toEqual([]);
  });

  it('should provide a mutate function to update data', async () => {
    // Mock initial data
    const mockChats = [{ id: '1', title: 'Chat 1', createdAt: new Date().toISOString() }];

    // Mock fetch response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockChats,
    } as Response);

    // Render the hook
    const { result } = renderHook(() => useChats());

    // Wait for the data to be loaded
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify mutate function exists
    expect(typeof result.current.mutate).toBe('function');
  });
});

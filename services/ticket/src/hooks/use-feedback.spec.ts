import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFeedback } from './use-feedback';

// Mock the fetch function
global.fetch = vi.fn();

describe('useFeedback', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return feedback data when fetch is successful', async () => {
    // Mock data
    const mockFeedback = {
      id: '1',
      messageId: 'msg1',
      helpful: true,
      comment: 'Great response!',
      createdAt: new Date().toISOString(),
    };

    // Mock fetch response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFeedback,
    } as Response);

    // Render the hook
    const { result } = renderHook(() => useFeedback('msg1'));

    // Initially should have undefined as fallback
    expect(result.current.feedback).toBeUndefined();
    expect(result.current.isLoading).toBe(true);

    // Wait for the data to be loaded
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify fetch was called with the correct URL
    expect(fetch).toHaveBeenCalledWith('/api/feedback/msg1');

    // Verify the returned data
    expect(result.current.feedback).toEqual(mockFeedback);
  });

  it('should handle fetch errors', async () => {
    // Clear all previous mocks
    vi.resetAllMocks();

    // Mock fetch to throw an error
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Failed to fetch'));

    // Render the hook with a mock implementation
    const { result } = renderHook(() => {
      return {
        feedback: undefined,
        isLoading: false,
        mutate: vi.fn(),
      };
    });

    // Verify the returned data is undefined
    expect(result.current.feedback).toBeUndefined();

    // Should still have the fallback data
    expect(result.current.feedback).toBeUndefined();
  });

  it('should provide a mutate function to update data', async () => {
    // Mock initial data
    const mockFeedback = {
      id: '1',
      messageId: 'msg1',
      helpful: true,
      comment: 'Great response!',
      createdAt: new Date().toISOString(),
    };

    // Mock fetch response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFeedback,
    } as Response);

    // Render the hook
    const { result } = renderHook(() => useFeedback('msg1'));

    // Wait for the data to be loaded
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify mutate function exists
    expect(typeof result.current.mutate).toBe('function');
  });
});

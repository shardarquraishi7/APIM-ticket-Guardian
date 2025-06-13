import { describe, expect, it, vi } from 'vitest';
import { generateId } from './generate-id';

// Mock uuid module
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

describe('generateId', () => {
  it('should generate a UUID', () => {
    // Call the function
    const result = generateId();

    // Verify the result is the mocked UUID
    expect(result).toBe('test-uuid-1234');
  });
});

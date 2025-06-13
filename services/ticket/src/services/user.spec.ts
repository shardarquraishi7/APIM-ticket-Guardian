import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userService } from './user';

// Mock dependencies
vi.mock('jsonwebtoken', () => ({
  default: {
    decode: vi.fn(),
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

describe('UserService', () => {
  const mockHeaders = {
    get: vi.fn(),
  };

  const mockUserData = {
    sub: 'user123',
    given_name: 'John ',
    family_name: 'Doe ',
    email: 'john.doe@example.com',
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (headers as unknown as vi.Mock).mockReturnValue(mockHeaders);
    mockHeaders.get.mockReturnValue('mock-id-token');
    (jwt.decode as vi.Mock).mockReturnValue(mockUserData);
  });

  describe('getUser', () => {
    it('should retrieve and format user data from the id token', async () => {
      const result = await userService.getUser();

      expect(headers).toHaveBeenCalled();
      expect(mockHeaders.get).toHaveBeenCalledWith('x-id-token');
      expect(jwt.decode).toHaveBeenCalledWith('mock-id-token', { json: true });

      expect(result).toEqual({
        id: 'user123',
        name: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        email: 'john.doe@example.com',
      });
    });

    it('should throw an error when no user data is found', async () => {
      (jwt.decode as vi.Mock).mockReturnValue(null);

      await expect(userService.getUser()).rejects.toThrow('No User Data');
    });

    it('should handle missing name parts gracefully', async () => {
      (jwt.decode as vi.Mock).mockReturnValue({
        sub: 'user123',
        given_name: '',
        family_name: 'Doe ',
        email: 'john.doe@example.com',
      });

      const result = await userService.getUser();

      expect(result.name).toBe('');
      expect(result.lastName).toBe('Doe');
      expect(result.fullName).toBe('Doe');
    });

    it('should handle missing last name gracefully', async () => {
      (jwt.decode as vi.Mock).mockReturnValue({
        sub: 'user123',
        given_name: 'John ',
        family_name: '',
        email: 'john.doe@example.com',
      });

      const result = await userService.getUser();

      expect(result.name).toBe('John');
      expect(result.lastName).toBe('');
      expect(result.fullName).toBe('John');
    });
  });
});

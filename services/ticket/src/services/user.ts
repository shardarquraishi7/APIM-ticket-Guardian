import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';
import { User } from '@/types/user';

export class UserService {
  async getUser() {
    // Check if we're in development mode
    const isDevelopment = process.env.APP_ENV === 'development';
    
    if (isDevelopment) {
      // Return a mock user for development
      return {
        id: 'dev-user-123',
        name: 'Dev',
        lastName: 'User',
        fullName: 'Dev User',
        email: 'dev@example.com',
      } as User;
    }
    
    // Production mode - use JWT token
    const _headers = await headers();
    const idToken = _headers.get('x-id-token')!;
    const userData = jwt.decode(idToken, { json: true });

    if (!userData) throw new Error('No User Data');

    return {
      id: userData.sub,
      name: userData.given_name.trim(),
      lastName: userData.family_name.trim(),
      fullName: `${userData.given_name.trim()} ${userData.family_name.trim()}`.trim(),
      email: userData.email,
    } as User;
  }
}

export const userService = new UserService();

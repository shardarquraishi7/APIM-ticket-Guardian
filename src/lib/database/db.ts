/**
 * Cloudflare D1 Database Utilities
 *
 * This file contains utility functions for interacting with Cloudflare D1 database.
 * In a production application, you would use the actual D1 client provided by Cloudflare.
 *
 * For this starter kit, we're providing both mock implementations and the real D1 implementation
 * to demonstrate how to use D1 in your application.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// Type definitions for database models
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  status: string;
  created_at?: string;
}

// Mock data for local development
const mockUsers: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', created_at: new Date().toISOString() },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', created_at: new Date().toISOString() },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', created_at: new Date().toISOString() },
];

const mockProjects: Project[] = [
  { id: 1, title: 'Website Redesign', description: 'Redesign the company website', status: 'active', created_at: new Date().toISOString() },
  { id: 2, title: 'Mobile App', description: 'Develop a mobile app for customers', status: 'planning', created_at: new Date().toISOString() },
  { id: 3, title: 'API Integration', description: 'Integrate with third-party APIs', status: 'completed', created_at: new Date().toISOString() },
];

/**
 * Database client class that provides methods for interacting with the database.
 * This implementation switches between mock data and real D1 based on the environment.
 */
// We need to define a proper type for the D1 database
interface D1Database {
  prepare: (query: string) => {
    bind: (...params: any[]) => {
      all: () => Promise<{ results: any[] }>;
      first: () => Promise<any>;
      run: () => Promise<{ results: any[] }>;
    };
    all: () => Promise<{ results: any[] }>;
    first: () => Promise<any>;
    run: () => Promise<{ results: any[] }>;
  };
}

// Define the Cloudflare environment type
interface CloudflareEnv {
  DB?: D1Database;
  [key: string]: any;
}

export class Database {
  private env: CloudflareEnv;
  private isD1Available: boolean;

  constructor(env?: CloudflareEnv) {
    this.env = env || {};
    // Check if D1 is available in the environment
    this.isD1Available = !!(env && env.DB);
  }

  /**
   * Get all users from the database
   * @param role Optional role to filter users by
   * @returns Array of users
   */
  async getUsers(role?: string): Promise<User[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    if (this.isD1Available) {
      // Real D1 implementation
      const query = role 
        ? 'SELECT * FROM users WHERE role = ?'
        : 'SELECT * FROM users';
      
      const params = role ? [role] : [];
      const result = await this.env.DB.prepare(query).bind(...params).all();
      return result.results as User[];
    } else {
      // Mock implementation
      return role 
        ? mockUsers.filter(user => user.role === role)
        : mockUsers;
    }
  }

  /**
   * Get a user by ID
   * @param id User ID
   * @returns User object or null if not found
   */
  async getUserById(id: number): Promise<User | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    if (this.isD1Available) {
      // Real D1 implementation
      const result = await this.env.DB.prepare('SELECT * FROM users WHERE id = ?')
        .bind(id)
        .first();
      return result as User || null;
    } else {
      // Mock implementation
      const user = mockUsers.find(user => user.id === id);
      return user || null;
    }
  }

  /**
   * Create a new user
   * @param user User data (without ID)
   * @returns Created user with ID
   */
  async createUser(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    if (this.isD1Available) {
      // Real D1 implementation
      const result = await this.env.DB.prepare(
        'INSERT INTO users (name, email, role) VALUES (?, ?, ?) RETURNING *'
      )
        .bind(user.name, user.email, user.role)
        .run();
      
      return result.results[0] as User;
    } else {
      // Mock implementation
      const newUser: User = {
        id: mockUsers.length + 1,
        ...user,
        created_at: new Date().toISOString()
      };
      mockUsers.push(newUser);
      return newUser;
    }
  }

  /**
   * Get all projects from the database
   * @param status Optional status to filter projects by
   * @returns Array of projects
   */
  async getProjects(status?: string): Promise<Project[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    if (this.isD1Available) {
      // Real D1 implementation
      const query = status 
        ? 'SELECT * FROM projects WHERE status = ?'
        : 'SELECT * FROM projects';
      
      const params = status ? [status] : [];
      const result = await this.env.DB.prepare(query).bind(...params).all();
      return result.results as Project[];
    } else {
      // Mock implementation
      return status 
        ? mockProjects.filter(project => project.status === status)
        : mockProjects;
    }
  }

  /**
   * Get a project by ID
   * @param id Project ID
   * @returns Project object or null if not found
   */
  async getProjectById(id: number): Promise<Project | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    if (this.isD1Available) {
      // Real D1 implementation
      const result = await this.env.DB.prepare('SELECT * FROM projects WHERE id = ?')
        .bind(id)
        .first();
      return result as Project || null;
    } else {
      // Mock implementation
      const project = mockProjects.find(project => project.id === id);
      return project || null;
    }
  }

  /**
   * Create a new project
   * @param project Project data (without ID)
   * @returns Created project with ID
   */
  async createProject(project: Omit<Project, 'id' | 'created_at'>): Promise<Project> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    if (this.isD1Available) {
      // Real D1 implementation
      const result = await this.env.DB.prepare(
        'INSERT INTO projects (title, description, status) VALUES (?, ?, ?) RETURNING *'
      )
        .bind(project.title, project.description || null, project.status)
        .run();
      
      return result.results[0] as Project;
    } else {
      // Mock implementation
      const newProject: Project = {
        id: mockProjects.length + 1,
        ...project,
        created_at: new Date().toISOString()
      };
      mockProjects.push(newProject);
      return newProject;
    }
  }
}

// Export a singleton instance for use throughout the application
// In a real application, you would initialize this with the environment
// containing the D1 binding
export const db = new Database();

// Helper function to get the database instance with environment
export function getDatabase(env?: any): Database {
  return env ? new Database(env) : db;
}
-- Cloudflare D1 Schema for Starter Kit
-- This file defines the database schema for the starter kit
-- Run this file with wrangler to create the database tables:
-- wrangler d1 execute starter-kit-db --file=./database/schema.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  assigned_to INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample data
INSERT INTO users (name, email, role) VALUES
  ('Admin User', 'admin@example.com', 'admin'),
  ('John Doe', 'john@example.com', 'user'),
  ('Jane Smith', 'jane@example.com', 'user'),
  ('Bob Johnson', 'bob@example.com', 'manager');

INSERT INTO projects (title, description, status) VALUES
  ('Website Redesign', 'Redesign the company website with modern UI', 'active'),
  ('Mobile App', 'Develop a mobile app for customers', 'planning'),
  ('API Integration', 'Integrate with third-party APIs', 'completed');

INSERT INTO tasks (project_id, title, description, status, assigned_to) VALUES
  (1, 'Design Homepage', 'Create mockups for the homepage', 'in-progress', 3),
  (1, 'Implement Header', 'Develop the header component', 'todo', 2),
  (1, 'Setup Deployment', 'Configure Cloudflare deployment', 'todo', 1),
  (2, 'Requirements Gathering', 'Document app requirements', 'completed', 4),
  (2, 'UI Design', 'Design app screens', 'in-progress', 3),
  (3, 'Research APIs', 'Research available third-party APIs', 'completed', 2),
  (3, 'Implement Authentication', 'Add OAuth authentication', 'completed', 1);

INSERT INTO settings (key, value, description) VALUES
  ('theme', 'light', 'UI theme preference'),
  ('notifications_enabled', 'true', 'Enable email notifications'),
  ('items_per_page', '10', 'Number of items to display per page');
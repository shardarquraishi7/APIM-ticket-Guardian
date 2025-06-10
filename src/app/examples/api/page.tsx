import React from 'react';
import Link from 'next/link';

export default function ApiExamples() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-telus-purple mb-2">API Examples</h1>
        <p className="text-telus-grey max-w-3xl">
          Examples of API routes, Cloudflare D1 database integration, and external API calls.
          These examples demonstrate how to create and consume APIs in your Next.js application.
        </p>
        <div className="mt-4">
          <Link href="/examples" className="text-telus-purple hover:underline">
            ← Back to Examples
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* API Endpoints Section */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-bold text-telus-purple">Available API Endpoints</h2>
          </div>
          <div className="card-body">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-telus-purple mb-2">Users API</h3>
                <div className="bg-gray-100 p-3 rounded-md mb-2">
                  <div className="flex items-center">
                    <span className="bg-telus-green text-white text-xs px-2 py-1 rounded mr-2">GET</span>
                    <code className="text-telus-grey">/api/users</code>
                  </div>
                  <p className="text-sm text-telus-grey mt-1">Fetch all users or filter by role</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-md">
                  <div className="flex items-center">
                    <span className="bg-telus-purple text-white text-xs px-2 py-1 rounded mr-2">POST</span>
                    <code className="text-telus-grey">/api/users</code>
                  </div>
                  <p className="text-sm text-telus-grey mt-1">Create a new user</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-telus-purple mb-2">Projects API</h3>
                <div className="bg-gray-100 p-3 rounded-md mb-2">
                  <div className="flex items-center">
                    <span className="bg-telus-green text-white text-xs px-2 py-1 rounded mr-2">GET</span>
                    <code className="text-telus-grey">/api/projects</code>
                  </div>
                  <p className="text-sm text-telus-grey mt-1">Fetch all projects</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-md mb-2">
                  <div className="flex items-center">
                    <span className="bg-telus-green text-white text-xs px-2 py-1 rounded mr-2">GET</span>
                    <code className="text-telus-grey">/api/projects/[id]</code>
                  </div>
                  <p className="text-sm text-telus-grey mt-1">Fetch a specific project by ID</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-md">
                  <div className="flex items-center">
                    <span className="bg-telus-purple text-white text-xs px-2 py-1 rounded mr-2">POST</span>
                    <code className="text-telus-grey">/api/projects</code>
                  </div>
                  <p className="text-sm text-telus-grey mt-1">Create a new project</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-telus-purple mb-2">External API</h3>
                <div className="bg-gray-100 p-3 rounded-md">
                  <div className="flex items-center">
                    <span className="bg-telus-green text-white text-xs px-2 py-1 rounded mr-2">GET</span>
                    <code className="text-telus-grey">/api/external/weather</code>
                  </div>
                  <p className="text-sm text-telus-grey mt-1">Fetch weather data from external API</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Usage Example */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-bold text-telus-purple">Usage Example</h2>
          </div>
          <div className="card-body p-0">
            <div className="bg-gray-900 text-white p-4 rounded-md overflow-auto max-h-[500px]">
              <pre className="text-sm">
{`// Example of fetching users from the API
import { useState, useEffect } from 'react';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        
        // Build URL with query parameters
        const url = role 
          ? \`/api/users?role=\${role}\` 
          : '/api/users';
          
        // Fetch users from API
        const response = await fetch(url);
        
        // Check if response is OK
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        // Parse response JSON
        const data = await response.json();
        
        // Update state with users data
        setUsers(data.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, [role]);

  // Function to handle role filter change
  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  return (
    <div>
      <h2>Users List</h2>
      
      {/* Role filter */}
      <div>
        <label>
          Filter by role:
          <select value={role} onChange={handleRoleChange}>
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="manager">Manager</option>
          </select>
        </label>
      </div>
      
      {/* Loading state */}
      {loading && <p>Loading users...</p>}
      
      {/* Error state */}
      {error && <p className="error">Error: {error}</p>}
      
      {/* Users list */}
      {!loading && !error && (
        <ul>
          {users.map(user => (
            <li key={user.id}>
              <strong>{user.name}</strong> ({user.email})
              <span className="role">{user.role}</span>
            </li>
          ))}
        </ul>
      )}
      
      {/* Empty state */}
      {!loading && !error && users.length === 0 && (
        <p>No users found.</p>
      )}
    </div>
  );
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-telus-purple mb-6">Cloudflare D1 Database Integration</h2>
        
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-bold text-telus-purple">D1 Database Setup</h3>
          </div>
          <div className="card-body">
            <p className="mb-4">
              This starter kit includes examples of Cloudflare D1 database integration. D1 is Cloudflare's SQL database
              that runs at the edge, making it perfect for Cloudflare Workers applications.
            </p>
            
            <div className="bg-gray-100 p-4 rounded-md mb-4">
              <h4 className="font-bold text-telus-purple mb-2">1. Create a D1 Database</h4>
              <pre className="bg-gray-900 text-white p-3 rounded-md text-sm overflow-auto">
                wrangler d1 create starter-kit-db
              </pre>
              <p className="text-sm text-telus-grey mt-2">
                This will create a new D1 database and provide you with a database ID to update in your wrangler.toml file.
              </p>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-md mb-4">
              <h4 className="font-bold text-telus-purple mb-2">2. Create Database Schema</h4>
              <p className="text-sm text-telus-grey mb-2">
                Create a SQL file in the database directory:
              </p>
              <pre className="bg-gray-900 text-white p-3 rounded-md text-sm overflow-auto">
{`-- database/schema.sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
              </pre>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-md">
              <h4 className="font-bold text-telus-purple mb-2">3. Apply Schema to Database</h4>
              <pre className="bg-gray-900 text-white p-3 rounded-md text-sm overflow-auto">
                wrangler d1 execute starter-kit-db --file=./database/schema.sql
              </pre>
              <p className="text-sm text-telus-grey mt-2">
                This will execute the SQL file against your D1 database, creating the tables.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-telus-purple mb-4">Additional API Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/examples/api/crud" className="card hover:shadow-lg transition-shadow duration-300">
            <div className="card-body">
              <h3 className="text-lg font-bold text-telus-purple mb-2">CRUD Operations</h3>
              <p className="text-telus-grey">Complete CRUD example with D1 database integration.</p>
            </div>
          </Link>
          
          <Link href="/examples/api/external" className="card hover:shadow-lg transition-shadow duration-300">
            <div className="card-body">
              <h3 className="text-lg font-bold text-telus-purple mb-2">External API</h3>
              <p className="text-telus-grey">Example of integrating with third-party APIs.</p>
            </div>
          </Link>
          
          <Link href="/examples/api/auth" className="card hover:shadow-lg transition-shadow duration-300">
            <div className="card-body">
              <h3 className="text-lg font-bold text-telus-purple mb-2">Authentication API</h3>
              <p className="text-telus-grey">API routes for authentication and authorization.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
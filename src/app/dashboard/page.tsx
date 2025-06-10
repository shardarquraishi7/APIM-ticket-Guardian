import React from 'react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-telus-purple mb-2">Dashboard</h1>
        <p className="text-telus-grey">
          A sample dashboard layout for your Cloudflare Workers application.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Stat Card 1 */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-telus-grey text-sm font-medium mb-1">Total Users</h3>
            <p className="text-3xl font-bold text-telus-purple">1,248</p>
            <div className="mt-2 text-sm text-telus-green">
              <span className="font-medium">↑ 12%</span> from last month
            </div>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-telus-grey text-sm font-medium mb-1">Active Projects</h3>
            <p className="text-3xl font-bold text-telus-purple">64</p>
            <div className="mt-2 text-sm text-telus-green">
              <span className="font-medium">↑ 8%</span> from last month
            </div>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-telus-grey text-sm font-medium mb-1">API Requests</h3>
            <p className="text-3xl font-bold text-telus-purple">28.5k</p>
            <div className="mt-2 text-sm text-telus-error">
              <span className="font-medium">↓ 3%</span> from last month
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="card mb-8">
            <div className="card-header">
              <h2 className="text-xl font-bold text-telus-purple">Recent Activity</h2>
            </div>
            <div className="card-body p-0">
              <div className="divide-y">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">User #{item} updated their profile</p>
                        <p className="text-sm text-telus-grey">Changed email and profile picture</p>
                      </div>
                      <div className="text-sm text-telus-grey">
                        {item} hour{item !== 1 ? 's' : ''} ago
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-footer text-center">
              <Link href="/dashboard/activity" className="text-telus-purple hover:underline">
                View All Activity
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-bold text-telus-purple">Data Visualization</h2>
            </div>
            <div className="card-body">
              <div className="bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center">
                <p className="text-telus-grey">
                  Chart visualization would be displayed here.
                  <br />
                  <span className="text-sm">
                    (Implement with Chart.js or other visualization libraries)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card mb-8">
            <div className="card-header">
              <h2 className="text-xl font-bold text-telus-purple">Quick Actions</h2>
            </div>
            <div className="card-body p-0">
              <div className="divide-y">
                <Link href="/dashboard/users/new" className="block p-4 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-telus-purple rounded-full flex items-center justify-center text-white mr-3">
                      <span>+</span>
                    </div>
                    <div>
                      <p className="font-medium">Add New User</p>
                      <p className="text-sm text-telus-grey">Create user account</p>
                    </div>
                  </div>
                </Link>
                <Link href="/dashboard/projects/new" className="block p-4 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-telus-green rounded-full flex items-center justify-center text-white mr-3">
                      <span>+</span>
                    </div>
                    <div>
                      <p className="font-medium">Create Project</p>
                      <p className="text-sm text-telus-grey">Start a new project</p>
                    </div>
                  </div>
                </Link>
                <Link href="/dashboard/settings" className="block p-4 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-telus-grey rounded-full flex items-center justify-center text-white mr-3">
                      <span>⚙️</span>
                    </div>
                    <div>
                      <p className="font-medium">Settings</p>
                      <p className="text-sm text-telus-grey">Configure your account</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-bold text-telus-purple">Team Members</h2>
            </div>
            <div className="card-body p-0">
              <div className="divide-y">
                {[
                  { name: 'Alex Johnson', role: 'Administrator' },
                  { name: 'Sam Williams', role: 'Developer' },
                  { name: 'Taylor Smith', role: 'Designer' },
                  { name: 'Jordan Lee', role: 'Product Manager' },
                ].map((member, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-telus-light-grey rounded-full flex items-center justify-center text-telus-purple font-bold mr-3">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-telus-grey">{member.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-footer text-center">
              <Link href="/dashboard/team" className="text-telus-purple hover:underline">
                View All Team Members
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
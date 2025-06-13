import Link from 'next/link';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-lg font-bold text-indigo-600">
              DEP Guardian
            </Link>
            <span className="text-gray-400">|</span>
            <h1 className="text-lg font-medium">Admin</h1>
          </div>
          
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link 
                  href="/admin/knowledge-base" 
                  className="text-sm font-medium text-gray-700 hover:text-indigo-600"
                >
                  Knowledge Base
                </Link>
              </li>
              <li>
                <Link 
                  href="/" 
                  className="text-sm font-medium text-gray-700 hover:text-indigo-600"
                >
                  Back to App
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main>{children}</main>
      
      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-500">
            DEP Guardian Admin - {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

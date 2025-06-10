import Link from "next/link";

export default function ProjectStructurePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <nav className="mb-8">
        <Link href="/docs" className="text-telus-purple hover:underline">
          ← Back to Documentation
        </Link>
      </nav>
      
      <h1 className="text-3xl font-bold text-telus-purple mb-6">Project Structure and Components</h1>
      
      <div className="prose max-w-none">
        <p className="mb-6">
          This document provides an overview of the Next.js Cloudflare Workers Starter Kit&apos;s architecture, 
          file organization, and available components.
        </p>

        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Project Overview</h2>
        <p className="mb-4">The starter kit is built with:</p>
        <ul className="list-disc pl-6 mb-6">
          <li><strong>Next.js 15.3.3</strong> - React framework with App Router</li>
          <li><strong>TypeScript</strong> - Type-safe development</li>
          <li><strong>Tailwind CSS</strong> - Utility-first CSS framework</li>
          <li><strong>Cloudflare Workers</strong> - Edge computing platform</li>
          <li><strong>TELUS Design System</strong> - Corporate styling and branding</li>
        </ul>

        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Directory Structure</h2>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-6">
          <pre>
{`kevin-cfw-nextjs-starter-ui/
├── docs/                           # Documentation files
├── database/                       # Database schema and migrations
├── public/                         # Static assets
├── scripts/                        # Build and setup scripts
├── src/                            # Source code
│   ├── app/                        # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout with header/footer
│   │   ├── page.tsx                # Home page
│   │   ├── api/                    # API routes
│   │   ├── dashboard/              # Dashboard example
│   │   ├── docs/                   # Documentation pages
│   │   └── examples/               # Feature examples
│   ├── components/                 # Reusable React components
│   │   └── OAuthWrapper.tsx        # Authentication wrapper
│   └── lib/                        # Utility libraries
├── package.json                    # Dependencies and scripts
├── wrangler.toml                   # Cloudflare Workers configuration
└── next.config.ts                  # Next.js configuration`}
          </pre>
        </div>

        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Core Components</h2>
        
        <h3 className="text-xl font-bold text-telus-purple mt-6 mb-3">1. OAuthWrapper Component</h3>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
          <p className="mb-2"><strong>Location:</strong> <code>src/components/OAuthWrapper.tsx</code></p>
          <p className="mb-3">A drop-in authentication component that handles TELUS OAuth integration.</p>
          
          <h4 className="font-bold mb-2">Features:</h4>
          <ul className="list-disc pl-6 text-sm mb-3">
            <li>Automatic token validation</li>
            <li>Development mode bypass (localhost)</li>
            <li>Token storage and retrieval</li>
            <li>Error handling and user feedback</li>
            <li>Seamless redirect handling</li>
          </ul>
          
          <h4 className="font-bold mb-2">Usage:</h4>
          <div className="bg-gray-100 p-2 rounded font-mono text-sm mb-3">
            <pre>
{`import OAuthWrapper from '@/components/OAuthWrapper'

<OAuthWrapper>
  <YourAppContent />
</OAuthWrapper>`}
            </pre>
          </div>
          
          <h4 className="font-bold mb-2">Exported Functions:</h4>
          <ul className="list-disc pl-6 text-sm">
            <li><code>logout()</code> - Clears authentication and redirects to logout</li>
            <li><code>useUser()</code> - React hook to access current user data</li>
          </ul>
        </div>

        <h3 className="text-xl font-bold text-telus-purple mt-6 mb-3">2. Root Layout</h3>
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <p className="mb-2"><strong>Location:</strong> <code>src/app/layout.tsx</code></p>
          <p className="mb-3">Provides the main application structure with TELUS branding.</p>
          
          <h4 className="font-bold mb-2">Features:</h4>
          <ul className="list-disc pl-6 text-sm">
            <li>TELUS header with logo and navigation</li>
            <li>Responsive design with mobile menu</li>
            <li>Footer with resources and contact information</li>
            <li>OAuth wrapper integration</li>
            <li>Global font and styling setup</li>
          </ul>
        </div>

        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Styling System</h2>
        
        <h3 className="text-xl font-bold text-telus-purple mt-6 mb-3">TELUS Design System</h3>
        <p className="mb-4">The starter kit includes TELUS corporate colors and styling:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-telus-purple p-4 rounded" style={{ color: 'white' }}>
            <div className="font-bold" style={{ color: 'white' }}>telus-purple</div>
            <div className="text-sm" style={{ color: 'white' }}>#49286A</div>
            <div className="text-xs" style={{ color: 'white' }}>Primary brand color</div>
          </div>
          <div className="bg-telus-light-green p-4 rounded" style={{ color: 'black' }}>
            <div className="font-bold" style={{ color: 'black' }}>telus-light-green</div>
            <div className="text-sm" style={{ color: 'black' }}>#66CC00</div>
            <div className="text-xs" style={{ color: 'black' }}>Accent color</div>
          </div>
          <div className="bg-telus-dark-green p-4 rounded" style={{ color: 'white' }}>
            <div className="font-bold" style={{ color: 'white' }}>telus-dark-green</div>
            <div className="text-sm" style={{ color: 'white' }}>#2B8000</div>
            <div className="text-xs" style={{ color: 'white' }}>Accessible Green</div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">API Routes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border border-gray-200 p-4 rounded">
            <h4 className="font-bold text-telus-purple mb-2">Authentication API</h4>
            <p className="text-sm mb-2"><strong>Location:</strong> <code>src/app/validate-token/route.ts</code></p>
            <ul className="list-disc pl-6 text-sm">
              <li>Validates OAuth tokens server-side</li>
              <li>Integrates with TELUS authentication system</li>
            </ul>
          </div>
          
          <div className="border border-gray-200 p-4 rounded">
            <h4 className="font-bold text-telus-purple mb-2">User Management API</h4>
            <p className="text-sm mb-2"><strong>Location:</strong> <code>src/app/api/users/route.ts</code></p>
            <ul className="list-disc pl-6 text-sm">
              <li>Example CRUD operations</li>
              <li>Database integration examples</li>
              <li>RESTful API patterns</li>
            </ul>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Database Integration</h2>
        
        <h3 className="text-xl font-bold text-telus-purple mt-6 mb-3">Cloudflare D1</h3>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="mb-2">
            <strong>Schema:</strong> <code>database/schema.sql</code><br/>
            <strong>Connection:</strong> <code>src/lib/database/db.ts</code>
          </p>
          <p className="mb-3">The starter kit includes optional D1 database integration for:</p>
          <ul className="list-disc pl-6 text-sm">
            <li>User data storage</li>
            <li>Application state management</li>
            <li>Relational data operations</li>
          </ul>
        </div>

        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Build and Deployment</h2>
        
        <h3 className="text-xl font-bold text-telus-purple mt-6 mb-3">Key NPM Scripts</h3>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-6">
          <pre>
{`"dev": "next dev"                     # Development server
"build": "next build"                 # Production build
"deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"
"setup": "node scripts/setup.js"      # Environment setup
"db:create": "wrangler d1 create starter-kit-db"
"kv:create": "wrangler kv namespace create \\"CACHE\\""`}
          </pre>
        </div>

        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Development Patterns</h2>
        
        <h3 className="text-xl font-bold text-telus-purple mt-6 mb-3">File-based Routing</h3>
        <p className="mb-4">Following Next.js App Router conventions:</p>
        <ul className="list-disc pl-6 mb-6">
          <li><code>page.tsx</code> - Route components</li>
          <li><code>layout.tsx</code> - Shared layouts</li>
          <li><code>route.ts</code> - API endpoints</li>
          <li><code>loading.tsx</code> - Loading states</li>
          <li><code>error.tsx</code> - Error boundaries</li>
        </ul>

        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Best Practices</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-bold text-telus-purple mb-3">Code Organization</h4>
            <ul className="list-disc pl-6 text-sm">
              <li>Use TypeScript for type safety</li>
              <li>Follow React hooks patterns</li>
              <li>Implement proper error boundaries</li>
              <li>Include comprehensive JSDoc comments</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-telus-purple mb-3">Performance</h4>
            <ul className="list-disc pl-6 text-sm">
              <li>Minimize bundle size with tree shaking</li>
              <li>Use dynamic imports for code splitting</li>
              <li>Optimize images and static assets</li>
              <li>Implement proper caching strategies</li>
            </ul>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Next Steps</h2>
        <ul className="list-disc pl-6 mb-6">
          <li>Check out the <Link href="/docs/getting-started" className="text-telus-purple hover:underline">Getting Started Guide</Link> to set up your development environment</li>
          <li>Read the <Link href="/docs/customization" className="text-telus-purple hover:underline">Customization Guide</Link> to learn how to customize the starter kit</li>
          <li>Explore the <Link href="/examples" className="text-telus-purple hover:underline">Examples</Link> to see various features in action</li>
        </ul>

        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Resources</h2>
        <ul className="list-disc pl-6 mb-6">
          <li><a href="https://nextjs.org/docs" className="text-telus-purple hover:underline" target="_blank" rel="noopener noreferrer">Next.js Documentation</a></li>
          <li><a href="https://developers.cloudflare.com/workers/" className="text-telus-purple hover:underline" target="_blank" rel="noopener noreferrer">Cloudflare Workers Documentation</a></li>
          <li><a href="https://www.typescriptlang.org/docs/" className="text-telus-purple hover:underline" target="_blank" rel="noopener noreferrer">TypeScript Handbook</a></li>
          <li><a href="https://tailwindcss.com/docs" className="text-telus-purple hover:underline" target="_blank" rel="noopener noreferrer">Tailwind CSS Documentation</a></li>
        </ul>
      </div>
    </div>
  );
}
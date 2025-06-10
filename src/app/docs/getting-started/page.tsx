import Link from "next/link";

export default function GettingStartedPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <nav className="mb-8">
        <Link href="/docs" className="text-telus-purple hover:underline">
          ← Back to Documentation
        </Link>
      </nav>
      
      <h1 className="text-3xl font-bold text-telus-purple mb-6">Getting Started</h1>
      
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Prerequisites</h2>
        <ul className="list-disc pl-6 mb-6">
          <li>Node.js 18.0 or later</li>
          <li>npm or yarn package manager</li>
          <li>A Cloudflare account (for deployment)</li>
        </ul>
        
        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Installation</h2>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-6">
          <pre>
{`# Clone the repository
git clone https://github.com/your-org/kevin-cfw-nextjs-starter-ui.git

# Navigate to the project directory
cd kevin-cfw-nextjs-starter-ui

# Install dependencies
npm install`}
          </pre>
        </div>
        
        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Development</h2>
        <p className="mb-4">
          To start the development server, run:
        </p>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-6">
          <pre>
{`npm run dev`}
          </pre>
        </div>
        <p className="mb-4">
          This will start the Next.js development server at <code>http://localhost:3000</code>.
        </p>
        
        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Deployment</h2>
        <p className="mb-4">
          To deploy to Cloudflare Workers, run:
        </p>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-6">
          <pre>
{`npm run deploy`}
          </pre>
        </div>
        <p className="mb-4">
          This will build your Next.js application and deploy it to Cloudflare Workers.
        </p>
        
        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Project Structure</h2>
        <p className="mb-4">
          The project follows the standard Next.js App Router structure:
        </p>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-6">
          <pre>
{`kevin-cfw-nextjs-starter-ui/
├── public/            # Static assets
├── src/
│   ├── app/           # App Router pages
│   │   ├── api/       # API routes
│   │   └── ...        # Other pages
│   └── lib/           # Shared utilities
├── database/          # Database schema
└── scripts/           # Utility scripts`}
          </pre>
        </div>
        
        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Next Steps</h2>
        <p className="mb-4">
          Check out the <Link href="/docs/customization" className="text-telus-purple hover:underline">Customization</Link> guide 
          to learn how to tailor the starter kit to your needs.
        </p>
      </div>
    </div>
  );
}
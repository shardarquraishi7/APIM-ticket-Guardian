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
        <p className="mb-6">
          This guide will help you get up and running with the Next.js Cloudflare Workers Starter Kit quickly. 
          Follow these steps to set up your development environment, run the application locally, and deploy it to Cloudflare Workers.
        </p>

        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Prerequisites</h2>
        <p className="mb-4">Before you begin, make sure you have the following installed:</p>
        <ul className="list-disc pl-6 mb-6">
          <li><a href="https://nodejs.org/" className="text-telus-purple hover:underline">Node.js</a> (v18 or later)</li>
          <li><a href="https://www.npmjs.com/" className="text-telus-purple hover:underline">npm</a> (v8 or later)</li>
          <li><a href="https://git-scm.com/" className="text-telus-purple hover:underline">Git</a></li>
          <li><a href="https://developers.cloudflare.com/workers/wrangler/install-and-update/" className="text-telus-purple hover:underline">Wrangler CLI</a> (for Cloudflare Workers deployment)</li>
        </ul>

        <h3 className="text-xl font-bold text-telus-purple mt-6 mb-3">Cloudflare Account Setup</h3>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="mb-4">
            <strong>Important:</strong> Each team member can create their own{' '}
            <a href="https://dash.cloudflare.com/sign-up" className="text-telus-purple hover:underline">
              Cloudflare account
            </a>{' '}
            for development and testing.
          </p>
          
          <h4 className="font-bold text-telus-purple mb-2">Benefits of a Free Cloudflare Account:</h4>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li><strong>100,000 free requests per day</strong> on the Workers free tier</li>
            <li><strong>10 GB of free storage</strong> with Cloudflare R2</li>
            <li><strong>1 GB of free database storage</strong> with Cloudflare D1</li>
            <li><strong>Unlimited KV operations</strong> for caching and session data (up to 1,000 keys)</li>
            <li><strong>Global edge deployment</strong> across 300+ data centers worldwide</li>
            <li><strong>Built-in analytics and monitoring</strong> for your applications</li>
            <li><strong>No credit card required</strong> for the free tier</li>
          </ul>
          
          <p className="mt-3 text-sm mb-4">
            The free tier is more than sufficient for prototyping, development, and small-scale applications.
            This allows each developer to have their own isolated environment for testing without affecting shared resources.
          </p>
          
          <div className="mt-4">
            <a
              href="https://dash.cloudflare.com/sign-up"
              className="inline-block bg-telus-purple text-white px-6 py-2 rounded hover:bg-opacity-90 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Create Free Cloudflare Account →
            </a>
          </div>
        </div>

        <h3 className="text-xl font-bold text-telus-purple mt-6 mb-3">Windows Users</h3>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="mb-2">
            <strong>Important:</strong> If you&apos;re using Windows, we strongly recommend using{' '}
            <a href="https://docs.microsoft.com/en-us/windows/wsl/install" className="text-telus-purple hover:underline">
              Windows Subsystem for Linux (WSL)
            </a>{' '}
            for the best development experience. This ensures compatibility with Node.js tooling and Cloudflare Workers development workflows.
          </p>
          <p className="mb-2">To install WSL:</p>
          <div className="bg-gray-100 p-2 rounded font-mono text-sm">
            <code>wsl --install</code>
          </div>
          <p className="mt-2 text-sm">
            Then install Node.js within your WSL environment rather than on Windows directly.
          </p>
        </div>
        
        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Step 1: Clone the Repository</h2>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-6">
          <pre>
{`git clone https://github.com/your-org/kevin-cfw-nextjs-starter-ui.git
cd kevin-cfw-nextjs-starter-ui`}
          </pre>
        </div>

        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Step 2: Install Dependencies</h2>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-6">
          <pre>
{`npm install`}
          </pre>
        </div>

        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Step 3: Run the Setup Script</h2>
        <p className="mb-4">The starter kit includes a setup script that helps you configure your environment:</p>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-6">
          <pre>
{`npm run setup`}
          </pre>
        </div>
        <p className="mb-4">This script will:</p>
        <ul className="list-disc pl-6 mb-6">
          <li>Check your Node.js and npm versions</li>
          <li>Install Wrangler CLI if not already installed</li>
          <li>Create <code>.env</code> and <code>.env.local</code> files if they don&apos;t exist</li>
          <li>Help you set up Cloudflare D1 database (optional)</li>
          <li>Help you set up Cloudflare KV namespace (required for deployment)</li>
        </ul>

        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Step 4: Start the Development Server</h2>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-6">
          <pre>
{`npm run dev`}
          </pre>
        </div>
        <p className="mb-6">
          This will start the Next.js development server at <a href="http://localhost:3000" className="text-telus-purple hover:underline">http://localhost:3000</a>.
        </p>

        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Step 5: Explore the Starter Kit</h2>
        <p className="mb-4">The starter kit includes several examples and features to help you get started:</p>
        <ul className="list-disc pl-6 mb-6">
          <li><strong>Home Page</strong>: Overview of the starter kit features</li>
          <li><strong>Dashboard</strong>: Example dashboard layout with data visualization</li>
          <li><strong>Examples</strong>: Various examples including forms, API integration, etc.</li>
          <li><strong>API Routes</strong>: Example API routes in <code>src/app/api</code></li>
        </ul>

        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Step 6: Set Up Cloudflare D1 Database (Optional)</h2>
        <p className="mb-4">If you want to use Cloudflare D1 for database storage, follow these steps:</p>
        
        <p className="mb-2"><strong>1. Uncomment the D1 configuration in <code>wrangler.toml</code>:</strong></p>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-4">
          <pre>
{`# Remove the # comments from these lines:
[[d1_databases]]
binding = "DB"
database_name = "starter_kit_db"
database_id = "placeholder"`}
          </pre>
        </div>

        <p className="mb-2"><strong>2. Create a D1 database:</strong></p>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-4">
          <pre>
{`npm run db:create`}
          </pre>
        </div>

        <p className="mb-2"><strong>3. Update the <code>wrangler.toml</code> file with your database ID (from the output of the previous command):</strong></p>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-4">
          <pre>
{`[[d1_databases]]
binding = "DB"
database_name = "starter-kit-db"
database_id = "your-database-id-here" # Replace with your database ID`}
          </pre>
        </div>

        <p className="mb-2"><strong>4. Apply the schema to your database:</strong></p>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-6">
          <pre>
{`npm run db:migrate`}
          </pre>
        </div>

        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Step 7: Set Up Cloudflare KV Namespace (Required for Deployment)</h2>
        <p className="mb-4">The starter kit uses Cloudflare KV for caching and session data. You&apos;ll need to set up a KV namespace for deployment to work properly:</p>
        
        <p className="mb-2"><strong>1. Create a KV namespace:</strong></p>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-4">
          <pre>
{`npm run kv:create`}
          </pre>
        </div>

        <p className="mb-2"><strong>2. Update the <code>wrangler.toml</code> file with your KV namespace ID (from the output of the previous command):</strong></p>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-4">
          <pre>
{`[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id-here" # Replace with your KV namespace ID`}
          </pre>
        </div>

        <p className="mb-6"><strong>3. (Optional) For testing with Wrangler&apos;s preview mode, you can also create a preview namespace:</strong></p>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-4">
          <pre>
{`npm run kv:create-preview`}
          </pre>
        </div>

        <p className="mb-2">Then add the preview ID to your <code>wrangler.toml</code>:</p>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-6">
          <pre>
{`[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id-here"
preview_id = "your-preview-kv-namespace-id-here"`}
          </pre>
        </div>

        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Step 8: Set Up Cloudflare R2 Storage (Optional)</h2>
        <p className="mb-4">If you want to use Cloudflare R2 for file storage, follow these steps:</p>
        
        <p className="mb-2"><strong>1. Uncomment the R2 configuration in <code>wrangler.toml</code>:</strong></p>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-4">
          <pre>
{`# Remove the # comments from these lines:
[[r2_buckets]]
binding = "FILES"
bucket_name = "starter-kit-files"`}
          </pre>
        </div>

        <p className="mb-2"><strong>2. Create an R2 bucket:</strong></p>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-4">
          <pre>
{`npm run r2:create`}
          </pre>
        </div>

        <p className="mb-6"><strong>3. Update the bucket name in <code>wrangler.toml</code> if you used a different name.</strong></p>

        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Step 9: Deploy Your Prototype to Cloudflare Workers</h2>
        <p className="mb-4">When you&apos;re ready to deploy your prototype to Cloudflare Workers for testing and experimentation:</p>
        
        <p className="mb-2"><strong>1. Build the application:</strong></p>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-4">
          <pre>
{`npm run build`}
          </pre>
        </div>

        <p className="mb-2"><strong>2. Deploy to Cloudflare Workers:</strong></p>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-4">
          <pre>
{`npm run deploy`}
          </pre>
        </div>
        <p className="mb-6">This will deploy your prototype to Cloudflare Workers. The URL will be displayed in the terminal.</p>

        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Troubleshooting</h2>
        
        <h3 className="text-xl font-bold text-telus-purple mt-6 mb-3">Development Server Issues</h3>
        <p className="mb-4">If you encounter issues with the development server:</p>
        <ol className="list-decimal pl-6 mb-6">
          <li>Make sure you have the correct Node.js and npm versions</li>
          <li>Try clearing the Next.js cache: <code>rm -rf .next</code></li>
          <li>Reinstall dependencies: <code>rm -rf node_modules && npm install</code></li>
        </ol>

        <h3 className="text-xl font-bold text-telus-purple mt-6 mb-3">Deployment Issues</h3>
        <p className="mb-4">If you encounter issues deploying to Cloudflare Workers:</p>
        <ol className="list-decimal pl-6 mb-6">
          <li>Make sure you&apos;re logged in to Cloudflare: <code>wrangler login</code></li>
          <li>Check your <code>wrangler.toml</code> configuration</li>
          <li>Make sure your application builds successfully: <code>npm run build</code></li>
        </ol>

        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Next Steps</h2>
        <ul className="list-disc pl-6 mb-6">
          <li>Check out the <Link href="/docs/customization" className="text-telus-purple hover:underline">Customization Guide</Link> to learn how to customize the starter kit</li>
          <li>Explore the <Link href="/examples" className="text-telus-purple hover:underline">Examples</Link> to see various features in action</li>
          <li>Read about the <Link href="/docs/project-structure" className="text-telus-purple hover:underline">Project Structure and Components</Link> to understand the codebase architecture</li>
        </ul>

        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Resources</h2>
        <ul className="list-disc pl-6 mb-6">
          <li><a href="https://nextjs.org/docs" className="text-telus-purple hover:underline">Next.js Documentation</a></li>
          <li><a href="https://developers.cloudflare.com/workers/" className="text-telus-purple hover:underline">Cloudflare Workers Documentation</a></li>
          <li><a href="https://developers.cloudflare.com/d1/" className="text-telus-purple hover:underline">Cloudflare D1 Documentation</a></li>
          <li><a href="https://developers.cloudflare.com/kv/" className="text-telus-purple hover:underline">Cloudflare KV Documentation</a></li>
          <li><a href="https://developers.cloudflare.com/r2/" className="text-telus-purple hover:underline">Cloudflare R2 Documentation</a></li>
        </ul>
      </div>
    </div>
  );
}
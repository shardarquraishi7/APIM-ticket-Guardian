import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-telus-purple mb-6">Documentation</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-bold text-telus-purple">Getting Started</h2>
          </div>
          <div className="card-body">
            <p className="mb-4">Learn how to set up and start using the Next.js Cloudflare Workers Starter Kit.</p>
            <Link href="/docs/getting-started" className="text-telus-purple hover:underline">
              Read Getting Started Guide →
            </Link>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-bold text-telus-purple">Project Structure</h2>
          </div>
          <div className="card-body">
            <p className="mb-4">Understand the codebase architecture, components, and development patterns.</p>
            <Link href="/docs/project-structure" className="text-telus-purple hover:underline">
              Read Project Structure Guide →
            </Link>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-bold text-telus-purple">Customization</h2>
          </div>
          <div className="card-body">
            <p className="mb-4">Learn how to customize the starter kit to fit your project needs.</p>
            <Link href="/docs/customization" className="text-telus-purple hover:underline">
              Read Customization Guide →
            </Link>
          </div>
        </div>
      </div>
      
      <div className="bg-telus-light-grey p-6 rounded-lg">
        <h3 className="text-lg font-bold text-telus-purple mb-3">Need more help?</h3>
        <p>
          This is an experimental starter kit. For more comprehensive documentation, please refer to the 
          official Next.js and Cloudflare Workers documentation.
        </p>
      </div>
    </div>
  );
}
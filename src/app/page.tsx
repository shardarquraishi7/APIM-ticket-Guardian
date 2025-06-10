import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-telus-purple text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Next.js Cloudflare Workers Starter Kit
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              A comprehensive toolkit for rapid prototyping and experimentation with TELUS styling
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/examples"
                className="btn btn-secondary px-8 py-3 text-lg inline-flex items-center justify-center hover:bg-telus-light-green hover:shadow-md transition-all"
              >
                View Examples
              </Link>
              <Link
                href="/docs"
                className="btn btn-outline border-white text-white hover:bg-white hover:text-telus-purple px-8 py-3 text-lg inline-flex items-center justify-center transition-all"
              >
                Documentation
              </Link>
            </div>
            <div className="mt-12 flex items-center justify-center">
              <div className="inline-flex items-center bg-telus-purple bg-opacity-80 px-4 py-2 border-l-4 border-telus-red">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-lg font-medium !text-yellow-300 text-yellow-300" style={{ color: 'yellow !important' }}>Note: This toolkit is intended for experimentation and prototyping only</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-telus-purple text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-xl font-bold text-telus-purple">Next.js 14 + TypeScript</h3>
              </div>
              <div className="card-body">
                <p className="mb-4">
                  Built with the latest Next.js App Router and TypeScript for type-safe development.
                </p>
                <ul className="list-disc list-inside text-sm text-telus-grey">
                  <li>React Server Components</li>
                  <li>TypeScript configuration</li>
                  <li>ESLint and Prettier setup</li>
                  <li>Tailwind CSS integration</li>
                </ul>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-xl font-bold text-telus-purple">Cloudflare Workers</h3>
              </div>
              <div className="card-body">
                <p className="mb-4">
                  Optimized for deployment to Cloudflare Workers with integrated database and storage.
                </p>
                <ul className="list-disc list-inside text-sm text-telus-grey">
                  <li>Cloudflare D1 database</li>
                  <li>Cloudflare R2 storage</li>
                  <li>KV namespace for caching</li>
                  <li>Environment configuration</li>
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-xl font-bold text-telus-purple">TELUS Styling</h3>
              </div>
              <div className="card-body">
                <p className="mb-4">
                  Custom components and styling based on TELUS design system.
                </p>
                <ul className="list-disc list-inside text-sm text-telus-grey">
                  <li>TELUS color palette</li>
                  <li>Responsive components</li>
                  <li>Form validation</li>
                  <li>Accessibility features</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="py-16 bg-telus-light-grey">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-telus-purple text-center mb-8">Getting Started</h2>
          
          <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-telus-purple mb-3">Quick Setup</h3>
              <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
                <pre>
{`# Clone the repository
git clone https://github.com/your-org/kevin-cfw-nextjs-starter-ui.git

# Install dependencies
npm install

# Setup environment
npm run setup

# Start development server
npm run dev`}
                </pre>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-telus-purple mb-3">Deployment</h3>
              <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
                <pre>
{`# Build and deploy to Cloudflare Workers
npm run deploy`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Example Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-telus-purple text-center mb-12">Example Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-telus-purple text-white rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-telus-purple mb-2">Form Handling</h3>
              <p className="text-telus-grey mb-4">Complete form examples with validation and error handling.</p>
              <Link href="/examples/forms" className="text-telus-purple hover:underline">
                View Forms →
              </Link>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-telus-purple text-white rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17V7h10v10H7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-telus-purple mb-2">API Integration</h3>
              <p className="text-telus-grey mb-4">Examples of API integration with Cloudflare D1 and external services.</p>
              <Link href="/examples/api" className="text-telus-purple hover:underline">
                View API Examples →
              </Link>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-telus-purple text-white rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-telus-purple mb-2">Dashboard Layout</h3>
              <p className="text-telus-grey mb-4">Responsive dashboard layout with navigation and data visualization.</p>
              <Link href="/dashboard" className="text-telus-purple hover:underline">
                View Dashboard →
              </Link>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-telus-purple text-white rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-telus-purple mb-2">File Upload</h3>
              <p className="text-telus-grey mb-4">File upload examples with Cloudflare R2 storage integration.</p>
              <Link href="/examples/upload" className="text-telus-purple hover:underline">
                View Upload Examples →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-telus-purple text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to start prototyping?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            This starter kit provides everything you need to quickly build and test your ideas.
          </p>
          <Link 
            href="/docs/getting-started" 
            className="btn bg-white text-telus-purple hover:bg-opacity-90 px-8 py-3 text-lg inline-block"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";

export default function CustomizationPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <nav className="mb-8">
        <Link href="/docs" className="text-telus-purple hover:underline">
          ← Back to Documentation
        </Link>
      </nav>
      
      <h1 className="text-3xl font-bold text-telus-purple mb-6">Customization</h1>
      
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Styling</h2>
        <p className="mb-4">
          This starter kit uses Tailwind CSS for styling. The TELUS color palette and common components are 
          already configured in the project.
        </p>
        
        <h3 className="text-xl font-bold text-telus-purple mt-6 mb-3">Tailwind Configuration</h3>
        <p className="mb-4">
          You can customize the Tailwind configuration in <code>tailwind.config.js</code>. The TELUS color palette 
          is defined in the <code>theme.extend.colors</code> section.
        </p>
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-6">
          <pre>
{`// tailwind.config.js
module.exports = {
  // ...
  theme: {
    extend: {
      colors: {
        'telus-purple': '#4B286D',
        'telus-green': '#2A8A3E',
        // ...other colors
      },
      // ...other theme extensions
    },
  },
  // ...
}`}
          </pre>
        </div>
        
        <h3 className="text-xl font-bold text-telus-purple mt-6 mb-3">Global Styles</h3>
        <p className="mb-4">
          Global styles are defined in <code>src/app/globals.css</code>. This file includes base styles,
          component styles, and utility classes using Tailwind&apos;s layer system.
        </p>
        
        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Components</h2>
        <p className="mb-4">
          The starter kit includes several pre-styled components based on the TELUS design system:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>Buttons (<code>.btn</code>, <code>.btn-primary</code>, <code>.btn-secondary</code>, <code>.btn-outline</code>)</li>
          <li>Cards (<code>.card</code>, <code>.card-header</code>, <code>.card-body</code>, <code>.card-footer</code>)</li>
          <li>Form elements (<code>.form-control</code>, <code>.form-label</code>, <code>.form-input</code>, <code>.form-error</code>)</li>
          <li>Layout components (<code>.container</code>, <code>.header</code>, <code>.footer</code>, <code>.sidebar</code>)</li>
        </ul>
        
        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Database Configuration</h2>
        <p className="mb-4">
          The starter kit is configured to use Cloudflare D1 as the database. The database schema is defined in 
          <code>database/schema.sql</code>.
        </p>
        <p className="mb-4">
          To modify the database schema:
        </p>
        <ol className="list-decimal pl-6 mb-6">
          <li>Edit <code>database/schema.sql</code> to add or modify tables</li>
          <li>Run <code>npm run db:migrate</code> to apply the changes</li>
        </ol>
        
        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Environment Variables</h2>
        <p className="mb-4">
          Environment variables are managed through the <code>wrangler.toml</code> file for Cloudflare Workers. 
          For local development, you can create a <code>.dev.vars</code> file with your environment variables.
        </p>
        
        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">Adding New Pages</h2>
        <p className="mb-4">
          To add a new page to your application:
        </p>
        <ol className="list-decimal pl-6 mb-6">
          <li>Create a new directory in <code>src/app</code> with the route name</li>
          <li>Add a <code>page.tsx</code> file in that directory</li>
          <li>Implement your React component in the <code>page.tsx</code> file</li>
        </ol>
        <p className="mb-4">
          For example, to create a page at <code>/about</code>, create <code>src/app/about/page.tsx</code>.
        </p>
        
        <h2 className="text-2xl font-bold text-telus-purple mt-8 mb-4">API Routes</h2>
        <p className="mb-4">
          API routes are defined in the <code>src/app/api</code> directory. Each API route is defined in a 
          <code>route.ts</code> file within a directory that matches the route path.
        </p>
        <p className="mb-4">
          For example, to create an API route at <code>/api/users</code>, create <code>src/app/api/users/route.ts</code>.
        </p>
      </div>
    </div>
  );
}
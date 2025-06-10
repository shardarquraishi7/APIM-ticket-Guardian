"use client";

import Link from "next/link";

export default function ComponentsExamplePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <nav className="mb-8">
        <Link href="/examples" className="text-telus-purple hover:underline">
          ← Back to Examples
        </Link>
      </nav>
      
      <h1 className="text-3xl font-bold text-telus-purple mb-6">UI Components</h1>
      <p className="mb-8">
        This page showcases the various UI components available in the TELUS design system.
      </p>
      
      {/* Buttons Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-telus-purple mb-4">Buttons</h2>
        <div className="card">
          <div className="card-body">
            <div className="flex flex-wrap gap-4">
              <button className="btn btn-primary">Primary Button</button>
              <button className="btn btn-secondary">Secondary Button</button>
              <button className="btn btn-outline">Outline Button</button>
              <button className="btn bg-white text-telus-purple">White Button</button>
              <button className="btn" disabled>Disabled Button</button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Cards Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-telus-purple mb-4">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-xl font-bold text-telus-purple">Basic Card</h3>
            </div>
            <div className="card-body">
              <p>This is a basic card with a header and body.</p>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3 className="text-xl font-bold text-telus-purple">Card with Footer</h3>
            </div>
            <div className="card-body">
              <p>This card includes a footer section.</p>
            </div>
            <div className="card-footer">
              <button className="btn btn-primary">Action</button>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3 className="text-xl font-bold text-telus-purple">Interactive Card</h3>
            </div>
            <div className="card-body">
              <p>This card has an interactive element.</p>
              <button 
                className="btn btn-outline mt-4"
                onClick={() => alert('Card action clicked!')}
              >
                Click Me
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Form Elements Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-telus-purple mb-4">Form Elements</h2>
        <div className="card">
          <div className="card-body">
            <form>
              <div className="form-control">
                <label className="form-label" htmlFor="name">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  className="form-input" 
                  placeholder="Enter your name"
                />
              </div>
              
              <div className="form-control">
                <label className="form-label" htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className="form-input" 
                  placeholder="Enter your email"
                />
                <div className="form-error">Please enter a valid email address.</div>
              </div>
              
              <div className="form-control">
                <label className="form-label" htmlFor="message">Message</label>
                <textarea 
                  id="message" 
                  className="form-input" 
                  rows={4} 
                  placeholder="Enter your message"
                ></textarea>
              </div>
              
              <div className="form-control">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-5 w-5 rounded" />
                  <span>Subscribe to newsletter</span>
                </label>
              </div>
              
              <div className="mt-6">
                <button type="button" className="btn btn-primary">Submit</button>
              </div>
            </form>
          </div>
        </div>
      </section>
      
      {/* Alerts Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-telus-purple mb-4">Alerts</h2>
        <div className="space-y-4">
          <div className="bg-telus-success bg-opacity-10 text-telus-success px-4 py-3 rounded-md border border-telus-success">
            <strong>Success!</strong> Your action was completed successfully.
          </div>
          
          <div className="bg-telus-info bg-opacity-10 text-telus-info px-4 py-3 rounded-md border border-telus-info">
            <strong>Info:</strong> Here is some important information.
          </div>
          
          <div className="bg-telus-warning bg-opacity-10 text-telus-warning px-4 py-3 rounded-md border border-telus-warning">
            <strong>Warning!</strong> Please be careful with this action.
          </div>
          
          <div className="bg-telus-error bg-opacity-10 text-telus-error px-4 py-3 rounded-md border border-telus-error">
            <strong>Error!</strong> Something went wrong.
          </div>
        </div>
      </section>
      
      {/* Usage Guide */}
      <div className="bg-telus-light-grey p-6 rounded-lg">
        <h3 className="text-lg font-bold text-telus-purple mb-3">Usage Guide</h3>
        <p className="mb-4">
          These components are designed to be used with the TELUS design system. They are implemented using 
          Tailwind CSS classes and can be easily customized to fit your project needs.
        </p>
        <p>
          For more information on how to use these components, refer to the 
          <Link href="/docs/customization" className="text-telus-purple hover:underline ml-1">
            Customization Guide
          </Link>.
        </p>
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";

export default function UploadExamplePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <nav className="mb-8">
        <Link href="/examples" className="text-telus-purple hover:underline">
          ← Back to Examples
        </Link>
      </nav>
      
      <h1 className="text-3xl font-bold text-telus-purple mb-6">File Upload Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-bold text-telus-purple">Basic File Upload</h2>
          </div>
          <div className="card-body">
            <p className="mb-4">
              This example demonstrates a basic file upload using Cloudflare R2 storage.
            </p>
            
            <form className="mb-6">
              <div className="form-control">
                <label className="form-label" htmlFor="file">Select a file</label>
                <input 
                  type="file" 
                  id="file" 
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
              <button 
                type="button" 
                className="btn btn-primary mt-4"
                onClick={() => alert('This is a demo. File upload is not implemented in this example.')}
              >
                Upload File
              </button>
            </form>
            
            <div className="bg-telus-light-grey p-4 rounded-md">
              <p className="text-sm">
                Note: This is a demonstration. In a real implementation, the file would be uploaded to 
                Cloudflare R2 storage using the Cloudflare Workers API.
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-bold text-telus-purple">Multi-file Upload</h2>
          </div>
          <div className="card-body">
            <p className="mb-4">
              This example demonstrates a multi-file upload with progress tracking.
            </p>
            
            <form className="mb-6">
              <div className="form-control">
                <label className="form-label" htmlFor="files">Select multiple files</label>
                <input 
                  type="file" 
                  id="files" 
                  multiple
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
              <button 
                type="button" 
                className="btn btn-primary mt-4"
                onClick={() => alert('This is a demo. Multi-file upload is not implemented in this example.')}
              >
                Upload Files
              </button>
            </form>
            
            <div className="bg-telus-light-grey p-4 rounded-md">
              <p className="text-sm">
                Note: This is a demonstration. In a real implementation, multiple files would be uploaded 
                with progress tracking using the Cloudflare Workers API.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-telus-light-grey p-6 rounded-lg">
        <h3 className="text-lg font-bold text-telus-purple mb-3">Implementation Details</h3>
        <p className="mb-4">
          In a real implementation, file uploads would be handled as follows:
        </p>
        <ul className="list-disc pl-6">
          <li className="mb-2">Files are uploaded to a temporary location</li>
          <li className="mb-2">The server validates the file type and size</li>
          <li className="mb-2">The file is then stored in Cloudflare R2 storage</li>
          <li className="mb-2">A reference to the file is stored in the database</li>
          <li className="mb-2">The file can be accessed via a generated URL</li>
        </ul>
      </div>
    </div>
  );
}
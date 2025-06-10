import React from 'react';
import Link from 'next/link';

export default function Examples() {
  const examples = [
    {
      title: 'Form Handling',
      description: 'Examples of form validation, submission, and error handling using React Hook Form and Zod.',
      path: '/examples/forms',
      icon: '📝',
      tags: ['React Hook Form', 'Zod', 'Validation']
    },
    {
      title: 'API Integration',
      description: 'Examples of API routes, Cloudflare D1 database integration, and external API calls.',
      path: '/examples/api',
      icon: '🔌',
      tags: ['Cloudflare D1', 'REST API', 'Fetch']
    },
    {
      title: 'File Upload',
      description: 'Examples of file uploads with Cloudflare R2 storage integration.',
      path: '/examples/upload',
      icon: '📤',
      tags: ['Cloudflare R2', 'File Storage', 'Upload']
    },
    {
      title: 'Data Visualization',
      description: 'Examples of charts and data visualization using Chart.js.',
      path: '/examples/charts',
      icon: '📊',
      tags: ['Chart.js', 'Graphs', 'Dashboard']
    },
    {
      title: 'Authentication',
      description: 'Example authentication flow with protected routes (ready for OAuth integration).',
      path: '/examples/auth',
      icon: '🔒',
      tags: ['Auth', 'Protected Routes', 'OAuth Ready']
    },
    {
      title: 'UI Components',
      description: 'TELUS-styled UI components for building consistent interfaces.',
      path: '/examples/components',
      icon: '🧩',
      tags: ['TELUS Styling', 'Components', 'UI Kit']
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-telus-purple mb-2">Examples</h1>
        <p className="text-telus-grey max-w-3xl">
          Explore these examples to learn how to use the various features of the Next.js Cloudflare Workers Starter Kit.
          Each example includes code snippets and explanations to help you get started quickly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {examples.map((example, index) => (
          <Link key={index} href={example.path} className="card hover:shadow-lg transition-shadow duration-300">
            <div className="card-body">
              <div className="flex items-start mb-4">
                <div className="text-4xl mr-4">{example.icon}</div>
                <div>
                  <h2 className="text-xl font-bold text-telus-purple">{example.title}</h2>
                  <p className="text-telus-grey mt-1">{example.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {example.tags.map((tag, tagIndex) => (
                  <span 
                    key={tagIndex} 
                    className="bg-telus-light-grey text-telus-purple text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 bg-telus-light-grey p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-telus-purple mb-4">Need Something Custom?</h2>
        <p className="text-telus-grey mb-4">
          These examples cover common use cases, but you might need something specific for your project.
          The starter kit is designed to be easily extensible and customizable.
        </p>
        <Link 
          href="/docs/customization" 
          className="btn btn-primary inline-block"
        >
          Customization Guide
        </Link>
      </div>
    </div>
  );
}
# Getting Started with the Next.js Cloudflare Workers Starter Kit

This guide will help you get up and running with the Next.js Cloudflare Workers Starter Kit quickly. Follow these steps to set up your development environment, run the application locally, and deploy it to Cloudflare Workers.

## Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (v8 or later)
- [Git](https://git-scm.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (for Cloudflare Workers deployment)

### Cloudflare Account Setup

**Important:** Each team member can create their own [Cloudflare account](https://dash.cloudflare.com/sign-up) for development and testing.

#### Benefits of a Free Cloudflare Account:
- **100,000 free requests per day** on the Workers free tier
- **10 GB of free storage** with Cloudflare R2
- **1 GB of free database storage** with Cloudflare D1
- **Unlimited KV operations** for caching and session data (up to 1,000 keys)
- **Global edge deployment** across 300+ data centers worldwide
- **Built-in analytics and monitoring** for your applications
- **No credit card required** for the free tier

The free tier is more than sufficient for prototyping, development, and small-scale applications. This allows each developer to have their own isolated environment for testing without affecting shared resources.

### Windows Users

**Important:** If you're using Windows, we strongly recommend using [Windows Subsystem for Linux (WSL)](https://docs.microsoft.com/en-us/windows/wsl/install) for the best development experience. This ensures compatibility with Node.js tooling and Cloudflare Workers development workflows.

To install WSL:
```bash
wsl --install
```

Then install Node.js within your WSL environment rather than on Windows directly.

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/kevin-cfw-nextjs-starter-ui.git
cd kevin-cfw-nextjs-starter-ui
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Run the Setup Script

The starter kit includes a setup script that helps you configure your environment:

```bash
npm run setup
```

This script will:
- Check your Node.js and npm versions
- Install Wrangler CLI if not already installed
- Create `.env` and `.env.local` files if they don't exist
- Help you set up Cloudflare D1 database (optional)
- Help you set up Cloudflare KV namespace (required for deployment)

## Step 4: Start the Development Server

```bash
npm run dev
```

This will start the Next.js development server at [http://localhost:3000](http://localhost:3000).

## Step 5: Explore the Starter Kit

The starter kit includes several examples and features to help you get started:

- **Home Page**: Overview of the starter kit features
- **Dashboard**: Example dashboard layout with data visualization
- **Examples**: Various examples including forms, API integration, etc.
- **API Routes**: Example API routes in `src/app/api`

## Step 6: Set Up Cloudflare D1 Database (Optional)

If you want to use Cloudflare D1 for database storage, follow these steps:

1. Uncomment the D1 configuration in `wrangler.toml`:

```toml
# Remove the # comments from these lines:
[[d1_databases]]
binding = "DB"
database_name = "starter_kit_db"
database_id = "placeholder"
```

2. Create a D1 database:

```bash
npm run db:create
```

3. Update the `wrangler.toml` file with your database ID (from the output of the previous command):

```toml
[[d1_databases]]
binding = "DB"
database_name = "starter-kit-db"
database_id = "your-database-id-here" # Replace with your database ID
```

4. Apply the schema to your database:

```bash
npm run db:migrate
```

## Step 7: Set Up Cloudflare KV Namespace (Required for Deployment)

The starter kit uses Cloudflare KV for caching and session data. You'll need to set up a KV namespace for deployment to work properly:

1. Create a KV namespace:

```bash
npm run kv:create
```

2. Update the `wrangler.toml` file with your KV namespace ID (from the output of the previous command):

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id-here" # Replace with your KV namespace ID
```

3. (Optional) For testing with Wrangler's preview mode, you can also create a preview namespace:

```bash
npm run kv:create-preview
```

Then add the preview ID to your `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id-here"
preview_id = "your-preview-kv-namespace-id-here"
```

## Step 8: Set Up Cloudflare R2 Storage (Optional)

If you want to use Cloudflare R2 for file storage, follow these steps:

1. Uncomment the R2 configuration in `wrangler.toml`:

```toml
# Remove the # comments from these lines:
[[r2_buckets]]
binding = "FILES"
bucket_name = "starter-kit-files"
```

2. Create an R2 bucket:

```bash
npm run r2:create
```

3. Update the bucket name in `wrangler.toml` if you used a different name.

## Step 9: Deploy Your Prototype to Cloudflare Workers

When you're ready to deploy your prototype to Cloudflare Workers for testing and experimentation:

1. Build the application:

```bash
npm run build
```

2. Deploy to Cloudflare Workers:

```bash
npm run deploy
```

This will deploy your prototype to Cloudflare Workers. The URL will be displayed in the terminal.

## Common Tasks

### Creating a New Page

To create a new page, add a `page.tsx` file in the appropriate directory under `src/app`:

```tsx
// src/app/my-page/page.tsx
export default function MyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-telus-purple mb-4">My New Page</h1>
      <p>This is my new page content.</p>
    </div>
  );
}
```

### Creating a New API Route

To create a new API route, add a `route.ts` file in the appropriate directory under `src/app/api`:

```ts
// src/app/api/my-route/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Hello from my API route' });
}
```

### Adding a New Component

To create a new component, add a file in the appropriate directory under `src/components`:

```tsx
// src/components/ui/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
}

export default function MyComponent({ title }: MyComponentProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold text-telus-purple">{title}</h2>
    </div>
  );
}
```

## Troubleshooting

### Development Server Issues

If you encounter issues with the development server:

1. Make sure you have the correct Node.js and npm versions
2. Try clearing the Next.js cache: `rm -rf .next`
3. Reinstall dependencies: `rm -rf node_modules && npm install`

### Deployment Issues

If you encounter issues deploying to Cloudflare Workers:

1. Make sure you're logged in to Cloudflare: `wrangler login`
2. Check your `wrangler.toml` configuration
3. Make sure your application builds successfully: `npm run build`

## Next Steps

- Check out the [Customization Guide](./CUSTOMIZATION.md) to learn how to customize the starter kit
- Explore the [API Documentation](./API.md) to learn more about the available API routes
- Read the [Database Guide](./DATABASE.md) to learn how to use Cloudflare D1 effectively

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare KV Documentation](https://developers.cloudflare.com/kv/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
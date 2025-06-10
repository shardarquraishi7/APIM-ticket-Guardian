# Customizing the Next.js Cloudflare Workers Starter Kit

This guide provides instructions on how to customize the starter kit for your specific needs. The starter kit is designed to be easily extensible and customizable for different types of projects.

## Table of Contents

- [Customizing the Next.js Cloudflare Workers Starter Kit](#customizing-the-nextjs-cloudflare-workers-starter-kit)
  - [Table of Contents](#table-of-contents)
  - [Customizing the Theme](#customizing-the-theme)
    - [Changing Colors](#changing-colors)
    - [Changing Typography](#changing-typography)
  - [Adding New Components](#adding-new-components)
    - [Component Structure](#component-structure)
    - [Using Components](#using-components)
  - [Extending the Database](#extending-the-database)
    - [Adding a New Table](#adding-a-new-table)
    - [Creating a Database Utility](#creating-a-database-utility)
  - [Adding Authentication](#adding-authentication)
    - [OAuth Integration](#oauth-integration)
  - [Creating New API Routes](#creating-new-api-routes)
    - [Basic API Route](#basic-api-route)
  - [Deploying to Custom Domains](#deploying-to-custom-domains)
  - [Need More Help?](#need-more-help)

## Customizing the Theme

The starter kit uses Tailwind CSS with a custom TELUS-inspired theme. You can customize the theme by modifying the `tailwind.config.js` file.

### Changing Colors

To change the color scheme, update the colors in `tailwind.config.js`:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Replace with your brand colors
        'primary': '#4B286D',       // TELUS Purple
        'secondary': '#2A8A3E',     // TELUS Green
        // ...
      },
    },
  },
  // ...
}
```

You'll also need to update the CSS variables in `src/app/globals.css`:

```css
:root {
  /* Replace with your brand colors */
  --primary: #4B286D;
  --secondary: #2A8A3E;
  /* ... */
}
```

### Changing Typography

To change the typography, update the font family and font sizes in `tailwind.config.js`:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Your-Font', 'sans-serif'],
        serif: ['Your-Serif-Font', 'serif'],
      },
      fontSize: {
        // Custom font sizes
      },
    },
  },
  // ...
}
```

## Adding New Components

The starter kit includes a set of basic components styled according to the TELUS design system. You can add new components by creating files in the `src/components` directory.

### Component Structure

Components should follow this basic structure:

```tsx
// src/components/ui/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  // Props definition
  title: string;
  description?: string;
}

export default function MyComponent({ title, description }: MyComponentProps) {
  return (
    <div className="my-component">
      <h2 className="text-xl font-bold text-primary">{title}</h2>
      {description && <p className="text-gray-600">{description}</p>}
    </div>
  );
}
```

### Using Components

Import and use your components in pages:

```tsx
import MyComponent from '@/components/ui/MyComponent';

export default function MyPage() {
  return (
    <div>
      <MyComponent 
        title="My Component" 
        description="This is a custom component" 
      />
    </div>
  );
}
```

## Extending the Database

The starter kit uses Cloudflare D1 for database storage. You can extend the database schema by modifying the `database/schema.sql` file.

### Adding a New Table

To add a new table, add the CREATE TABLE statement to the schema file:

```sql
-- database/schema.sql
CREATE TABLE IF NOT EXISTS my_new_table (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Then apply the changes to your D1 database:

```bash
npm run db:migrate
```

### Creating a Database Utility

Create a utility file for your new table in `src/lib/database`:

```ts
// src/lib/database/my-table.ts
import { db } from './db';

export interface MyTableItem {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

export async function getAllItems(): Promise<MyTableItem[]> {
  return db.query('SELECT * FROM my_new_table').then(result => result.rows);
}

export async function getItemById(id: number): Promise<MyTableItem | null> {
  return db.query('SELECT * FROM my_new_table WHERE id = ?', [id])
    .then(result => result.rows[0] || null);
}

export async function createItem(item: Omit<MyTableItem, 'id' | 'created_at'>): Promise<MyTableItem> {
  return db.query(
    'INSERT INTO my_new_table (name, description) VALUES (?, ?) RETURNING *',
    [item.name, item.description || null]
  ).then(result => result.rows[0]);
}
```

## Adding Authentication

The starter kit includes a basic authentication structure that's ready for OAuth integration. You can customize it for your specific authentication provider.

### OAuth Integration

To integrate with an OAuth provider, update the authentication utilities in `src/lib/auth`:

1. Configure your OAuth provider settings in `.env` or Cloudflare environment variables
2. Implement the OAuth flow in the authentication utilities
3. Update the protected routes to use your authentication logic

## Creating New API Routes

The starter kit includes examples of API routes using Next.js API routes. You can create new API routes by adding files to the `src/app/api` directory.

### Basic API Route

Create a new API route file:

```ts
// src/app/api/my-route/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Your logic here
    return NextResponse.json({ 
      success: true, 
      data: { message: 'Hello from my API route' } 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'An error occurred' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Process the request body
    return NextResponse.json({ 
      success: true, 
      data: { received: body } 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'An error occurred' 
    }, { status: 500 });
  }
}
```

## Deploying to Custom Domains

The starter kit is configured for deployment to Cloudflare Workers. You can deploy to a custom domain by following these steps:

1. Add your domain to Cloudflare (if not already there)
2. Configure your domain in `wrangler.toml`:

```toml
# wrangler.toml
[env.production]
routes = [
  { pattern = "your-domain.com/*", zone_id = "your-zone-id" }
]
```

3. Deploy your application:

```bash
npm run deploy
```

4. Set up DNS records to point to your Cloudflare Workers application

For more detailed instructions, refer to the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/platform/routes).

## Need More Help?

Check the [official documentation](#) for more detailed guides and examples.
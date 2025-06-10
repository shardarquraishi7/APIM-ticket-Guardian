# Project Structure and Components

This document provides an overview of the Next.js Cloudflare Workers Starter Kit's architecture, file organization, and available components.

## Project Overview

The starter kit is built with:
- **Next.js 15.3.3** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Cloudflare Workers** - Edge computing platform
- **TELUS Design System** - Corporate styling and branding

## Directory Structure

```
kevin-cfw-nextjs-starter-ui/
├── docs/                           # Documentation files
│   ├── GETTING_STARTED.md          # Setup and installation guide
│   ├── CUSTOMIZATION.md            # Customization instructions
│   └── PROJECT_STRUCTURE.md        # This file
├── database/                       # Database schema and migrations
│   └── schema.sql                  # D1 database schema
├── public/                         # Static assets
│   ├── telus-logo-black-and-white.png
│   ├── slack-logo-bw.png
│   └── *.svg                       # Various icons
├── scripts/                        # Build and setup scripts
│   └── setup.js                    # Environment setup script
├── src/                            # Source code
│   ├── app/                        # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout with header/footer
│   │   ├── page.tsx                # Home page
│   │   ├── globals.css             # Global styles and TELUS theme
│   │   ├── api/                    # API routes
│   │   │   ├── users/route.ts      # User management API
│   │   │   └── validate-token/route.ts # OAuth token validation
│   │   ├── dashboard/              # Dashboard example
│   │   ├── docs/                   # Documentation pages
│   │   │   ├── page.tsx            # Documentation index
│   │   │   ├── getting-started/    # Getting started guide
│   │   │   ├── customization/      # Customization guide
│   │   │   └── project-structure/  # This documentation
│   │   └── examples/               # Feature examples
│   │       ├── page.tsx            # Examples index
│   │       ├── api/                # API integration examples
│   │       ├── auth/               # Authentication examples
│   │       ├── charts/             # Chart.js examples
│   │       ├── components/         # Component examples
│   │       ├── forms/              # Form handling examples
│   │       └── upload/             # File upload examples
│   ├── components/                 # Reusable React components
│   │   └── OAuthWrapper.tsx        # Authentication wrapper
│   └── lib/                        # Utility libraries
│       └── database/               # Database utilities
│           └── db.ts               # D1 database connection
├── package.json                    # Dependencies and scripts
├── wrangler.toml                   # Cloudflare Workers configuration
├── next.config.ts                  # Next.js configuration
├── open-next.config.ts             # OpenNext Cloudflare adapter config
├── tailwind.config.js              # Tailwind CSS configuration
└── tsconfig.json                   # TypeScript configuration
```

## Core Components

### 1. OAuthWrapper Component

**Location**: `src/components/OAuthWrapper.tsx`

A drop-in authentication component that handles TELUS OAuth integration.

**Features**:
- Automatic token validation
- Development mode bypass (localhost)
- Token storage and retrieval
- Error handling and user feedback
- Seamless redirect handling

**Usage**:
```tsx
import OAuthWrapper from '@/components/OAuthWrapper'

<OAuthWrapper>
  <YourAppContent />
</OAuthWrapper>
```

**Exported Functions**:
- `logout()` - Clears authentication and redirects to logout
- `useUser()` - React hook to access current user data

### 2. Root Layout

**Location**: `src/app/layout.tsx`

Provides the main application structure with TELUS branding.

**Features**:
- TELUS header with logo and navigation
- Responsive design with mobile menu
- Footer with resources and contact information
- OAuth wrapper integration
- Global font and styling setup

## Styling System

### TELUS Design System

The starter kit includes TELUS corporate colors and styling:

**Primary Colors**:
- `telus-purple`: #49286A (Primary brand color)
- `telus-light-green`: #66CC00 (Accent color)
- `telus-dark-green`: #2B8000 (Accessible Green)

**Typography**:
- Primary font: Geist Sans
- Monospace font: Geist Mono

### Tailwind CSS Configuration

**Location**: `tailwind.config.js`

Extended with TELUS colors and custom utilities for consistent branding across the application.

## API Routes

### Authentication API

**Location**: `src/app/validate-token/route.ts`
- Validates OAuth tokens server-side
- Integrates with TELUS authentication system

### User Management API

**Location**: `src/app/api/users/route.ts`
- Example CRUD operations
- Database integration examples
- RESTful API patterns

## Database Integration

### Cloudflare D1

**Schema**: `database/schema.sql`
**Connection**: `src/lib/database/db.ts`

The starter kit includes optional D1 database integration for:
- User data storage
- Application state management
- Relational data operations

## Build and Deployment

### NPM Scripts

```json
{
  "dev": "next dev",                    // Development server
  "build": "next build",                // Production build
  "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
  "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
  "setup": "node scripts/setup.js",     // Environment setup
  "db:create": "wrangler d1 create starter-kit-db",
  "db:migrate": "wrangler d1 execute starter-kit-db --file=./database/schema.sql",
  "kv:create": "wrangler kv namespace create \"CACHE\"",
  "r2:create": "wrangler r2 bucket create starter-kit-files"
}
```

### Cloudflare Services

**Wrangler Configuration**: `wrangler.toml`

Supports integration with:
- **Workers**: Edge computing and API routes
- **D1**: Serverless SQL database
- **KV**: Key-value storage for caching
- **R2**: Object storage for files

## Development Patterns

### File-based Routing

Following Next.js App Router conventions:
- `page.tsx` - Route components
- `layout.tsx` - Shared layouts
- `route.ts` - API endpoints
- `loading.tsx` - Loading states
- `error.tsx` - Error boundaries

### Component Organization

```
src/components/
├── ui/                    # Basic UI components
├── forms/                 # Form-specific components
├── charts/                # Data visualization components
└── layout/                # Layout-specific components
```

### State Management

- React hooks for local state
- localStorage for client-side persistence
- Cloudflare KV for server-side caching
- D1 database for persistent data

## Environment Configuration

### Development vs Production

- **Development**: OAuth bypass, local database, hot reloading
- **Production**: Full OAuth integration, Cloudflare services, edge deployment

### Environment Variables

Configure through:
- `.env.local` - Local development
- `wrangler.toml` - Cloudflare Workers environment
- Cloudflare Dashboard - Production secrets

## Security Considerations

### Authentication

- TELUS OAuth integration
- JWT token validation
- Automatic token refresh
- Secure token storage

### Data Protection

- Server-side validation
- Type-safe APIs with TypeScript
- Input sanitization
- CORS configuration

## Performance Optimization

### Edge Computing

- Global deployment via Cloudflare Workers
- Reduced latency with edge locations
- Automatic scaling and load balancing

### Caching Strategy

- Static asset caching via Cloudflare CDN
- KV storage for dynamic content caching
- Browser caching for authenticated sessions

## Extending the Starter Kit

### Adding New Pages

1. Create `page.tsx` in appropriate `src/app/` directory
2. Follow TELUS design patterns
3. Include proper TypeScript types
4. Add navigation links as needed

### Adding New Components

1. Create component in `src/components/`
2. Export with proper TypeScript interfaces
3. Include JSDoc documentation
4. Follow TELUS styling guidelines

### Adding New API Routes

1. Create `route.ts` in `src/app/api/` directory
2. Implement proper HTTP methods
3. Include error handling
4. Add authentication if required

## Best Practices

### Code Organization

- Use TypeScript for type safety
- Follow React hooks patterns
- Implement proper error boundaries
- Include comprehensive JSDoc comments

### Performance

- Minimize bundle size with tree shaking
- Use dynamic imports for code splitting
- Optimize images and static assets
- Implement proper caching strategies

### Security

- Validate all inputs server-side
- Use environment variables for secrets
- Implement proper CORS policies
- Follow OAuth best practices

## Troubleshooting

### Common Issues

1. **OAuth not working**: Check OAUTH_WORKER_URL configuration
2. **Database connection failed**: Verify D1 setup and wrangler.toml
3. **Build errors**: Check TypeScript types and dependencies
4. **Deployment issues**: Verify Cloudflare account and permissions

### Debug Tools

- Browser developer tools for client-side debugging
- Wrangler logs for Workers debugging
- Next.js built-in error reporting
- Cloudflare dashboard analytics

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [TELUS Design System Guidelines](https://tds.telus.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
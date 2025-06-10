import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure for Cloudflare Workers deployment
  output: 'standalone',
  
  // Disable image optimization since Cloudflare Workers doesn't support it natively
  images: {
    unoptimized: true,
  },
  
  // Server external packages (moved from experimental.serverComponentsExternalPackages)
  serverExternalPackages: [],
  
  // Environment variables that will be available at build time
  env: {
    NEXT_PUBLIC_ENVIRONMENT: process.env.ENVIRONMENT || 'development',
  },
  
  // Redirects
  async redirects() {
    return [];
  },
  
  // Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

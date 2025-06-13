/** @type {import('next').NextConfig} */
const nextConfig = {
  // Learn more: https://nextjs.org/docs/api-reference/next.config.js/react-strict-mode
  reactStrictMode: true,
  output: 'standalone',
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        '@telus/core-logger': 'commonjs @telus/core-logger',
        pino: 'commonjs pino',
      });
    }

    return config;
  },
};

export default nextConfig;

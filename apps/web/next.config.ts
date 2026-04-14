import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    optimizePackageImports: ['wagmi', 'viem', '@anthropic-ai/sdk', 'openai'],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.fal.media',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fal.run',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from 'next';

import withBundleAnalyzer from '@next/bundle-analyzer';

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

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Wagmi requires unsafe-eval for its internal runtime behavior.
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.fal.media https://fal.run",
              "connect-src 'self' https://forno.celo.org https://api.deepseek.com https://api.anthropic.com https://fal.run https://*.fal.media",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withAnalyzer(nextConfig);

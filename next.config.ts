import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : 'standalone',
  transpilePackages: ['mathml2omml', 'pptxgenjs'],
  serverExternalPackages: [],
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_DISABLE_ESLINT === '1',
  },
  typescript: {
    ignoreBuildErrors: process.env.NEXT_IGNORE_TS_ERRORS === '1',
  },
  experimental: {
    proxyClientMaxBodySize: '200mb',
  },
};

export default nextConfig;

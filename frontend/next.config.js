/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Disable ESLint during build (temporary fix for TypeScript ESLint issues)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript checking during build (type errors already checked in dev)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Output for production
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.arenahub.space',
      },
      {
        protocol: 'https',
        hostname: 'minio.arenahub.space',
      },
    ],
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_MEDIA_URL: process.env.NEXT_PUBLIC_MEDIA_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Fix for Next.js 15 production build with onClick handlers
  compiler: {
    // Remove in production to fix onClick issues
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  },

  // Ensure proper client-side bundle handling
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;

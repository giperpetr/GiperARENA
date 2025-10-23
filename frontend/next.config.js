/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',

  // Disable static optimization for dynamic pages
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Force dynamic rendering for all pages
    isrMemoryCacheSize: 0,
  },

  // Disable static page generation during build
  distDir: '.next',
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.giperarena.space',
      },
      {
        protocol: 'https',
        hostname: 'storage.gipergiraffe.com',
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

  turbopack: {},
};

module.exports = nextConfig;

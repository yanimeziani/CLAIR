/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  output: 'standalone',
  // Skip static optimization for API routes during build
  trailingSlash: false,
  generateBuildId: async () => {
    return 'build'
  }
};

module.exports = nextConfig;
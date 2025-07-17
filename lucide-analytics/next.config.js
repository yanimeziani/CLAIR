import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;
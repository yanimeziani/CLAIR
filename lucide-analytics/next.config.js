/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  // Configure for Docker deployment
  env: {
    CUSTOM_KEY: 'my-value',
  },
}

module.exports = nextConfig
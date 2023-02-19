/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ['react-syntax-highlighter', 'swagger-client', 'swagger-ui-react']
}

module.exports = nextConfig
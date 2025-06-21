/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for better server deployment
  output: 'standalone',
  
  // Add headers for iframe embedding and CORS
  async headers() {
    return [
      {
        // Apply headers to embed page
        source: '/embed',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL', // Allow embedding from any domain
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *;", // Allow embedding from any domain
          },
        ],
      },
      {
        // Apply headers to streaming API
        source: '/api/stream',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, HEAD, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Range, Content-Type',
          },
        ],
      },
    ];
  },
  
  // Optimize for production
  poweredByHeader: false,
  compress: true,
  
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;

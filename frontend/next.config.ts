import type { NextConfig } from "next";
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Try to load environment variables from different possible locations
const envPaths = [
  // resolve(__dirname, '../.env/.env.production'),
  // resolve(__dirname, '../.env/.env.staging'),
  resolve(__dirname, '../.env/.env.local'),
];

// Load the first .env file that exists
for (const path of envPaths) {
  if (existsSync(path)) {
    console.log(`Loading environment variables from ${path}`);
    config({ path });
    break;
  }
}

// Get API URL with fallback for Vercel deployment
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const nextConfig: NextConfig = {
  env: {
    // Make backend environment variables available to frontend
    NEXT_PUBLIC_API_URL: apiUrl,
  },
  // Add CORS headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'Authorization, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*/`,
      },
    ];
  },
  trailingSlash: false,
};

export default nextConfig;

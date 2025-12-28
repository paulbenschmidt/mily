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
    config({ path });
    break;
  }
}

// Get API URL with fallback for Vercel deployment and remove any trailing slash if present
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

// Get S3 bucket name for image optimization
const s3BucketName = process.env.AWS_S3_PHOTOS_BUCKET;

const nextConfig: NextConfig = {
  env: {
    // Make backend environment variables available to frontend
    NEXT_PUBLIC_MAX_PHOTOS_PER_EVENT: '3',
    NEXT_PUBLIC_FRONTEND_URL: process.env.FRONTEND_URL,
  },
  images: {
    remotePatterns: [
      // Always allow your public assets domain
      {
        protocol: "https",
        hostname: "assets.mily.bio",
        pathname: "/**",
      },

      // Optionally allow your private/user-photo bucket hostnames
      ...(s3BucketName
        ? ([
            {
              protocol: "https",
              hostname: `${s3BucketName}.s3.amazonaws.com`,
              pathname: "/**",
            },
            {
              protocol: "https",
              hostname: `${s3BucketName}.s3.us-east-2.amazonaws.com`,
              pathname: "/**",
            },
          ] as const)
        : []),
    ],
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
    // Why so many /api rewrites?
    // - Django/DRF's default routing expects trailing slashes (e.g. /events/self/).
    // - Next.js also applies its own trailing-slash canonicalization at the edge.
    // If the incoming request and the backend expectation disagree about a trailing
    // slash, you pay a redirect on every API call (301/308), and in some cases can
    // even create redirect loops.
    //
    // These rules handle all variations we might generate:
    // - /api and /api/ (root)
    // - /api/<path> and /api/<path>/
    //
    // We always forward to the backend with exactly one trailing slash so the
    // backend never needs to append one (and therefore never redirects).
    return [
      {
        source: '/api',
        destination: `${apiUrl}`,
      },
      {
        source: '/api/',
        destination: `${apiUrl}/`,
      },
      {
        source: '/api/:path*/',
        destination: `${apiUrl}/:path*/`,
      },
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*/`,
      },
    ];
  },
  trailingSlash: true,
};

export default nextConfig;

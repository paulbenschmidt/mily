import type { NextConfig } from "next";
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from root .env/.env.development
config({ path: resolve(__dirname, '../.env/.env.development') });

const nextConfig: NextConfig = {
  env: {
    // Make backend environment variables available to frontend
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;

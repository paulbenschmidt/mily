import type { NextConfig } from "next";
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from root .env/.env.development
config({ path: resolve(__dirname, '../.env/.env.development') });

const nextConfig: NextConfig = {
  env: {
    // Make backend environment variables available to frontend
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL,
  },
};

export default nextConfig;

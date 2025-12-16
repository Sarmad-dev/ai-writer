import type { NextConfig } from "next";

// Load environment variables early
require('dotenv').config();

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Add empty turbopack config to silence the warning
  turbopack: {},
  
  // Ensure environment variables are available
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SEARCH_API_KEY: process.env.SEARCH_API_KEY,
    UPLOAD_BUCKET_URL: process.env.UPLOAD_BUCKET_URL,
  },
};

export default nextConfig;

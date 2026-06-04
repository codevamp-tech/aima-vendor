import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Reads base path from env:
  //   .env.local      → NEXT_PUBLIC_BASE_PATH=        (empty = runs at /)
  //   .env.production → NEXT_PUBLIC_BASE_PATH=/account (runs at /account/)
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',

  // Allow up to 20MB for document uploads (GST, PAN, MSME, etc.)
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serve the app under /account/ on the production server
  // Remove or change this for local dev if needed
  basePath: process.env.NODE_ENV === 'production' ? '/account' : '',

  // Allow up to 20MB for document uploads (GST, PAN, MSME, etc.)
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
};

export default nextConfig;

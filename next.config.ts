import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow up to 20MB for document uploads (GST, PAN, MSME, etc.)
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
};

export default nextConfig;

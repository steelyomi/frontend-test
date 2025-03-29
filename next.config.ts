import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ['pdfjs-dist', 'react-pdf'],
  },
};

export default nextConfig;

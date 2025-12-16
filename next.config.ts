import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        hostname: "ik.imagekit.io",
        protocol: "https",
      },
      {
        hostname: "v3b.fal.media",
        protocol: "https",
      },
      {
        hostname: "fal.media",
        protocol: "https",
      },
      {
        hostname: "*.fal.media",
        protocol: "https",
      },
      {
        hostname: "rendus-ai-generations.s3.eu-west-2.amazonaws.com",
        protocol: "https",
      },
      {
        hostname: "storage.googleapis.com",
        protocol: "https",
      },
      {
        hostname: "fal-cdn.batuhan-941.workers.dev",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
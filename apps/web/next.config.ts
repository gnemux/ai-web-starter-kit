import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb"
    }
  },
  transpilePackages: [
    "@xwlc/core",
    "@xwlc/db",
    "@xwlc/platform",
    "@xwlc/ui"
  ]
};

export default nextConfig;

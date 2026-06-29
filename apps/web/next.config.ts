import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@xwlc/core",
    "@xwlc/db",
    "@xwlc/platform",
    "@xwlc/ui"
  ]
};

export default nextConfig;

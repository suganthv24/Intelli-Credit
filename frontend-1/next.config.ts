import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse is a CommonJS module — exclude it from the ESM bundle
  // so Node.js requires it natively at runtime.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;

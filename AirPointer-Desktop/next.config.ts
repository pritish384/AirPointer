import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  distDir: "out",
  devIndicators: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

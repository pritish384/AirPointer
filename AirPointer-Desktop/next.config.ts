import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  devIndicators: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const repoName = process.env.REPO_NAME || ".";

const nextConfig: NextConfig = {
  output: "export", // Enables static exports
  basePath: process.env.NODE_ENV === "production" ? `/${repoName}` : "",
  assetPrefix: process.env.NODE_ENV === "production" ? `/${repoName}/` : "",
  images: {
    unoptimized: true, // Necessary for static export if using next/image without a custom loader
  },
};

export default nextConfig;


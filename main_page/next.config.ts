import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
    ],
  },

  env: {
    NEXT_PUBLIC_ACCOUNT_API_URL: process.env.NEXT_PUBLIC_ACCOUNT_API_URL,
  },
};

export default nextConfig;

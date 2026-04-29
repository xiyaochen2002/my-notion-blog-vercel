import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "s3.us-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**.notion.so",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/travel", destination: "/gallery", permanent: true },
      { source: "/notes", destination: "/writing", permanent: true },
    ];
  },
};

export default nextConfig;

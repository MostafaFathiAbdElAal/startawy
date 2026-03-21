import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  serverExternalPackages: [
    '@prisma/client',
    'prisma',
    '@prisma/adapter-mariadb',
    'mysql2'
  ],
};

export default nextConfig;

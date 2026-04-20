/* eslint-disable @typescript-eslint/no-explicit-any */
const nextConfig: any = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default nextConfig as any;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Prisma + Next.js 서버리스 환경 호환
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Keep server-only packages (Prisma, pg) out of the client bundle
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg", "pg-pool", "bcryptjs"],

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/(.*)\\.(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: "/shop", destination: "/packages", permanent: true },
      { source: "/kits", destination: "/packages", permanent: true },
    ];
  },

  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
};

export default nextConfig;

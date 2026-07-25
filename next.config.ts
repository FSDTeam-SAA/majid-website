import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
      { hostname: "img.freepik.com" },
      { hostname: "res.cloudinary.com" },
      { hostname: "api.dicebear.com" },
      { hostname: "i.pravatar.cc" },
      { hostname: "images.unsplash.com" },
      { hostname: "images.barcodelookup.com" },
    ],
  },
};

export default nextConfig;

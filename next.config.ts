import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      // Mock avatars — replace with real storage (Supabase/CDN) later.
      { protocol: "https", hostname: "i.pravatar.cc" },
      // Mock banners.
      { protocol: "https", hostname: "picsum.photos" },
      // Discord CDN, for when OAuth avatars come online.
      { protocol: "https", hostname: "cdn.discordapp.com" },
    ],
  },
};

export default nextConfig;

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
      // Discord CDN (avatars, banners, decorations, clan/collectible assets).
      { protocol: "https", hostname: "cdn.discordapp.com" },
      // Supabase Storage — arquivo permanente de avatares/banners do histórico.
      { protocol: "https", hostname: "ytvewdrxquglzvssljza.supabase.co" },
    ],
  },
};

export default nextConfig;

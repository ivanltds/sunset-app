import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {}, // Silencia o erro de conflito Webpack vs Turbopack do Next 16
  reactStrictMode: false, // Necessário para evitar o erro "Map container is being reused" do React Leaflet
  // Permite conexões do túnel do Cloudflare
  allowedDevOrigins: [
    "loads-emissions-riding-bookmarks.trycloudflare.com",
    "liquid-niagara-msgstr-spray.trycloudflare.com",
    "hot-words-add.loca.lt",
    "metal-pandas-attack.loca.lt",
    "992533bf83185f.lhr.life",
    "funny-rocks-buy.loca.lt",
    "smooth-ladybug-9.loca.lt"
  ],
  async rewrites() {
    return [
      {
        source: '/supabase-api/:path*',
        destination: 'http://127.0.0.1:54421/:path*'
      }
    ]
  }
};

export default withSerwist(nextConfig);

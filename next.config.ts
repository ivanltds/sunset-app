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
  // Permite conexões do túnel do Cloudflare
  allowedDevOrigins: [
    "loads-emissions-riding-bookmarks.trycloudflare.com",
    "liquid-niagara-msgstr-spray.trycloudflare.com"
  ],
};

export default withSerwist(nextConfig);

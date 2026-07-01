import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sunset App",
    short_name: "Sunset",
    description: "Encontros reais que viram memórias.",
    start_url: "/",
    display: "standalone",
    background_color: "#121212",
    theme_color: "#ff5a5f",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

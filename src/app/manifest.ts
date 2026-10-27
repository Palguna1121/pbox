import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} | ${site.tagline}`,
    short_name: site.shortName,
    description: site.description,
    lang: "id",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    theme_color: "#0b0820",
    background_color: "#0b0820",
    categories: ["photo", "entertainment"],
    icons: [
      { src: "/images/pbox-icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/images/pbox-icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

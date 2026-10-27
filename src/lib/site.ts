export const site = {
  name: "PBOX",
  shortName: "PBOX",
  tagline: "Photobooth arcade di browser",
  description:
    "PBOX adalah photobooth online bergaya arcade: ambil foto dari webcam atau kamera booth, pasang frame, stiker, teks, dan filter, lalu unduh, bagikan, atau cetak.",
  locale: "id_ID",
  keywords: [
    "photobooth online",
    "photobox",
    "photo booth browser",
    "foto frame online",
    "stiker foto",
    "pas foto online",
    "editor foto online",
    "photobooth event",
    "photo strip",
  ],
} as const;

/** Absolute base URL for metadata, sitemap, and share links. */
export function siteUrl(path = "/"): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";
  return new URL(path, base.endsWith("/") ? base : `${base}/`).toString();
}

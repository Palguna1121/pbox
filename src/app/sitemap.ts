import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/photobox", priority: 0.9, changeFrequency: "weekly" },
  { path: "/sticker-pic", priority: 0.9, changeFrequency: "weekly" },
  { path: "/formal-pic", priority: 0.8, changeFrequency: "monthly" },
  { path: "/login", priority: 0.3, changeFrequency: "yearly" },
  { path: "/register", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: siteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // The build may run without a database; fall back to static routes only.
  try {
    const [frames, stickers] = await Promise.all([
      prisma.frameCatalog.findMany({ select: { id: true, updatedAt: true } }),
      prisma.stickerCatalog.findMany({ select: { id: true, updatedAt: true } }),
    ]);
    for (const frame of frames) {
      entries.push({ url: siteUrl(`/photobox/${frame.id}`), lastModified: frame.updatedAt, changeFrequency: "monthly", priority: 0.6 });
    }
    for (const sticker of stickers) {
      entries.push({ url: siteUrl(`/sticker-pic/${sticker.id}`), lastModified: sticker.updatedAt, changeFrequency: "monthly", priority: 0.6 });
    }
  } catch (error) {
    console.warn("sitemap: catalog lookup skipped", error instanceof Error ? error.message : error);
  }

  return entries;
}

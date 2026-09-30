import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
  const session = await getAuthSession();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [totalUsers, totalFrames, totalStickers, totalPhotos] = await Promise.all([
      prisma.user.count({ where: { role: "user" } }),
      prisma.frameCatalog.count(),
      prisma.stickerCatalog.count(),
      prisma.image.count(),
    ]);

    return NextResponse.json({ totalUsers, totalFrames, totalStickers, totalPhotos });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveStickerImage } from "@/lib/catalog-assets";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sticker = await prisma.stickerCatalog.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!sticker) {
      return NextResponse.json({ error: "Sticker tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      id: sticker.id,
      name: sticker.stickerName,
      imageUrl: resolveStickerImage(sticker.stickerName, sticker.imageUrl),
      category: sticker.category?.name,
    });
  } catch (error) {
    console.error("Error fetching sticker:", error);
    return NextResponse.json({ error: "Gagal mengambil data sticker" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const sticker = await prisma.stickerCatalog.findUnique({
      where: { id: params.id },
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
      imageUrl: sticker.imageUrl,
      category: sticker.category?.name,
    });
  } catch (error) {
    console.error("Error fetching sticker:", error);
    return NextResponse.json({ error: "Gagal mengambil data sticker" }, { status: 500 });
  }
}

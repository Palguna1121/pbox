import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { resolveStickerImage } from "@/lib/catalog-assets";

// GET: Mendapatkan semua sticker catalog
export async function GET() {
  try {
    const stickerCatalogs = await prisma.stickerCatalog.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(stickerCatalogs.map((sticker) => ({
      ...sticker,
      imageUrl: resolveStickerImage(sticker.stickerName, sticker.imageUrl),
    })));
  } catch (error) {
    console.error("Error fetching sticker catalogs:", error);
    return NextResponse.json({ error: "Failed to fetch sticker catalogs" }, { status: 500 });
  }
}

// POST: Membuat sticker catalog baru
export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { stickerName, categoryId, imageUrl } = body;

    // Validasi
    if (!stickerName || !categoryId || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Simpan ke database
    const stickerCatalog = await prisma.stickerCatalog.create({
      data: {
        stickerName,
        categoryId,
        imageUrl,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(stickerCatalog, { status: 201 });
  } catch (error) {
    console.error("Error creating sticker:", error);
    return NextResponse.json({ error: "Failed to create sticker" }, { status: 500 });
  }
}

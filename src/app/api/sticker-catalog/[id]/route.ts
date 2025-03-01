import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { uploadFile } from "@/app/utils/imagekit";

const prisma = new PrismaClient();

// GET: Mendapatkan detail sticker catalog
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const param = await params;
    const stickerCatalog = await prisma.stickerCatalog.findUnique({
      where: {
        id: param.id,
      },
    });

    if (!stickerCatalog) {
      return NextResponse.json({ error: "sticker catalog not found" }, { status: 404 });
    }

    return NextResponse.json(stickerCatalog);
  } catch (error) {
    console.error("Error fetching sticker catalog:", error);
    return NextResponse.json({ error: "Failed to fetch sticker catalog" }, { status: 500 });
  }
}

// PATCH: Memperbarui sticker catalog
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const param = await params;
    const body = await req.json();
    const { stickerName, categoryId, imageUrl } = body;

    // Validasi
    if (!stickerName || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const stickerCatalog = await prisma.stickerCatalog.update({
      where: { id: param.id },
      data: {
        stickerName,
        categoryId,
        imageUrl: imageUrl || undefined,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(stickerCatalog);
  } catch (error) {
    console.error("Error updating sticker:", error);
    return NextResponse.json({ error: "Failed to update sticker" }, { status: 500 });
  }
}

// DELETE: Menghapus sticker catalog
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const param = await params;
    await prisma.stickerCatalog.delete({
      where: {
        id: param.id,
      },
    });

    return NextResponse.json({ message: "sticker catalog deleted successfully" });
  } catch (error) {
    console.error("Error deleting sticker catalog:", error);
    return NextResponse.json({ error: "Failed to delete sticker catalog" }, { status: 500 });
  }
}

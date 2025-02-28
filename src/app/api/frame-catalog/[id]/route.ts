import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { uploadFileToPinata } from "@/app/utils/pinata";

const prisma = new PrismaClient();

// GET: Mendapatkan detail frame catalog
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const frameCatalog = await prisma.frameCatalog.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!frameCatalog) {
      return NextResponse.json({ error: "Frame catalog not found" }, { status: 404 });
    }

    return NextResponse.json(frameCatalog);
  } catch (error) {
    console.error("Error fetching frame catalog:", error);
    return NextResponse.json({ error: "Failed to fetch frame catalog" }, { status: 500 });
  }
}

// PATCH: Memperbarui frame catalog
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { frameName, categoryId, imageUrl } = body;

    // Validasi
    if (!frameName || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const frameCatalog = await prisma.frameCatalog.update({
      where: { id: params.id },
      data: {
        frameName,
        categoryId,
        imageUrl: imageUrl || undefined,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(frameCatalog);
  } catch (error) {
    console.error("Error updating frame:", error);
    return NextResponse.json({ error: "Failed to update frame" }, { status: 500 });
  }
}

// DELETE: Menghapus frame catalog
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.frameCatalog.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Frame catalog deleted successfully" });
  } catch (error) {
    console.error("Error deleting frame catalog:", error);
    return NextResponse.json({ error: "Failed to delete frame catalog" }, { status: 500 });
  }
}

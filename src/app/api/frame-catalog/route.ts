import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { uploadFile } from "@/app/utils/imagekit";

const prisma = new PrismaClient();

// GET: Mendapatkan semua frame catalog
export async function GET() {
  try {
    const frameCatalogs = await prisma.frameCatalog.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(frameCatalogs);
  } catch (error) {
    console.error("Error fetching frame catalogs:", error);
    return NextResponse.json({ error: "Failed to fetch frame catalogs" }, { status: 500 });
  }
}

// POST: Membuat frame catalog baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { frameName, categoryId, imageUrl } = body;

    // Validasi
    if (!frameName || !categoryId || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Simpan ke database
    const frameCatalog = await prisma.frameCatalog.create({
      data: {
        frameName,
        categoryId,
        imageUrl,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(frameCatalog, { status: 201 });
  } catch (error) {
    console.error("Error creating frame:", error);
    return NextResponse.json({ error: "Failed to create frame" }, { status: 500 });
  }
}

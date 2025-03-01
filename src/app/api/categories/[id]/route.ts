import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Mendapatkan detail kategori
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const param = await params;
    const category = await prisma.category.findUnique({
      where: {
        id: param.id,
      },
      include: {
        frameCatalogs: true,
        stickerCatalogs: true,
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

// PATCH: Memperbarui kategori
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const param = await params;
    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    // Periksa apakah ada kategori lain dengan nama yang sama
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        id: {
          not: param.id,
        },
      },
    });

    if (existingCategory) {
      return NextResponse.json({ error: "A category with this name already exists" }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: {
        id: param.id,
      },
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE: Menghapus kategori
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const param = await params;
    // Periksa apakah kategori tersebut digunakan oleh frame catalog
    const frameCatalogs = await prisma.frameCatalog.findMany({
      where: {
        categoryId: param.id,
      },
    });

    if (frameCatalogs.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category because it is being used by frame catalogs",
          frameCatalogs,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: {
        id: param.id,
      },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}

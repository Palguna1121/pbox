import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveFormalBackground } from "@/lib/catalog-assets";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formal = await prisma.formalPicture.findUnique({
      where: { id },
    });

    if (!formal) {
      return NextResponse.json({ error: "Template formal tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      id: formal.id,
      name: formal.name,
      backgroundUrl: resolveFormalBackground(formal.name, formal.backgroundUrl),
      sizes: formal.sizes,
    });
  } catch (error) {
    console.error("Error fetching formal picture:", error);
    return NextResponse.json({ error: "Gagal mengambil data template formal" }, { status: 500 });
  }
}

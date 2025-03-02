import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const formal = await prisma.formalPicture.findUnique({
      where: { id: params.id },
    });

    if (!formal) {
      return NextResponse.json({ error: "Template formal tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      id: formal.id,
      name: formal.name,
      backgroundUrl: formal.backgroundUrl,
      sizes: formal.sizes,
    });
  } catch (error) {
    console.error("Error fetching formal picture:", error);
    return NextResponse.json({ error: "Gagal mengambil data template formal" }, { status: 500 });
  }
}

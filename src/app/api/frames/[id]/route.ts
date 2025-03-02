import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const param = await params;
    const frame = await prisma.frameCatalog.findUnique({
      where: { id: param.id },
      include: {
        category: true,
        FramePlaceholders: true,
      },
    });

    if (!frame) {
      return NextResponse.json({ error: "Frame tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      id: frame.id,
      name: frame.frameName,
      imageUrl: frame.imageUrl,
      positions: frame.FramePlaceholders.map((p: any) => ({
        id: p.id,
        x: p.xPosition,
        y: p.yPosition,
        width: p.width,
        height: p.height,
      })),
    });
  } catch (error) {
    console.error("Error fetching frame:", error);
    return NextResponse.json({ error: "Gagal mengambil data frame" }, { status: 500 });
  }
}

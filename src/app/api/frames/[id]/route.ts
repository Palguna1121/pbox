import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveFrameImage } from "@/lib/catalog-assets";
import { detectFrameSlotsFromUrl } from "@/lib/frame-slots";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const imageUrl = resolveFrameImage(frame.frameName, frame.imageUrl);
    let placeholders = frame.FramePlaceholders;

    // Admin uploads have no slot editor, so derive slots from the overlay's transparent windows once.
    if (placeholders.length === 0) {
      const detected = await detectFrameSlotsFromUrl(imageUrl);
      if (detected.length) {
        await prisma.framePlaceholder.createMany({
          data: detected.map((d) => ({ frameId: frame.id, xPosition: d.x, yPosition: d.y, width: d.width, height: d.height })),
        });
        placeholders = await prisma.framePlaceholder.findMany({ where: { frameId: frame.id } });
      }
    }

    return NextResponse.json({
      id: frame.id,
      name: frame.frameName,
      imageUrl,
      positions: placeholders.map((p) => ({
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

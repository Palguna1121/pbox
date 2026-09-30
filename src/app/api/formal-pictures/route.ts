import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveFormalBackground } from "@/lib/catalog-assets";

export async function GET() {
  try {
    const formals = await prisma.formalPicture.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(formals.map((formal) => ({
      ...formal,
      backgroundUrl: resolveFormalBackground(formal.name, formal.backgroundUrl),
    })));
  } catch {
    return NextResponse.json({ error: "Failed to fetch formal pictures" }, { status: 500 });
  }
}

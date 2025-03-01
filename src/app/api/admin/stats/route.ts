import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalUsers = await prisma.user.count({ where: { role: "user" } });
    const totalFrames = await prisma.frameCatalog.count();
    const totalStickers = await prisma.stickerCatalog.count();

    return NextResponse.json({
      totalUsers,
      totalFrames,
      totalStickers,
      totalTransactions: 100, // Statis untuk sementara
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { deleteStoredFile, keyFromMediaUrl } from "@/lib/storage";

export const runtime = "nodejs";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const image = await prisma.image.findUnique({
    where: { id },
    select: { id: true, userId: true, storageKey: true, url: true },
  });
  if (!image) return NextResponse.json({ error: "Foto tidak ditemukan" }, { status: 404 });

  const isOwner = image.userId !== null && image.userId === session.user.id;
  if (!isOwner && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.image.delete({ where: { id: image.id } });

  const key = image.storageKey ?? keyFromMediaUrl(image.url);
  if (key) {
    await deleteStoredFile(key).catch((error) => console.error("Failed to delete stored file:", error));
  }

  return NextResponse.json({ ok: true });
}

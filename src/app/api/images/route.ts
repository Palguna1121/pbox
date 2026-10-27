import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { deleteStoredFile, MAX_UPLOAD_BYTES, saveImage, StorageError } from "@/lib/storage";

export const runtime = "nodejs";

const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"];

const metaSchema = z.object({
  type: z.enum(["frame", "sticker", "formal"]),
  itemId: z.string().max(191).optional().default(""),
});

const jsonSchema = metaSchema.extend({
  image: z.string().min(1),
});

/** Accepts a data URL (`data:image/png;base64,...`) or bare base64. */
function decodeDataUrl(value: string): Buffer {
  const match = /^data:([^;,]+)?(;base64)?,([\s\S]*)$/.exec(value);
  if (match) {
    if (!match[2]) throw new StorageError("Data URL harus base64", 400);
    if (match[1] && !ALLOWED_MIME.includes(match[1])) {
      throw new StorageError("Format harus PNG, JPEG, atau WebP", 415);
    }
    return Buffer.from(match[3], "base64");
  }
  return Buffer.from(value, "base64");
}

async function readUpload(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    const meta = metaSchema.safeParse({
      type: form.get("type"),
      itemId: form.get("itemId") ?? "",
    });
    if (!meta.success) return { error: "Data unggahan tidak valid" } as const;
    if (!(file instanceof Blob)) return { error: "File wajib diisi" } as const;
    if (file.type && !ALLOWED_MIME.includes(file.type)) {
      return { error: "Format harus PNG, JPEG, atau WebP", status: 415 } as const;
    }
    if (file.size > MAX_UPLOAD_BYTES) return { error: "File melebihi 15 MB", status: 413 } as const;
    return { buffer: Buffer.from(await file.arrayBuffer()), ...meta.data } as const;
  }

  const body = jsonSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return { error: "Data unggahan tidak valid" } as const;
  // base64 inflates by ~4/3; reject oversized payloads before decoding.
  if (body.data.image.length > Math.ceil(MAX_UPLOAD_BYTES * 1.37) + 64) {
    return { error: "File melebihi 15 MB", status: 413 } as const;
  }
  return { buffer: decodeDataUrl(body.data.image), type: body.data.type, itemId: body.data.itemId } as const;
}

export async function POST(request: Request) {
  const limit = rateLimit(request, { name: "images-upload", limit: 20, windowMs: 10 * 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Terlalu banyak unggahan. Coba lagi sebentar lagi." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  try {
    const upload = await readUpload(request);
    if ("error" in upload) {
      return NextResponse.json({ error: upload.error }, { status: upload.status ?? 400 });
    }

    const session = await getAuthSession();
    const stored = await saveImage(upload.buffer, { folder: "photos" });

    try {
      const image = await prisma.image.create({
        data: {
          url: stored.url,
          type: upload.type,
          itemId: upload.itemId,
          userId: session?.user?.id ?? null,
          storageKey: stored.key,
          mimeType: stored.mimeType,
          width: stored.width,
          height: stored.height,
          size: stored.size,
        },
      });

      return NextResponse.json(
        {
          id: image.id,
          imageUrl: image.url,
          shareToken: image.shareToken,
          shareUrl: `/p/${image.shareToken}`,
        },
        { status: 201 },
      );
    } catch (error) {
      await deleteStoredFile(stored.key).catch(() => {});
      throw error;
    }
  } catch (error) {
    if (error instanceof StorageError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error saving image:", error);
    return NextResponse.json({ error: "Gagal menyimpan gambar" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const images = await prisma.image.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 60,
    select: { id: true, url: true, type: true, shareToken: true, createdAt: true, width: true, height: true },
  });

  return NextResponse.json({ images }, { headers: { "Cache-Control": "private, no-store" } });
}

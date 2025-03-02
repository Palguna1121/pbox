import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { imagekit } from "@/lib/imagekit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, type, itemId } = body;

    // Upload ke ImageKit
    const uploadResponse = await imagekit.upload({
      file: Buffer.from(image, "base64"),
      fileName: `photo-${Date.now()}.jpg`,
      folder: "/nanabox-images",
      extensions: [
        {
          name: "google-auto-tagging",
          maxTags: 5,
          minConfidence: 95,
        },
      ],
    });

    // Simpan ke database
    const savedImage = await prisma.image.create({
      data: {
        url: uploadResponse.url,
        type,
        itemId,
      },
    });

    return NextResponse.json({
      id: savedImage.id,
      imageUrl: savedImage.url,
      createdAt: savedImage.createdAt,
    });
  } catch (error) {
    console.error("Error saving image:", error);
    return NextResponse.json({ error: "Gagal menyimpan gambar" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { pinata } from "@/app/utils/pinata";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Upload ke Pinata
    const fileObject = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      arrayBuffer: async () => await file.arrayBuffer(),
    };
    const uploadResult = await pinata.upload.file(fileObject, {
      metadata: {
        name: file.name,
      },
    });

    // Generate URL
    const imageUrl = `${process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL}/ipfs/${uploadResult.cid}`;

    return NextResponse.json({ cid: uploadResult.cid, url: imageUrl }, { status: 200 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

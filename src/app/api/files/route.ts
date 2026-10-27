import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { saveImage, StorageError, type StorageFolder } from "@/lib/storage";

export const runtime = "nodejs";

const FOLDERS: Record<string, StorageFolder> = {
  frames: "catalog/frames",
  stickers: "catalog/stickers",
  formal: "catalog/formal",
};

/** Accepts "frames", "/frames", or legacy ImageKit paths like "/nanabox-images/frames". */
function resolveFolder(value: FormDataEntryValue | null): StorageFolder | null {
  if (typeof value !== "string") return null;
  const last = value.split("/").filter(Boolean).pop()?.toLowerCase() ?? "";
  return FOLDERS[last] ?? null;
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof Blob)) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const folder = resolveFolder(formData.get("folder"));
    if (!folder) return NextResponse.json({ error: "Folder tidak valid" }, { status: 400 });

    const stored = await saveImage(Buffer.from(await file.arrayBuffer()), { folder });
    return NextResponse.json({ url: stored.url });
  } catch (error) {
    if (error instanceof StorageError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

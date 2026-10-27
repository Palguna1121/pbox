import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp, { type Metadata } from "sharp";

export const STORAGE_FOLDERS = ["photos", "catalog/frames", "catalog/stickers", "catalog/formal"] as const;
export type StorageFolder = (typeof STORAGE_FOLDERS)[number];

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
export const MAX_IMAGE_SIDE = 8000;

const FORMATS = {
  png: { ext: "png", mimeType: "image/png" },
  jpeg: { ext: "jpg", mimeType: "image/jpeg" },
  webp: { ext: "webp", mimeType: "image/webp" },
} as const;

const MIME_BY_EXT: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export class StorageError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
    this.name = "StorageError";
  }
}

export interface StoredImage {
  key: string;
  url: string;
  mimeType: string;
  width: number;
  height: number;
  size: number;
}

export function storageRoot(): string {
  // Runtime location (volume); keep Turbopack from tracing the whole project into the build output.
  return path.resolve(/*turbopackIgnore: true*/ process.env.STORAGE_DIR || path.join(process.cwd(), "storage"));
}

/** Resolve a storage key to an absolute path, rejecting anything that could escape the root. */
export function resolveStorageKey(key: string): string {
  if (
    !key ||
    key.length > 512 ||
    key.includes("\\") ||
    key.includes("\0") ||
    key.startsWith("/") ||
    path.isAbsolute(key) ||
    key.split("/").some((part) => part === "" || part === "." || part === "..")
  ) {
    throw new StorageError("Kunci file tidak valid", 400);
  }
  const root = storageRoot();
  const full = path.resolve(root, key);
  if (!full.startsWith(root + path.sep)) {
    throw new StorageError("Kunci file tidak valid", 400);
  }
  return full;
}

/** Turn a `/media/<key>` URL (absolute or relative) into a storage key, or null. */
export function keyFromMediaUrl(url: string): string | null {
  let pathname = url;
  if (/^https?:\/\//i.test(url)) {
    try {
      pathname = new URL(url).pathname;
    } catch {
      return null;
    }
  }
  if (!pathname.startsWith("/media/")) return null;
  const key = decodeURIComponent(pathname.slice("/media/".length));
  try {
    resolveStorageKey(key);
    return key;
  } catch {
    return null;
  }
}

function randomId(): string {
  // cuid-like: time prefix keeps keys roughly sortable, random suffix avoids collisions.
  return `c${Date.now().toString(36)}${randomBytes(10).toString("hex")}`;
}

export async function saveImage(input: Buffer, { folder }: { folder: StorageFolder }): Promise<StoredImage> {
  if (!STORAGE_FOLDERS.includes(folder)) throw new StorageError("Folder tidak dikenal", 400);
  if (input.length === 0) throw new StorageError("File kosong", 400);
  if (input.length > MAX_UPLOAD_BYTES) throw new StorageError("File melebihi 15 MB", 413);

  let meta: Metadata;
  try {
    meta = await sharp(input).metadata();
  } catch {
    throw new StorageError("File bukan gambar yang valid", 415);
  }
  const format = meta.format as keyof typeof FORMATS | undefined;
  if (!format || !(format in FORMATS)) {
    throw new StorageError("Format harus PNG, JPEG, atau WebP", 415);
  }
  if (!meta.width || !meta.height || meta.width > MAX_IMAGE_SIDE || meta.height > MAX_IMAGE_SIDE) {
    throw new StorageError(`Ukuran gambar maksimal ${MAX_IMAGE_SIDE}px per sisi`, 413);
  }

  // rotate() bakes EXIF orientation; sharp drops all metadata (GPS included) unless asked to keep it.
  let pipeline = sharp(input, { limitInputPixels: MAX_IMAGE_SIDE * MAX_IMAGE_SIDE }).rotate();
  if (format === "png") pipeline = pipeline.png({ compressionLevel: 9 });
  else if (format === "jpeg") pipeline = pipeline.jpeg({ quality: 92, mozjpeg: true });
  else pipeline = pipeline.webp({ quality: 92 });

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  const { ext, mimeType } = FORMATS[format];

  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const key = `${folder}/${yyyy}/${mm}/${randomId()}.${ext}`;
  const full = resolveStorageKey(key);

  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, data, { flag: "wx" });

  return { key, url: `/media/${key}`, mimeType, width: info.width, height: info.height, size: data.length };
}

export async function readStoredFile(key: string): Promise<{ data: Buffer; mimeType: string; size: number } | null> {
  const full = resolveStorageKey(key);
  try {
    const info = await stat(/*turbopackIgnore: true*/ full);
    if (!info.isFile()) return null;
    const data = await readFile(/*turbopackIgnore: true*/ full);
    const ext = path.extname(full).slice(1).toLowerCase();
    return { data, mimeType: MIME_BY_EXT[ext] ?? "application/octet-stream", size: info.size };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function deleteStoredFile(key: string): Promise<void> {
  await rm(resolveStorageKey(key), { force: true });
}

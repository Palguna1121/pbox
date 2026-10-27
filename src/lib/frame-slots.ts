import "server-only";
import path from "node:path";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { keyFromMediaUrl, readStoredFile } from "@/lib/storage";

export interface DetectedSlot {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ALPHA_HOLE = 24;
const MIN_AREA_RATIO = 0.015;
const MAX_SLOTS = 8;

/** Load a frame image that lives on this server (`/media/...` or `/images/...`). */
async function loadLocalFrame(url: string): Promise<Buffer | null> {
  const key = keyFromMediaUrl(url);
  if (key) return (await readStoredFile(key))?.data ?? null;
  if (url.startsWith("/images/") && !url.includes("..")) {
    try {
      return await readFile(/*turbopackIgnore: true*/ path.join(process.cwd(), "public", url));
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Finds the transparent "windows" of a frame overlay. Each enclosed transparent
 * region becomes a photo slot; regions touching the image edge are treated as
 * outside margin, not slots. Works on a downsampled alpha grid for speed.
 */
export async function detectFrameSlots(input: Buffer): Promise<DetectedSlot[]> {
  const img = sharp(input).ensureAlpha();
  const meta = await img.metadata();
  const W = meta.width ?? 0;
  const H = meta.height ?? 0;
  if (!W || !H) return [];

  const step = Math.max(1, Math.floor(Math.min(W, H) / 200));
  const gw = Math.ceil(W / step);
  const gh = Math.ceil(H / step);
  const { data } = await img.resize(gw, gh, { kernel: "nearest", fit: "fill" }).extractChannel("alpha").raw().toBuffer({ resolveWithObject: true });

  const seen = new Uint8Array(gw * gh);
  const slots: (DetectedSlot & { area: number })[] = [];
  const stack: number[] = [];

  for (let start = 0; start < gw * gh; start++) {
    if (seen[start] || data[start] > ALPHA_HOLE) continue;
    let minX = gw, minY = gh, maxX = 0, maxY = 0, area = 0, touchesEdge = false;
    stack.push(start);
    seen[start] = 1;
    while (stack.length) {
      const i = stack.pop()!;
      const x = i % gw;
      const y = (i - x) / gw;
      area++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (x === 0 || y === 0 || x === gw - 1 || y === gh - 1) touchesEdge = true;
      const next = [x > 0 ? i - 1 : -1, x < gw - 1 ? i + 1 : -1, y > 0 ? i - gw : -1, y < gh - 1 ? i + gw : -1];
      for (const n of next) {
        if (n >= 0 && !seen[n] && data[n] <= ALPHA_HOLE) {
          seen[n] = 1;
          stack.push(n);
        }
      }
    }
    if (touchesEdge || area < gw * gh * MIN_AREA_RATIO) continue;
    slots.push({
      x: minX * step,
      y: minY * step,
      width: Math.min(W, (maxX + 1) * step) - minX * step,
      height: Math.min(H, (maxY + 1) * step) - minY * step,
      area,
    });
  }

  return slots
    .sort((a, b) => b.area - a.area)
    .slice(0, MAX_SLOTS)
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .map(({ x, y, width, height }) => ({ x, y, width, height }));
}

export async function detectFrameSlotsFromUrl(url: string): Promise<DetectedSlot[]> {
  const buffer = await loadLocalFrame(url);
  if (!buffer) return [];
  try {
    return await detectFrameSlots(buffer);
  } catch {
    return [];
  }
}

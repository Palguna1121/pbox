import {
  FabricImage,
  FabricObject,
  Rect,
  config,
  filters,
  type Canvas,
} from "fabric";
import type { LayerRole, PhotoAdjust } from "./types";

// Custom props survive toObject/loadFromJSON, which keeps undo/redo lossless.
FabricObject.customProperties = ["pboxRole", "pboxName", "pboxSlot", "pboxAdjust"];
// Large camera frames (up to 4K) still go through WebGL filtering.
config.textureSize = 4096;

// Arcade-styled handles: square cyan corners with an ink outline.
Object.assign(FabricObject.ownDefaults, {
  cornerStyle: "rect",
  cornerSize: 14,
  cornerColor: "#3ef0ff",
  cornerStrokeColor: "#0b0820",
  transparentCorners: false,
  borderColor: "#3ef0ff",
  borderScaleFactor: 2,
  padding: 4,
});

/** Extra built-in props that toObject omits by default but undo needs. */
export const HISTORY_PROPS = [
  "selectable",
  "evented",
  "hasControls",
  "lockMovementX",
  "lockMovementY",
  "lockScalingX",
  "lockScalingY",
  "lockRotation",
];

export type PboxObject = FabricObject & {
  pboxRole?: LayerRole;
  pboxName?: string;
  pboxSlot?: number;
  pboxAdjust?: PhotoAdjust;
};

export const roleOf = (o: FabricObject) => (o as PboxObject).pboxRole;

/** Data URL → object URL keeps undo snapshots small (src is a short blob: string). */
export async function toObjectUrl(src: string): Promise<string> {
  if (!src.startsWith("data:")) return src;
  const blob = await (await fetch(src)).blob();
  return URL.createObjectURL(blob);
}

export async function loadFabricImage(src: string) {
  return FabricImage.fromURL(src, { crossOrigin: "anonymous" });
}

/** Scale and center `img` so it fully covers the rect (object-fit: cover). */
export function coverInRect(img: FabricImage, rect: { x: number; y: number; width: number; height: number }) {
  const scale = Math.max(rect.width / img.width, rect.height / img.height);
  img.set({
    originX: "center",
    originY: "center",
    left: rect.x + rect.width / 2,
    top: rect.y + rect.height / 2,
    scaleX: scale,
    scaleY: scale,
    angle: 0,
  });
  img.setCoords();
}

/** Scale and center `img` to fit inside the rect (object-fit: contain). */
export function containInRect(img: FabricImage, rect: { x: number; y: number; width: number; height: number }, ratio = 1) {
  const scale = Math.min(rect.width / img.width, rect.height / img.height) * ratio;
  img.set({
    originX: "center",
    originY: "center",
    left: rect.x + rect.width / 2,
    top: rect.y + rect.height / 2,
    scaleX: scale,
    scaleY: scale,
  });
  img.setCoords();
}

export function slotClip(rect: { x: number; y: number; width: number; height: number }) {
  return new Rect({
    left: rect.x,
    top: rect.y,
    width: rect.width,
    height: rect.height,
    originX: "left",
    originY: "top",
    absolutePositioned: true,
  });
}

export function lockAsBase(o: FabricObject, opts: { movable?: boolean } = {}) {
  const movable = opts.movable ?? false;
  o.set({
    selectable: movable,
    evented: movable,
    hasControls: movable,
    lockMovementX: !movable,
    lockMovementY: !movable,
    lockRotation: true,
    lockScalingX: !movable,
    lockScalingY: !movable,
    hoverCursor: movable ? "grab" : "default",
  });
}

export interface FilterPreset {
  id: string;
  label: string;
  /** Swatch used on the preset button. */
  swatch: string;
  build: () => filters.BaseFilter<string, Record<string, unknown>>[];
}

export const FILTER_PRESETS: FilterPreset[] = [
  { id: "normal", label: "Normal", swatch: "linear-gradient(135deg,#f5efe0,#b0a9cf)", build: () => [] },
  {
    id: "arcade",
    label: "Arcade",
    swatch: "linear-gradient(135deg,#ffd23f,#ff3d7f)",
    build: () => [new filters.Saturation({ saturation: 0.35 }), new filters.Contrast({ contrast: 0.15 })],
  },
  {
    id: "gameboy",
    label: "Game Boy",
    swatch: "linear-gradient(135deg,#9bbc0f,#306230)",
    build: () => [
      new filters.Grayscale(),
      new filters.Brightness({ brightness: 0.12 }),
      new filters.Contrast({ contrast: 0.2 }),
      new filters.BlendColor({ color: "#b8d84a", mode: "multiply", alpha: 1 }),
      new filters.Pixelate({ blocksize: 3 }),
    ],
  },
  {
    id: "crt",
    label: "CRT",
    swatch: "linear-gradient(135deg,#3ef0ff,#1c1740)",
    build: () => [
      new filters.Saturation({ saturation: 0.2 }),
      new filters.BlendColor({ color: "#3ef0ff", mode: "tint", alpha: 0.12 }),
      new filters.Noise({ noise: 45 }),
    ],
  },
  {
    id: "vapor",
    label: "Vapor",
    swatch: "linear-gradient(135deg,#ff3d7f,#7b5cff)",
    build: () => [
      new filters.HueRotation({ rotation: -0.12 }),
      new filters.BlendColor({ color: "#ff3d7f", mode: "screen", alpha: 0.18 }),
      new filters.Saturation({ saturation: 0.25 }),
    ],
  },
  {
    id: "mono",
    label: "Mono",
    swatch: "linear-gradient(135deg,#f5efe0,#111)",
    build: () => [new filters.Grayscale(), new filters.Contrast({ contrast: 0.2 })],
  },
  { id: "sepia", label: "Sepia", swatch: "linear-gradient(135deg,#e8c48f,#704214)", build: () => [new filters.Sepia()] },
  {
    id: "vintage",
    label: "Vintage",
    swatch: "linear-gradient(135deg,#d9b38c,#5b3a29)",
    build: () => [new filters.Vintage(), new filters.Noise({ noise: 25 })],
  },
  { id: "polaroid", label: "Polaroid", swatch: "linear-gradient(135deg,#fff3c4,#3d7ea6)", build: () => [new filters.Polaroid()] },
  { id: "kodachrome", label: "Kodachrome", swatch: "linear-gradient(135deg,#ffb347,#c0392b)", build: () => [new filters.Kodachrome()] },
];

/** Rebuilds the filter stack from a preset plus manual sliders. Values are -100..100 or 0..100. */
export function applyAdjust(img: FabricImage, adjust: PhotoAdjust) {
  const preset = FILTER_PRESETS.find((p) => p.id === adjust.preset) ?? FILTER_PRESETS[0];
  const stack = preset.build();
  if (adjust.brightness) stack.push(new filters.Brightness({ brightness: adjust.brightness / 100 }));
  if (adjust.contrast) stack.push(new filters.Contrast({ contrast: adjust.contrast / 100 }));
  if (adjust.saturation) stack.push(new filters.Saturation({ saturation: adjust.saturation / 100 }));
  if (adjust.hue) stack.push(new filters.HueRotation({ rotation: adjust.hue / 100 }));
  if (adjust.blur) stack.push(new filters.Blur({ blur: adjust.blur / 100 }));
  if (adjust.noise) stack.push(new filters.Noise({ noise: adjust.noise * 3 }));
  if (adjust.pixelate) stack.push(new filters.Pixelate({ blocksize: Math.max(2, Math.round(adjust.pixelate / 4)) }));
  img.filters = stack;
  (img as PboxObject).pboxAdjust = { ...adjust };
  img.applyFilters();
}

export function photosOf(canvas: Canvas) {
  return canvas.getObjects().filter((o) => roleOf(o) === "photo" || roleOf(o) === "background") as FabricImage[];
}

/** Ensure fonts are ready before fabric measures text, otherwise glyph boxes are wrong. */
export async function ensureFont(family: string) {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await document.fonts.load(`32px "${family}"`);
  } catch {
    // Fallback font renders instead; not fatal.
  }
}

export type EditorMode = "frame" | "sticker" | "formal";

export interface FrameSlot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FrameData {
  id: string;
  name: string;
  imageUrl: string;
  positions: FrameSlot[];
}

export interface FormalSize {
  id: string;
  name: string;
  width: number;
  height: number;
  dpi: number;
}

export interface FormalData {
  id: string;
  name: string;
  backgroundUrl: string;
  sizes: FormalSize[];
}

export interface StickerItem {
  id: string;
  stickerName: string;
  imageUrl: string;
}

/** Role tag stored on every canvas object; drives locking, layer icons, and filters. */
export type LayerRole = "photo" | "frame" | "background" | "sticker" | "text" | "drawing" | "shape";

export interface PhotoAdjust {
  preset: string;
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  noise: number;
  pixelate: number;
}

export const DEFAULT_ADJUST: PhotoAdjust = {
  preset: "normal",
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  blur: 0,
  noise: 0,
  pixelate: 0,
};

export type ToolId = "select" | "adjust" | "sticker" | "text" | "draw" | "canvas" | "layers";

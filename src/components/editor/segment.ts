import type { ImageSegmenter } from "@mediapipe/tasks-vision";

let segmenterPromise: Promise<ImageSegmenter> | null = null;

/** Lazily loads MediaPipe selfie segmentation from self-hosted files (works offline in booth mode). */
function getSegmenter() {
  segmenterPromise ??= (async () => {
    const { FilesetResolver, ImageSegmenter } = await import("@mediapipe/tasks-vision");
    const fileset = await FilesetResolver.forVisionTasks("/vendor/mediapipe");
    return ImageSegmenter.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: "/models/selfie_segmenter.tflite", delegate: "GPU" },
      runningMode: "IMAGE",
      outputCategoryMask: false,
      outputConfidenceMasks: true,
    });
  })().catch((err) => {
    segmenterPromise = null;
    throw err;
  });
  return segmenterPromise;
}

const loadImg = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Gambar gagal dimuat"));
    img.src = src;
  });

/**
 * Returns a PNG object URL of the person with the background made transparent.
 * Edges are feathered between `low` and `high` confidence to avoid a hard cut-out look.
 */
export async function removeBackground(src: string, low = 0.35, high = 0.75): Promise<string> {
  const [segmenter, img] = await Promise.all([getSegmenter(), loadImg(src)]);
  const result = segmenter.segment(img);
  const mask = result.confidenceMasks?.[0];
  if (!mask) throw new Error("Segmentasi tidak menghasilkan mask");

  const values = mask.getAsFloat32Array();
  const mw = mask.width;
  const mh = mask.height;

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D tidak tersedia");
  ctx.drawImage(img, 0, 0);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Bilinear sampling keeps the upscaled low-res mask from producing blocky edges.
  const sx = mw / canvas.width;
  const sy = mh / canvas.height;
  for (let y = 0; y < canvas.height; y++) {
    const fy = Math.max(0, Math.min(mh - 1, (y + 0.5) * sy - 0.5));
    const y0 = Math.floor(fy);
    const y1 = Math.min(mh - 1, y0 + 1);
    const ty = fy - y0;
    for (let x = 0; x < canvas.width; x++) {
      const fx = Math.max(0, Math.min(mw - 1, (x + 0.5) * sx - 0.5));
      const x0 = Math.floor(fx);
      const x1 = Math.min(mw - 1, x0 + 1);
      const tx = fx - x0;
      const top = values[y0 * mw + x0] * (1 - tx) + values[y0 * mw + x1] * tx;
      const bottom = values[y1 * mw + x0] * (1 - tx) + values[y1 * mw + x1] * tx;
      const c = top * (1 - ty) + bottom * ty;
      const a = c <= low ? 0 : c >= high ? 1 : (c - low) / (high - low);
      const i = (y * canvas.width + x) * 4 + 3;
      pixels.data[i] = Math.round(pixels.data[i] * a);
    }
  }
  ctx.putImageData(pixels, 0, 0);
  mask.close();
  result.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Gagal membuat PNG");
  return URL.createObjectURL(blob);
}

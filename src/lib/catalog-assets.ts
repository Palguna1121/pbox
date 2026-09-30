const frameNames = new Set([
  "Frame Kotak Emas", "Frame Bunga Klasik", "Frame Art Deco", "Frame Victorian",
  "Frame Polaroid Retro", "Frame Film 90an", "Frame Kodak Classic", "Frame Instax Vibes",
  "Frame Minimalis", "Frame Neon Lines", "Frame Geometric Bold", "Frame Tokyo Street",
  "Frame Pastel Bloom", "Frame Sunset Dream", "Frame Night Sky", "Frame Garden Party",
  "Frame Kawaii Stars", "Frame Panda Party", "Frame Rainbow Pop", "Frame Doodle Fun",
]);

const stickerNames = new Set([
  "Crown Gold", "Ribbon Red", "Bow Tie Classic", "Diamond Crystal",
  "Film Strip", "Camera Vintage", "Record Vinyl", "Polaroid Strip",
  "Star Neon", "Lightning Bolt", "Arrow Bold", "Pixel Dot",
  "Flower Pink", "Butterfly", "Heart Pastel", "Star Glitter",
  "Kawaii Cat", "Dino Baby", "Ice Cream", "Rainbow Pop",
]);

const formalNames = new Set([
  "Background Putih", "Background Biru Muda", "Background Biru Tua",
  "Background Abu-Abu", "Background Merah Marun",
]);

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function resolveAsset(name: string, url: string, names: Set<string>, folder: string) {
  if (names.has(name) && url.startsWith("https://placehold.co/")) {
    return `/images/${folder}/${slug(name)}.png`;
  }
  return url;
}

export const resolveFrameImage = (name: string, url: string) => resolveAsset(name, url, frameNames, "frames");
export const resolveStickerImage = (name: string, url: string) => resolveAsset(name, url, stickerNames, "stickers");
export const resolveFormalBackground = (name: string, url: string) => resolveAsset(name, url, formalNames, "formal");

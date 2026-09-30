import { mkdirSync, writeFileSync } from "node:fs";

const sourceDir = "assets/source/frames";
const webDir = "public/images/frames";
mkdirSync(sourceDir, { recursive: true });
mkdirSync(webDir, { recursive: true });

const frames = [
  ["Frame Kotak Emas", 1, "#211B27", "#E5BF67", "diamonds"],
  ["Frame Bunga Klasik", 2, "#3A2425", "#EAC9AA", "flowers"],
  ["Frame Art Deco", 4, "#141820", "#D7AE59", "deco"],
  ["Frame Victorian", 2, "#30243C", "#D9B886", "leaves"],
  ["Frame Polaroid Retro", 1, "#F3E9D8", "#96795D", "paper"],
  ["Frame Film 90an", 4, "#342B29", "#D8B38B", "film"],
  ["Frame Kodak Classic", 2, "#F6C445", "#4B2D26", "stripes"],
  ["Frame Instax Vibes", 1, "#F9F5E9", "#729A91", "dots"],
  ["Frame Minimalis", 1, "#F4F0EB", "#C94558", "minimal"],
  ["Frame Neon Lines", 2, "#19212B", "#66DACB", "neon"],
  ["Frame Geometric Bold", 4, "#272B45", "#ED6473", "geometric"],
  ["Frame Tokyo Street", 2, "#B7354F", "#FFE5CA", "street"],
  ["Frame Pastel Bloom", 1, "#F5DAE2", "#BD667B", "flowers"],
  ["Frame Sunset Dream", 2, "#E98566", "#FFE2AE", "sunset"],
  ["Frame Night Sky", 4, "#17213B", "#E6C983", "stars"],
  ["Frame Garden Party", 2, "#547862", "#E4E6B8", "leaves"],
  ["Frame Kawaii Stars", 1, "#F3B4C5", "#FFEFBB", "stars"],
  ["Frame Panda Party", 2, "#E7E3DC", "#31333B", "panda"],
  ["Frame Rainbow Pop", 4, "#E65D79", "#FFE4A9", "rainbow"],
  ["Frame Doodle Fun", 2, "#F6DFAF", "#AD5360", "doodle"],
];

const slotsByCount = {
  1: [[24, 24, 432, 592]],
  2: [[20, 50, 215, 540], [245, 50, 215, 540]],
  4: [[20, 30, 210, 280], [250, 30, 210, 280], [20, 330, 210, 280], [250, 330, 210, 280]],
};

const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const rectPath = (x, y, w, h) => `M${x} ${y}h${w}v${h}h-${w}z`;

function motif(type, color, slots) {
  const parts = [];
  for (let y = 12; y < 640; y += 36) {
    for (let x = 12; x < 480; x += 36) {
      const odd = (Math.floor(x / 36) + Math.floor(y / 36)) % 2;
      const dx = odd ? 8 : 0;
      const px = x + dx;
      if (slots.some(([sx, sy, sw, sh]) => px + 10 > sx && px - 10 < sx + sw && y + 10 > sy && y - 10 < sy + sh)) continue;
      if (type === "minimal") continue;
      if (["dots", "paper", "panda"].includes(type)) {
        parts.push(`<circle cx="${px}" cy="${y}" r="${type === "panda" ? 5 : 2.2}" fill="${color}" opacity=".55"/>`);
        if (type === "panda") parts.push(`<circle cx="${px - 2}" cy="${y - 1}" r=".7" fill="#fff"/><circle cx="${px + 2}" cy="${y - 1}" r=".7" fill="#fff"/>`);
      } else if (["stars", "deco", "neon"].includes(type)) {
        parts.push(`<path d="M${px} ${y - 6}L${px + 1.8} ${y - 1.8}L${px + 6} ${y}L${px + 1.8} ${y + 1.8}L${px} ${y + 6}L${px - 1.8} ${y + 1.8}L${px - 6} ${y}L${px - 1.8} ${y - 1.8}Z" fill="${color}" opacity=".75"/>`);
      } else if (["flowers", "leaves", "doodle"].includes(type)) {
        parts.push(`<path d="M${px} ${y - 7}Q${px + 5} ${y - 5} ${px + 4} ${y}Q${px + 9} ${y + 3} ${px + 3} ${y + 5}Q${px} ${y + 9} ${px - 3} ${y + 5}Q${px - 9} ${y + 3} ${px - 4} ${y}Q${px - 5} ${y - 5} ${px} ${y - 7}Z" fill="none" stroke="${color}" stroke-width="1.7" opacity=".75"/><circle cx="${px}" cy="${y}" r="1.5" fill="${color}"/>`);
      } else if (["film", "geometric", "diamonds"].includes(type)) {
        parts.push(`<path d="M${px} ${y - 7}l7 7-7 7-7-7z" fill="none" stroke="${color}" stroke-width="2" opacity=".65"/>`);
      } else if (["stripes", "street", "sunset", "rainbow"].includes(type)) {
        parts.push(`<path d="M${px - 9} ${y + 7}l18-18" stroke="${color}" stroke-width="3" stroke-linecap="round" opacity=".6"/>`);
      }
    }
  }
  return parts.join("");
}

for (const [name, count, base, accent, style] of frames) {
  const slots = slotsByCount[count];
  const shape = [rectPath(0, 0, 480, 640), ...slots.map((s) => rectPath(...s))].join(" ");
  const holeOutlines = slots.map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="none" stroke="${accent}" stroke-width="2" opacity=".82"/>`).join("");
  const cornerMarks = [[10, 10], [470, 10], [10, 630], [470, 630]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${accent}" opacity=".8"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="640" viewBox="0 0 480 640">
  <defs>
    <linearGradient id="surface" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${base}"/><stop offset=".52" stop-color="${base}"/><stop offset="1" stop-color="${accent}" stop-opacity=".72"/></linearGradient>
  </defs>
  <path fill="url(#surface)" fill-rule="evenodd" d="${shape}"/>
  <g>${motif(style, accent, slots)}
    <rect x="5" y="5" width="470" height="630" rx="8" fill="none" stroke="${accent}" stroke-width="3" opacity=".8"/>
    <rect x="11" y="11" width="458" height="618" rx="5" fill="none" stroke="${accent}" stroke-width="1" opacity=".55"/>
  </g>
  ${holeOutlines}${cornerMarks}
</svg>`;
  const file = slug(name);
  writeFileSync(`${sourceDir}/${file}.svg`, svg);
}

console.log(`Generated ${frames.length} frame SVG sources. Render them as PNG for the web directory.`);

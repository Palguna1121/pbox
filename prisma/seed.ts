import { PrismaClient } from "@prisma/client";
import { hash } from "../src/lib/bcrypt";

const prisma = new PrismaClient();
const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── Admin ───────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@gmail.com",
      password: await hash("password"),
      role: "admin",
      emailVerified: new Date(),
    },
  });

  // ── Users ───────────────────────────────────────────────────
  const pwd = await hash("password123");
  for (const u of [
    { name: "Budi Santoso", email: "budi@example.com" },
    { name: "Siti Rahayu", email: "siti@example.com" },
    { name: "Andi Wijaya", email: "andi@example.com" },
    { name: "Dewi Kusuma", email: "dewi@example.com" },
    { name: "Reza Pratama", email: "reza@example.com" },
  ]) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: pwd, role: "user", emailVerified: new Date() },
    });
  }
  console.log("✅ Users: admin@gmail.com/password  |  *@example.com/password123");

  // ── Categories ──────────────────────────────────────────────
  const catNames = ["Klasik", "Vintage", "Modern", "Estetik", "Lucu"];
  const catDesc: Record<string, string> = {
    Klasik: "Frame gaya klasik yang timeless dan elegan",
    Vintage: "Nuansa retro dan nostalgia dari era foto film",
    Modern: "Desain minimalis dan bold untuk gaya kekinian",
    Estetik: "Frame aesthetic cocok untuk konten media sosial",
    Lucu: "Frame playful dan colorful untuk semua usia",
  };
  const cats: Record<string, string> = {};
  for (const name of catNames) {
    const c = await prisma.category.upsert({
      where: { name },
      update: { description: catDesc[name] },
      create: { name, description: catDesc[name] },
    });
    cats[name] = c.id;
  }
  console.log("✅ Categories: 5 kategori");

  // ── Frames ──────────────────────────────────────────────────
  const frames = [
    // Klasik (4)
    { name: "Frame Kotak Emas", cat: "Klasik", slots: 1 },
    { name: "Frame Bunga Klasik", cat: "Klasik", slots: 2 },
    { name: "Frame Art Deco", cat: "Klasik", slots: 4 },
    { name: "Frame Victorian", cat: "Klasik", slots: 2 },
    // Vintage (4)
    { name: "Frame Polaroid Retro", cat: "Vintage", slots: 1 },
    { name: "Frame Film 90an", cat: "Vintage", slots: 4 },
    { name: "Frame Kodak Classic", cat: "Vintage", slots: 2 },
    { name: "Frame Instax Vibes", cat: "Vintage", slots: 1 },
    // Modern (4)
    { name: "Frame Minimalis", cat: "Modern", slots: 1 },
    { name: "Frame Neon Lines", cat: "Modern", slots: 2 },
    { name: "Frame Geometric Bold", cat: "Modern", slots: 4 },
    { name: "Frame Tokyo Street", cat: "Modern", slots: 2 },
    // Estetik (4)
    { name: "Frame Pastel Bloom", cat: "Estetik", slots: 1 },
    { name: "Frame Sunset Dream", cat: "Estetik", slots: 2 },
    { name: "Frame Night Sky", cat: "Estetik", slots: 4 },
    { name: "Frame Garden Party", cat: "Estetik", slots: 2 },
    // Lucu (4)
    { name: "Frame Kawaii Stars", cat: "Lucu", slots: 1 },
    { name: "Frame Panda Party", cat: "Lucu", slots: 2 },
    { name: "Frame Rainbow Pop", cat: "Lucu", slots: 4 },
    { name: "Frame Doodle Fun", cat: "Lucu", slots: 2 },
  ];

  const phMap: Record<number, { x: number; y: number; w: number; h: number }[]> = {
    1: [{ x: 24, y: 24, w: 432, h: 592 }],
    2: [
      { x: 20, y: 50, w: 215, h: 540 },
      { x: 245, y: 50, w: 215, h: 540 },
    ],
    4: [
      { x: 20, y: 30, w: 210, h: 280 },
      { x: 250, y: 30, w: 210, h: 280 },
      { x: 20, y: 330, w: 210, h: 280 },
      { x: 250, y: 330, w: 210, h: 280 },
    ],
  };

  let frameCount = 0;
  for (const f of frames) {
    const exists = await prisma.frameCatalog.findFirst({ where: { frameName: f.name } });
    if (!exists) {
      const created = await prisma.frameCatalog.create({
        data: { frameName: f.name, categoryId: cats[f.cat], imageUrl: `/images/frames/${slug(f.name)}.png` },
      });
      for (const ph of phMap[f.slots]) {
        await prisma.framePlaceholder.create({
          data: { frameId: created.id, xPosition: ph.x, yPosition: ph.y, width: ph.w, height: ph.h },
        });
      }
      frameCount++;
    }
  }
  console.log(`✅ Frames: ${frameCount} frame baru (total ${frames.length})`);

  // ── Stickers ────────────────────────────────────────────────
  const stickers = [
    // Klasik
    { name: "Crown Gold", cat: "Klasik" },
    { name: "Ribbon Red", cat: "Klasik" },
    { name: "Bow Tie Classic", cat: "Klasik" },
    { name: "Diamond Crystal", cat: "Klasik" },
    // Vintage
    { name: "Film Strip", cat: "Vintage" },
    { name: "Camera Vintage", cat: "Vintage" },
    { name: "Record Vinyl", cat: "Vintage" },
    { name: "Polaroid Strip", cat: "Vintage" },
    // Modern
    { name: "Star Neon", cat: "Modern" },
    { name: "Lightning Bolt", cat: "Modern" },
    { name: "Arrow Bold", cat: "Modern" },
    { name: "Pixel Dot", cat: "Modern" },
    // Estetik
    { name: "Flower Pink", cat: "Estetik" },
    { name: "Butterfly", cat: "Estetik" },
    { name: "Heart Pastel", cat: "Estetik" },
    { name: "Star Glitter", cat: "Estetik" },
    // Lucu
    { name: "Kawaii Cat", cat: "Lucu" },
    { name: "Dino Baby", cat: "Lucu" },
    { name: "Ice Cream", cat: "Lucu" },
    { name: "Rainbow Pop", cat: "Lucu" },
  ];

  let stickerCount = 0;
  for (const s of stickers) {
    const exists = await prisma.stickerCatalog.findFirst({ where: { stickerName: s.name } });
    if (!exists) {
      await prisma.stickerCatalog.create({
        data: { stickerName: s.name, categoryId: cats[s.cat], imageUrl: `/images/stickers/${slug(s.name)}.png` },
      });
      stickerCount++;
    }
  }
  console.log(`✅ Stickers: ${stickerCount} sticker baru (total ${stickers.length})`);

  // ── Formal Pictures ─────────────────────────────────────────
  const formals = [
    {
      name: "Background Putih",
      backgroundUrl: "/images/formal/background-putih.png",
    },
    {
      name: "Background Biru Muda",
      backgroundUrl: "/images/formal/background-biru-muda.png",
    },
    {
      name: "Background Biru Tua",
      backgroundUrl: "/images/formal/background-biru-tua.png",
    },
    {
      name: "Background Abu-Abu",
      backgroundUrl: "/images/formal/background-abu-abu.png",
    },
    {
      name: "Background Merah Marun",
      backgroundUrl: "/images/formal/background-merah-marun.png",
    },
  ];

  const sizes = [
    { id: "2x3", name: "2x3 cm", width: 240, height: 360, dpi: 300 },
    { id: "3x4", name: "3x4 cm", width: 360, height: 480, dpi: 300 },
    { id: "4x6", name: "4x6 cm", width: 480, height: 720, dpi: 300 },
    { id: "passport", name: "Passport (3.5x4.5 cm)", width: 420, height: 540, dpi: 300 },
  ];

  let formalCount = 0;
  for (const fp of formals) {
    const exists = await prisma.formalPicture.findFirst({ where: { name: fp.name } });
    if (!exists) {
      await prisma.formalPicture.create({ data: { ...fp, sizes } });
      formalCount++;
    }
  }
  console.log(`✅ Formal: ${formalCount} background baru (total ${formals.length})`);

  console.log("\n🎉 Seed selesai!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Admin  : admin@gmail.com / password");
  console.log("  Users  : *@example.com  / password123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

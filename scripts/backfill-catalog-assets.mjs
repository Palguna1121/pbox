import { existsSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const definitions = [
  { model: "frameCatalog", name: "frameName", url: "imageUrl", folder: "frames" },
  { model: "stickerCatalog", name: "stickerName", url: "imageUrl", folder: "stickers" },
  { model: "formalPicture", name: "name", url: "backgroundUrl", folder: "formal" },
];

try {
  const updates = [];
  for (const definition of definitions) {
    const rows = await prisma[definition.model].findMany({
      where: { [definition.url]: { startsWith: "https://placehold.co/" } },
      select: { id: true, [definition.name]: true, [definition.url]: true },
    });
    for (const row of rows) {
      const file = `${slug(row[definition.name])}.png`;
      const localUrl = `/images/${definition.folder}/${file}`;
      if (!existsSync(`public${localUrl}`)) {
        throw new Error(`Aset lokal tidak ada untuk ${definition.model}: ${row[definition.name]}`);
      }
      updates.push({ definition, id: row.id, oldUrl: row[definition.url], localUrl });
    }
  }

  await prisma.$transaction(updates.map(({ definition, id, oldUrl, localUrl }) =>
    prisma[definition.model].updateMany({
      where: { id, [definition.url]: oldUrl },
      data: { [definition.url]: localUrl },
    })
  ));

  for (const definition of definitions) {
    console.log(`${definition.model}: ${updates.filter((update) => update.definition === definition).length} URL placeholder diperbarui`);
  }
} finally {
  await prisma.$disconnect();
}

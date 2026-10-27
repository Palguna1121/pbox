import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { resolveFrameImage } from "@/lib/catalog-assets";
import { PageIntro } from "@/components/arcade/PageIntro";
import { CartridgeCard } from "@/components/pages/catalog/CartridgeCard";
import { ArcadeEmpty, CatalogModeNav, ScoreReadout } from "@/components/pages/catalog/CatalogHud";

export const metadata: Metadata = {
  title: "Katalog Frame Photobox",
  description:
    "Pilih frame untuk sesi photobox di browser. Setiap frame punya 1, 2, atau 4 slot foto yang langsung terisi dari kamera.",
  alternates: { canonical: "/photobox" },
  openGraph: {
    title: "Katalog Frame Photobox | PBOX",
    description: "Pilih frame, ambil foto dari kamera, lalu unduh atau bagikan hasilnya.",
    url: "/photobox",
  },
};

async function getFrames() {
  return prisma.frameCatalog.findMany({
    include: { category: true, _count: { select: { FramePlaceholders: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export default async function PhotoboxPage() {
  const frames = await getFrames();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <CatalogModeNav current="frame" />
      <PageIntro
        label="Select frame"
        title="Pilih frame untuk sesi fotomu"
        description="Buka frame untuk melihat jumlah slotnya. Foto contoh di balik frame hanya pratinjau; di sesi nanti slot terisi foto dari kameramu."
        actions={<ScoreReadout label="Frame" value={frames.length} />}
        className="mb-10"
      />

      {frames.length === 0 ? (
        <ArcadeEmpty
          title="Belum ada frame"
          description="Katalog frame masih kosong. Admin bisa menambahkan frame dari panel admin, atau coba mode stiker dan formal dulu."
        />
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {frames.map((frame, i) => (
            <li key={frame.id}>
              <CartridgeCard
                href={`/photobox/${frame.id}`}
                imageSrc={resolveFrameImage(frame.frameName, frame.imageUrl)}
                imageAlt={`Pratinjau ${frame.frameName}`}
                title={frame.frameName}
                slot={i + 1}
                tag={frame.category?.name || "Umum"}
                cta="Lihat frame"
                meta={
                  frame._count.FramePlaceholders > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-mono text-xl leading-none text-foreground">
                        {frame._count.FramePlaceholders}
                      </span>{" "}
                      slot foto
                    </p>
                  ) : null
                }
                mediaClassName="frame-preview aspect-3/4"
                imageClassName="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={i < 4}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

// Catalog changes made in admin appear within a minute without a rebuild.
export const revalidate = 60;

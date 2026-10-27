import type { Metadata } from "next";
import Link from "next/link";
import { Camera } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { resolveStickerImage } from "@/lib/catalog-assets";
import { PageIntro } from "@/components/arcade/PageIntro";
import { Button } from "@/components/ui/button";
import { CartridgeCard } from "@/components/pages/catalog/CartridgeCard";
import { ArcadeEmpty, CatalogModeNav, ScoreReadout } from "@/components/pages/catalog/CatalogHud";

export const metadata: Metadata = {
  title: "Katalog Stiker Foto",
  description:
    "Lihat stiker yang bisa ditempel ke fotomu di editor PBOX. Ambil foto dari kamera, lalu geser dan ubah ukuran stiker sesukamu.",
  alternates: { canonical: "/sticker-pic" },
  openGraph: {
    title: "Katalog Stiker Foto | PBOX",
    description: "Ambil foto dari kamera, lalu tempel stiker di editor PBOX.",
    url: "/sticker-pic",
  },
};

async function getStickers() {
  return prisma.stickerCatalog.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function StickerCatalogPage() {
  const stickers = await getStickers();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <CatalogModeNav current="sticker" />
      <PageIntro
        label="Sticker mode"
        title="Tempel stiker di fotomu"
        description="Semua stiker di bawah tersedia di editor. Kamu tidak perlu memilih sekarang: ambil foto dulu, lalu tempel sebanyak yang kamu mau."
        actions={
          <>
            <ScoreReadout label="Stiker" value={stickers.length} />
            <Button asChild size="lg" className="self-end">
              <Link href="/camera?type=sticker">
                <Camera aria-hidden="true" />
                Mulai foto
              </Link>
            </Button>
          </>
        }
        className="mb-10"
      />

      {stickers.length === 0 ? (
        <ArcadeEmpty
          title="Belum ada stiker"
          description="Katalog stiker masih kosong. Kamu tetap bisa mengambil foto, atau coba mode frame dulu."
          action={
            <Button asChild variant="outline">
              <Link href="/photobox">Lihat frame</Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {stickers.map((sticker, i) => (
            <li key={sticker.id}>
              <CartridgeCard
                href={`/sticker-pic/${sticker.id}`}
                imageSrc={resolveStickerImage(sticker.stickerName, sticker.imageUrl)}
                imageAlt={`Stiker ${sticker.stickerName}`}
                title={sticker.stickerName}
                slot={i + 1}
                tag={sticker.category?.name || "Umum"}
                cta="Lihat stiker"
                mediaClassName="aspect-square bg-arcade-grid"
                imageClassName="object-contain p-4"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                priority={i < 5}
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

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { resolveFormalBackground } from "@/lib/catalog-assets";
import { PageIntro } from "@/components/arcade/PageIntro";
import { CartridgeCard } from "@/components/pages/catalog/CartridgeCard";
import { ArcadeEmpty, CatalogModeNav, ScoreReadout } from "@/components/pages/catalog/CatalogHud";

export const metadata: Metadata = {
  title: "Pas Foto Online dengan Latar Formal",
  description:
    "Pilih warna latar untuk pas foto, ambil foto dari kamera, atur posisi, lalu unduh sesuai ukuran cetak yang kamu butuhkan.",
  alternates: { canonical: "/formal-pic" },
  openGraph: {
    title: "Pas Foto Online dengan Latar Formal | PBOX",
    description: "Pilih latar, ambil foto dari kamera, lalu unduh pas foto sesuai ukuran.",
    url: "/formal-pic",
  },
};

async function getFormalPictures() {
  return prisma.formalPicture.findMany({ orderBy: { createdAt: "desc" } });
}

/** `sizes` is stored as JSON; read only the names that are really there. */
function sizeNames(sizes: unknown): string[] {
  if (!Array.isArray(sizes)) return [];
  return sizes
    .map((s) => (s && typeof s === "object" && "name" in s ? (s as { name: unknown }).name : null))
    .filter((name): name is string => typeof name === "string" && name.length > 0);
}

export default async function FormalPicPage() {
  const formals = await getFormalPictures();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <CatalogModeNav current="formal" />
      <PageIntro
        label="Formal mode"
        title="Pilih latar pas foto"
        description="Pilih warna latar yang diminta dokumenmu. Kamera langsung terbuka dengan latar itu, lalu kamu bisa mengatur posisi dan ukuran cetak di editor."
        actions={<ScoreReadout label="Latar" value={formals.length} />}
        className="mb-10"
      />

      {formals.length === 0 ? (
        <ArcadeEmpty
          title="Belum ada latar"
          description="Latar pas foto belum ditambahkan. Coba mode frame atau stiker sementara ini."
        />
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {formals.map((bg, i) => {
            const sizes = sizeNames(bg.sizes);
            return (
              <li key={bg.id}>
                <CartridgeCard
                  href={`/camera?type=formal&formalId=${encodeURIComponent(bg.id)}`}
                  imageSrc={resolveFormalBackground(bg.name, bg.backgroundUrl)}
                  imageAlt={`Contoh warna ${bg.name}`}
                  title={bg.name.replace(/^Background\s+/i, "Latar ")}
                  slot={i + 1}
                  cta="Pakai latar ini"
                  meta={
                    sizes.length > 0 ? (
                      <p className="text-xs leading-relaxed text-muted-foreground">{sizes.join(" · ")}</p>
                    ) : null
                  }
                  mediaClassName="aspect-3/4"
                  imageClassName="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  priority={i < 5}
                />
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

// Catalog changes made in admin appear within a minute without a rebuild.
export const revalidate = 60;

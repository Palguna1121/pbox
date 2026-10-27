import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Camera } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { resolveStickerImage } from "@/lib/catalog-assets";
import { PixelLabel } from "@/components/arcade/PageIntro";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ id: string }> };

const getSticker = cache(async (id: string) =>
  prisma.stickerCatalog.findUnique({
    where: { id },
    include: { category: true },
  }),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const sticker = await getSticker(id);
  if (!sticker) return { title: "Stiker tidak ditemukan", robots: { index: false } };

  const description = `Stiker ${sticker.stickerName} kategori ${
    sticker.category?.name || "Umum"
  }. Tempel ke fotomu di editor PBOX setelah mengambil foto dari kamera.`;
  const image = resolveStickerImage(sticker.stickerName, sticker.imageUrl);

  return {
    title: `Stiker ${sticker.stickerName}`,
    description,
    alternates: { canonical: `/sticker-pic/${sticker.id}` },
    openGraph: {
      title: `Stiker ${sticker.stickerName} | PBOX`,
      description,
      url: `/sticker-pic/${sticker.id}`,
      images: [{ url: image, alt: `Stiker ${sticker.stickerName}` }],
    },
    twitter: { card: "summary", images: [image] },
  };
}

const dateFormat = new Intl.DateTimeFormat("id-ID", { year: "numeric", month: "long", day: "numeric" });

export default async function StickerDetailPage({ params }: Props) {
  const { id } = await params;
  const sticker = await getSticker(id);
  if (!sticker) notFound();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/sticker-pic"
        className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Kembali ke katalog stiker
      </Link>

      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        <div className="arcade-panel p-2 sm:p-3">
          <div className="bg-arcade-grid relative aspect-square w-full overflow-hidden rounded-sm border-2 border-border bg-muted">
            <Image
              src={resolveStickerImage(sticker.stickerName, sticker.imageUrl)}
              alt={`Stiker ${sticker.stickerName}`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-8 sm:p-12"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center gap-6">
          <div>
            <PixelLabel className="text-primary">{sticker.category?.name || "Umum"}</PixelLabel>
            <h1 className="font-display mt-3 text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl">
              {sticker.stickerName}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Ditambahkan {dateFormat.format(new Date(sticker.createdAt))}
            </p>
          </div>

          <p className="max-w-[52ch] leading-relaxed text-muted-foreground">
            Stiker ini ada di daftar stiker editor. Setelah foto diambil, pilih stiker lalu geser, putar, atau ubah
            ukurannya di atas foto.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/camera?type=sticker">
                <Camera aria-hidden="true" />
                Mulai foto
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/sticker-pic">Lihat stiker lain</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Camera } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { resolveFrameImage } from "@/lib/catalog-assets";
import { PixelLabel } from "@/components/arcade/PageIntro";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ id: string }> };

const getFrame = cache(async (id: string) =>
  prisma.frameCatalog.findUnique({
    where: { id },
    include: { category: true, FramePlaceholders: true },
  }),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const frame = await getFrame(id);
  if (!frame) return { title: "Frame tidak ditemukan", robots: { index: false } };

  const slots = frame.FramePlaceholders.length;
  const description = `Frame ${frame.frameName} kategori ${frame.category?.name || "Umum"}${
    slots ? ` dengan ${slots} slot foto` : ""
  }. Ambil foto dari kamera dan langsung pasang di frame ini.`;
  const image = resolveFrameImage(frame.frameName, frame.imageUrl);

  return {
    title: frame.frameName,
    description,
    alternates: { canonical: `/photobox/${frame.id}` },
    openGraph: {
      title: `${frame.frameName} | PBOX`,
      description,
      url: `/photobox/${frame.id}`,
      images: [{ url: image, alt: `Frame ${frame.frameName}` }],
    },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

const dateFormat = new Intl.DateTimeFormat("id-ID", { year: "numeric", month: "long", day: "numeric" });

export default async function FrameDetailPage({ params }: Props) {
  const { id } = await params;
  const frame = await getFrame(id);
  if (!frame) notFound();

  const slots = frame.FramePlaceholders.length;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/photobox"
        className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Kembali ke katalog frame
      </Link>

      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        <div className="arcade-panel p-2 sm:p-3">
          <div className="frame-preview relative aspect-3/4 w-full overflow-hidden rounded-sm border-2 border-border">
            <Image
              src={resolveFrameImage(frame.frameName, frame.imageUrl)}
              alt={`Frame ${frame.frameName} di atas foto contoh`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
            />
          </div>
          <p className="mt-2 px-1 text-xs text-muted-foreground">Foto di balik frame hanya contoh tampilan slot.</p>
        </div>

        <div className="flex flex-col justify-center gap-6">
          <div>
            <PixelLabel className="text-primary">{frame.category?.name || "Umum"}</PixelLabel>
            <h1 className="font-display mt-3 text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl">
              {frame.frameName}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Ditambahkan {dateFormat.format(new Date(frame.createdAt))}
            </p>
          </div>

          {slots > 0 && (
            <dl className="arcade-panel flex flex-row-reverse items-center justify-end gap-4 px-4 py-3">
              <dt className="flex flex-col gap-1.5">
                <PixelLabel className="text-muted-foreground">Slot foto</PixelLabel>
                <span className="text-sm text-muted-foreground">Area foto yang ada di frame ini.</span>
              </dt>
              <dd className="font-mono text-5xl leading-none text-primary">{slots}</dd>
            </dl>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={`/camera?type=frame&frameId=${encodeURIComponent(frame.id)}`}>
                <Camera aria-hidden="true" />
                Mulai foto
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/photobox">Ganti frame</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

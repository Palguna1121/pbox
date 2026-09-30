import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resolveStickerImage } from "@/lib/catalog-assets";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

async function getSticker(id: string) {
  return prisma.stickerCatalog.findUnique({
    where: { id },
    include: { category: true },
  });
}

export default async function StickerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sticker = await getSticker(id);
  if (!sticker) return notFound();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/sticker-pic"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Katalog Sticker
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="relative aspect-square w-full rounded-3xl overflow-hidden border border-border bg-muted">
          <Image
            src={resolveStickerImage(sticker.stickerName, sticker.imageUrl)}
            alt={sticker.stickerName}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain p-8"
          />
        </div>

        <div className="flex flex-col justify-center space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
              {sticker.category?.name || "Umum"}
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mt-4 leading-tight">
              {sticker.stickerName}
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              Diunggah {new Date(sticker.createdAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <Link
            href={`/camera?type=sticker`}
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold rounded-full px-8 py-4 text-sm hover:bg-primary/90 transition-colors w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4" />
            Mulai Foto
          </Link>
        </div>
      </div>
    </main>
  );
}

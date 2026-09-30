import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { resolveStickerImage } from "@/lib/catalog-assets";

async function getStickers() {
  return prisma.stickerCatalog.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function StickerCatalogPage() {
  const stickers = await getStickers();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-1">Katalog Sticker</p>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter">Pilih <span className="text-primary">Sticker</span>mu</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          {stickers.length} sticker tersedia — tambahkan ke fotomu dengan mudah.
        </p>
      </div>

      {stickers.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-5xl mb-4">✨</p>
          <p className="font-semibold">Belum ada sticker tersedia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {stickers.map((sticker) => (
            <Link key={sticker.id} href={`/sticker-pic/${sticker.id}`} className="group">
              <div className="bg-card rounded-3xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div className="relative aspect-square w-full bg-muted overflow-hidden">
                  <Image
                    src={resolveStickerImage(sticker.stickerName, sticker.imageUrl)}
                    alt={sticker.stickerName}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {sticker.category?.name || "Umum"}
                  </span>
                  <p className="font-bold text-sm mt-2 leading-tight">{sticker.stickerName}</p>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-xs text-muted-foreground">Pilih</span>
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

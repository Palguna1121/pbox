import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { resolveFrameImage } from "@/lib/catalog-assets";

async function getFrames() {
  return prisma.frameCatalog.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function PhotoboxPage() {
  const frames = await getFrames();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-1">Katalog Frame</p>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter">Pilih <span className="text-primary">Frame</span>mu</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          {frames.length} frame tersedia — dari klasik hingga modern.
        </p>
      </div>

      {frames.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-5xl mb-4">🖼️</p>
          <p className="font-semibold">Belum ada frame tersedia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {frames.map((frame) => (
            <Link key={frame.id} href={`/photobox/${frame.id}`} className="group">
              <div className="bg-card rounded-3xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div className="frame-preview relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={resolveFrameImage(frame.frameName, frame.imageUrl)}
                    alt={frame.frameName}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {frame.category?.name || "Umum"}
                  </span>
                  <p className="font-bold text-sm mt-2 leading-tight">{frame.frameName}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">Pilih frame</span>
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
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

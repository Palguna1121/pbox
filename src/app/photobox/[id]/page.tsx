import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resolveFrameImage } from "@/lib/catalog-assets";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Camera } from "lucide-react";

async function getFrame(id: string) {
  return prisma.frameCatalog.findUnique({
    where: { id },
    include: { category: true, FramePlaceholders: true },
  });
}

export default async function FrameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const frame = await getFrame(id);
  if (!frame) return notFound();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/photobox"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Katalog Frame
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="frame-preview relative aspect-[3/4] w-full rounded-3xl overflow-hidden border border-border">
          <Image
            src={resolveFrameImage(frame.frameName, frame.imageUrl)}
            alt={frame.frameName}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
          />
        </div>

        <div className="flex flex-col justify-center space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
              {frame.category?.name || "Umum"}
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mt-4 leading-tight">
              {frame.frameName}
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              Diunggah {new Date(frame.createdAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          {frame.FramePlaceholders.length > 0 && (
            <div className="bg-muted rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Slot Foto
              </p>
              <p className="text-2xl font-black">
                {frame.FramePlaceholders.length}
                <span className="text-base font-normal text-muted-foreground ml-2">foto</span>
              </p>
            </div>
          )}

          <Link
            href={`/camera?type=frame`}
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold rounded-full px-8 py-4 text-sm hover:bg-primary/90 transition-colors w-full sm:w-auto"
          >
            <Camera className="w-4 h-4" />
            Mulai Foto
          </Link>
        </div>
      </div>
    </main>
  );
}

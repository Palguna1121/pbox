import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { resolveFormalBackground } from "@/lib/catalog-assets";

async function getFormalPictures() {
  return prisma.formalPicture.findMany({ orderBy: { createdAt: "desc" } });
}

export default async function FormalPicPage() {
  const formals = await getFormalPictures();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-1">Foto Formal</p>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter">
          Pilih <span className="text-primary">Background</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          {formals.length} background tersedia — cocok untuk KTP, CV, dan dokumen resmi.
        </p>
      </div>

      {formals.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-5xl mb-4">🎞️</p>
          <p className="font-semibold">Belum ada background tersedia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {formals.map((bg) => (
            <Link key={bg.id} href={`/camera?type=formal`} className="group">
              <div className="bg-card rounded-3xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={resolveFormalBackground(bg.name, bg.backgroundUrl)}
                    alt={bg.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <p className="font-bold text-sm leading-tight">{bg.name}</p>
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

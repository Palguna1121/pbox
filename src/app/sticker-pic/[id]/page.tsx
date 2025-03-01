import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function getSticker(id: string) {
  return await prisma.stickerCatalog.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });
}

export default async function StickerDetail({ params }: { params: { id: string } }) {
  const param = await params;
  const sticker = await getSticker(param.id);

  if (!sticker) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/sticker-pic" className="flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Sticker
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square">
          <Image src={sticker.imageUrl} alt={sticker.stickerName} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" priority={true} className="object-contain rounded-lg border" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{sticker.stickerName}</h1>
          <div className="space-y-2">
            <p className="text-muted-foreground">Kategori: {sticker.category?.name || "Tanpa Kategori"}</p>
            <p className="text-muted-foreground">Tanggal Upload: {new Date(sticker.createdAt).toLocaleDateString("id-ID")}</p>
          </div>

          <Link href={`/camera?type=sticker&id=${sticker.id}`} className="inline-block">
            <Button size="lg" className="w-full md:w-auto">
              Gunakan Sticker Ini
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

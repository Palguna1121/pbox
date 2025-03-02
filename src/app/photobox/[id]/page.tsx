import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function getFrame(id: string) {
  return await prisma.frameCatalog.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });
}

export default async function FrameDetail({ params }: { params: { id: string } }) {
  const param = await params;
  const frame = await getFrame(param.id);

  if (!frame) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/photobox" className="flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Frame
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square">
          <Image src={frame.imageUrl} alt={frame.frameName} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" priority={true} className="object-contain rounded-lg border" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{frame.frameName}</h1>
          <div className="space-y-2">
            <p className="text-muted-foreground">Kategori: {frame.category?.name || "Tanpa Kategori"}</p>
            <p className="text-muted-foreground">Tanggal Upload: {new Date(frame.createdAt).toLocaleDateString("id-ID")}</p>
          </div>

          <Link href={`/camera?type=frame&id=${frame.id}`} className="inline-block">
            <Button size="lg" className="w-full md:w-auto">
              Gunakan Frame Ini
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

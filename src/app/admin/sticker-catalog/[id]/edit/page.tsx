import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import StickerForm from "../../_components/StickerForm";
import { resolveStickerImage } from "@/lib/catalog-assets";



interface EditStickerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditStickerPage({ params }: EditStickerPageProps) {
  const param = await params;
  const stickerCatalog = await prisma.stickerCatalog.findUnique({
    where: {
      id: param.id,
    },
    include: {
      category: true,
    },
  });

  if (!stickerCatalog) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-10 px-5 lg:px-0">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">Edit stiker</h1>
        <p className="text-muted-foreground">Perbarui data stiker</p>
      </div>

      <StickerForm initialData={{ ...stickerCatalog, imageUrl: resolveStickerImage(stickerCatalog.stickerName, stickerCatalog.imageUrl) }} isEditing />
    </div>
  );
}

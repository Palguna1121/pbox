import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import StickerForm from "../../_components/StickerForm";

const prisma = new PrismaClient();

interface EditStickerPageProps {
  params: {
    id: string;
  };
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
        <h1 className="text-2xl font-bold">Edit Sticker</h1>
        <p className="text-gray-500">Update sticker information</p>
      </div>

      <StickerForm initialData={stickerCatalog} isEditing />
    </div>
  );
}

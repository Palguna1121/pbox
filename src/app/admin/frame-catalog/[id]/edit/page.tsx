import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import FrameForm from "../../_components/FrameForm";
import { resolveFrameImage } from "@/lib/catalog-assets";



interface EditFramePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditFramePage({ params }: EditFramePageProps) {
  const param = await params;
  const frameCatalog = await prisma.frameCatalog.findUnique({
    where: {
      id: param.id,
    },
    include: {
      category: true,
    },
  });

  if (!frameCatalog) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-10 px-5 lg:px-0">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">Edit frame</h1>
        <p className="text-muted-foreground">Perbarui data frame</p>
      </div>

      <FrameForm initialData={{ ...frameCatalog, imageUrl: resolveFrameImage(frameCatalog.frameName, frameCatalog.imageUrl) }} isEditing />
    </div>
  );
}

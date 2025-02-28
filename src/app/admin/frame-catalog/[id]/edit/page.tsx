import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import FrameForm from "../../_components/FrameForm";

const prisma = new PrismaClient();

interface EditFramePageProps {
  params: {
    id: string;
  };
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
        <h1 className="text-2xl font-bold">Edit Frame</h1>
        <p className="text-gray-500">Update frame information</p>
      </div>

      <FrameForm initialData={frameCatalog} isEditing />
    </div>
  );
}

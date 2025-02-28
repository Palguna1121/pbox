import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import CategoryForm from "../../_components/CategoryForm";

const prisma = new PrismaClient();

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const param = await params;
  const category = await prisma.category.findUnique({
    where: {
      id: param.id,
    },
  });

  if (!category) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-10 px-5 lg:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Category</h1>
        <p className="text-gray-500">Update category information</p>
      </div>

      <div className="max-w-xl">
        <CategoryForm initialData={category} isEditing />
      </div>
    </div>
  );
}

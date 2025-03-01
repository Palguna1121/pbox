import { PrismaClient } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DeleteButton from "../_components/DeleteButton";

const prisma = new PrismaClient();

interface StickerDetailPageProps {
  params: {
    id: string;
  };
}

export default async function StickerDetailPage({ params }: StickerDetailPageProps) {
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sticker Details</h1>
        <div className="flex gap-2">
          <Link href="/admin/sticker-catalog">
            <Button variant="outline">Back to List</Button>
          </Link>
          <Link href={`/admin/sticker-catalog/${param.id}/edit`}>
            <Button>Edit Sticker</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <div className="relative aspect-square rounded-md overflow-hidden">
              <Image src={stickerCatalog.imageUrl} alt={stickerCatalog.stickerName} priority={true} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Sticker Name</h3>
                <p className="text-lg">{stickerCatalog.stickerName}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Category</h3>
                <p className="text-lg capitalize">{stickerCatalog.category.name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                <p className="text-lg">{format(new Date(stickerCatalog.createdAt), "PPP")}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                <p className="text-lg">{format(new Date(stickerCatalog.updatedAt), "PPP")}</p>
              </div>

              <div className="pt-4">
                <DeleteButton id={param.id} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

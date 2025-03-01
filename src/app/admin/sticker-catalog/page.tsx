import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import DeleteButton from "./_components/DeleteButton";

const prisma = new PrismaClient();

export default async function StickerCatalogPage() {
  const stickerCatalogs = await prisma.stickerCatalog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
    },
  });

  return (
    <div className="container mx-auto py-10 px-5 lg:px-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sticker Catalog</h1>
        <Link href="/admin/sticker-catalog/create">
          <Button>Create New Sticker</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Sticker Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stickerCatalogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No stickers found. Create your first sticker!
                </TableCell>
              </TableRow>
            ) : (
              stickerCatalogs.map((sticker) => (
                <TableRow key={sticker.id}>
                  <TableCell>
                    <div className="relative h-12 w-12 rounded-md overflow-hidden">
                      <Image src={sticker.imageUrl} alt={sticker.stickerName} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" priority={true} className="object-cover" />
                    </div>
                  </TableCell>
                  <TableCell>{sticker.stickerName}</TableCell>
                  <TableCell>
                    <span className="capitalize">{sticker.category.name}</span>
                  </TableCell>
                  <TableCell>{format(new Date(sticker.createdAt), "dd MMM yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/sticker-catalog/${sticker.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Link href={`/admin/sticker-catalog/${sticker.id}/edit`}>
                        <Button variant="default" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <DeleteButton id={sticker.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import DeleteButton from "./_components/DeleteButton";

const prisma = new PrismaClient();

export default async function FrameCatalogPage() {
  const frameCatalogs = await prisma.frameCatalog.findMany({
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
        <h1 className="text-2xl font-bold">Frame Catalog</h1>
        <Link href="/admin/frame-catalog/create">
          <Button>Create New Frame</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Frame Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {frameCatalogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No frames found. Create your first frame!
                </TableCell>
              </TableRow>
            ) : (
              frameCatalogs.map((frame) => (
                <TableRow key={frame.id}>
                  <TableCell>
                    <div className="relative h-12 w-12 rounded-md overflow-hidden">
                      <Image src={frame.imageUrl} alt={frame.frameName} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" priority={true} className="object-cover" />
                    </div>
                  </TableCell>
                  <TableCell>{frame.frameName}</TableCell>
                  <TableCell>
                    <span className="capitalize">{frame.category.name}</span>
                  </TableCell>
                  <TableCell>{format(new Date(frame.createdAt), "dd MMM yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/frame-catalog/${frame.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Link href={`/admin/frame-catalog/${frame.id}/edit`}>
                        <Button variant="default" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <DeleteButton id={frame.id} />
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

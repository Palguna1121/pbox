import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import DeleteButton from "./_components/DeleteButton";
import { resolveFrameImage } from "@/lib/catalog-assets";



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
        <h1 className="font-display text-3xl font-bold tracking-tight">Katalog frame</h1>
        <Link href="/admin/frame-catalog/create">
          <Button>Tambah frame</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gambar</TableHead>
              <TableHead>Nama frame</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {frameCatalogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No frames found. Create your first frame!
                </TableCell>
              </TableRow>
            ) : (
              frameCatalogs.map((frame) => (
                <TableRow key={frame.id}>
                  <TableCell>
                    <div className="frame-preview relative h-12 w-12 rounded-md overflow-hidden">
                      <Image src={resolveFrameImage(frame.frameName, frame.imageUrl)} alt={frame.frameName} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" priority={true} className="object-cover" />
                    </div>
                  </TableCell>
                  <TableCell>{frame.frameName}</TableCell>
                  <TableCell>
                    <span className="capitalize">{frame.category.name}</span>
                  </TableCell>
                  <TableCell>{format(new Date(frame.createdAt), "d MMM yyyy", { locale: localeId })}</TableCell>
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

// Admin lists must always reflect the database.
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import DeleteButton from "./_components/DeleteButton";
import { resolveStickerImage } from "@/lib/catalog-assets";



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
        <h1 className="font-display text-3xl font-bold tracking-tight">Katalog stiker</h1>
        <Link href="/admin/sticker-catalog/create">
          <Button>Tambah stiker</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gambar</TableHead>
              <TableHead>Nama stiker</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stickerCatalogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No stickers found. Create your first sticker!
                </TableCell>
              </TableRow>
            ) : (
              stickerCatalogs.map((sticker) => (
                <TableRow key={sticker.id}>
                  <TableCell>
                    <div className="relative h-12 w-12 rounded-md overflow-hidden">
                      <Image src={resolveStickerImage(sticker.stickerName, sticker.imageUrl)} alt={sticker.stickerName} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" priority={true} className="object-cover" />
                    </div>
                  </TableCell>
                  <TableCell>{sticker.stickerName}</TableCell>
                  <TableCell>
                    <span className="capitalize">{sticker.category.name}</span>
                  </TableCell>
                  <TableCell>{format(new Date(sticker.createdAt), "d MMM yyyy", { locale: localeId })}</TableCell>
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

// Admin lists must always reflect the database.
export const dynamic = "force-dynamic";

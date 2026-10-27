import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DeleteCategoryButton from "../_components/DeleteCategoryButton";
import { resolveFrameImage, resolveStickerImage } from "@/lib/catalog-assets";



interface CategoryDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const param = await params;
  const category = await prisma.category.findUnique({
    where: {
      id: param.id,
    },
    include: {
      frameCatalogs: {
        orderBy: {
          createdAt: "desc",
        },
      },
      stickerCatalogs: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!category) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-10 px-5 lg:px-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">Category: {category.name}</h1>
        <div className="flex gap-2">
          <Link href="/admin/categories">
            <Button variant="outline">Kembali ke daftar</Button>
          </Link>
          <Link href={`/admin/categories/${param.id}/edit`}>
            <Button>Edit kategori</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detail kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Nama</h3>
                <p className="text-lg">{category.name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Jumlah frame</h3>
                <p className="text-lg">{category.frameCatalogs.length}</p>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-muted-foreground">Deskripsi</h3>
                <p className="text-lg">{category.description || "No description provided"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Dibuat</h3>
                <p className="text-lg">{format(new Date(category.createdAt), "d MMMM yyyy", { locale: localeId })}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Terakhir diubah</h3>
                <p className="text-lg">{format(new Date(category.updatedAt), "d MMMM yyyy", { locale: localeId })}</p>
              </div>
            </div>

            <div className="mt-6">
              <DeleteCategoryButton id={param.id} />
            </div>
          </CardContent>
        </Card>

        {/* frames use this category */}
        <Card>
          <CardHeader>
            <CardTitle>Frames in this Category ({category.frameCatalogs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {category.frameCatalogs.length === 0 ? (
              <p className="text-muted-foreground">Belum ada frame di kategori ini.</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Gambar</TableHead>
                      <TableHead>Nama frame</TableHead>
                      <TableHead>Dibuat</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.frameCatalogs.map((frame) => (
                      <TableRow key={frame.id}>
                        <TableCell>
                          <div className="frame-preview relative h-12 w-12 rounded-md overflow-hidden">
                            <Image src={resolveFrameImage(frame.frameName, frame.imageUrl)} alt={frame.frameName} priority={true} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px)" className="object-cover" />
                          </div>
                        </TableCell>
                        <TableCell>{frame.frameName}</TableCell>
                        <TableCell>{format(new Date(frame.createdAt), "d MMM yyyy", { locale: localeId })}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/frame-catalog/${frame.id}`}>
                            <Button variant="outline" size="sm">
                              View Frame
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* stickers use this category */}
        <Card>
          <CardHeader>
            <CardTitle>Stickers in this Category ({category.stickerCatalogs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {category.stickerCatalogs.length === 0 ? (
              <p className="text-muted-foreground">Belum ada stiker di kategori ini.</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Gambar</TableHead>
                      <TableHead>Nama stiker</TableHead>
                      <TableHead>Dibuat</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.stickerCatalogs.map((sticker) => (
                      <TableRow key={sticker.id}>
                        <TableCell>
                          <div className="relative h-12 w-12 rounded-md overflow-hidden">
                            <Image src={resolveStickerImage(sticker.stickerName, sticker.imageUrl)} alt={sticker.stickerName} priority={true} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px)" className="object-cover" />
                          </div>
                        </TableCell>
                        <TableCell>{sticker.stickerName}</TableCell>
                        <TableCell>{format(new Date(sticker.createdAt), "d MMM yyyy", { locale: localeId })}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/sticker-catalog/${sticker.id}`}>
                            <Button variant="outline" size="sm">
                              View Sticker
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

async function getStickers() {
  return await prisma.stickerCatalog.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default async function StickerCatalogPage() {
  const stickers = await getStickers();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Pilih Sticker</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stickers.map((sticker) => (
          <Card key={sticker.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <div className="relative h-48 w-full">
                <Image src={sticker.imageUrl} alt={sticker.stickerName} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" priority={true} className="object-contain p-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg">{sticker.stickerName}</h3>
              <p className="text-sm text-muted-foreground">Kategori: {sticker.category?.name || "Tanpa Kategori"}</p>
            </CardContent>
            <CardFooter className="flex justify-end p-4">
              <Link href={`/sticker-pic/${sticker.id}`}>
                <Button variant="default">Pilih Sticker</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

async function getFrames() {
  return await prisma.frameCatalog.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default async function Photobox() {
  const frames = await getFrames();

  return (
    <div className="container mx-auto py-8 px-6 lg:px-4">
      <h1 className="text-3xl font-bold mb-8">Pilih Frame Photobox</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {frames.map((frame) => (
          <Card key={frame.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <div className="relative h-48 w-full">
                <Image src={frame.imageUrl} alt={frame.frameName} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" priority={true} className="object-cover rounded-t-lg" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg">{frame.frameName}</h3>
              <p className="text-sm text-muted-foreground">Kategori: {frame.category?.name || "Tanpa Kategori"}</p>
            </CardContent>
            <CardFooter className="flex justify-end p-4">
              <Link href={`/photobox/${frame.id}`}>
                <Button variant="default">Pilih Frame</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Skeleton untuk loading state
export function PhotoboxSkeleton() {
  return (
    <div className="container mx-auto py-8">
      <Skeleton className="h-8 w-48 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <Skeleton className="h-48 w-full rounded-t-lg" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="p-4 flex justify-end">
              <Skeleton className="h-10 w-24" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

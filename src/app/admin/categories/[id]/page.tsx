import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DeleteCategoryButton from "../_components/DeleteCategoryButton";

const prisma = new PrismaClient();

interface CategoryDetailPageProps {
  params: {
    id: string;
  };
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
    },
  });

  if (!category) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-10 px-5 lg:px-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Category: {category.name}</h1>
        <div className="flex gap-2">
          <Link href="/admin/categories">
            <Button variant="outline">Back to List</Button>
          </Link>
          <Link href={`/admin/categories/${param.id}/edit`}>
            <Button>Edit Category</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="text-lg">{category.name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Frames</h3>
                <p className="text-lg">{category.frameCatalogs.length}</p>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="text-lg">{category.description || "No description provided"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                <p className="text-lg">{format(new Date(category.createdAt), "PPP")}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                <p className="text-lg">{format(new Date(category.updatedAt), "PPP")}</p>
              </div>
            </div>

            <div className="mt-6">
              <DeleteCategoryButton id={param.id} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Frames in this Category ({category.frameCatalogs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {category.frameCatalogs.length === 0 ? (
              <p className="text-gray-500">No frames in this category yet.</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Frame Name</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.frameCatalogs.map((frame) => (
                      <TableRow key={frame.id}>
                        <TableCell>
                          <div className="relative h-12 w-12 rounded-md overflow-hidden">
                            <Image src={frame.imageUrl} alt={frame.frameName} fill className="object-cover" />
                          </div>
                        </TableCell>
                        <TableCell>{frame.frameName}</TableCell>
                        <TableCell>{format(new Date(frame.createdAt), "dd MMM yyyy")}</TableCell>
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
      </div>
    </div>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
// import { Category } from "@/types";

const formSchema = z.object({
  stickerName: z.string().min(2, {
    message: "Nama stiker minimal 2 karakter.",
  }),
  categoryId: z.string().min(1, {
    message: "Pilih kategori dulu.",
  }),
});

interface StickerFormProps {
  initialData?: {
    id: string;
    stickerName: string;
    categoryId: string;
    imageUrl: string;
    category: Category;
  } | null;
  isEditing?: boolean;
}

type Category = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function StickerForm({ initialData, isEditing = false }: StickerFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imageUrl || null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stickerName: initialData?.stickerName || "",
      categoryId: initialData?.categoryId || "",
    },
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Gagal memuat kategori");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Create preview URL
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);

      // Clean up preview URL on component unmount
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  // Update onSubmit function
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      let imageUrl = initialData?.imageUrl;

      // Upload file baru
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "/nanabox-images/stickers");

        const response = await fetch("/api/files", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Unggah gagal");
        const { url } = await response.json();
        imageUrl = url;
      }

      // POST/PATCH data ke API sticker catalog
      const response = await fetch(isEditing ? `/api/sticker-catalog/${initialData?.id}` : "/api/sticker-catalog", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stickerName: values.stickerName,
          categoryId: values.categoryId,
          imageUrl,
        }),
      });

      if (!response.ok) throw new Error("Gagal menyimpan");

      router.push("/admin/sticker-catalog");
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      // Handle error
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="stickerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama stiker</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori</FormLabel>
              <Select disabled={isLoading || categoriesLoading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Gambar stiker {!isEditing && "(wajib)"}</FormLabel>
          <FormControl>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
              required={!isEditing} // Wajib diisi untuk create
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        {previewUrl && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground mb-2">Pratinjau gambar</p>
            <div className="relative h-40 w-40 rounded-md overflow-hidden">
              <Image src={previewUrl} alt="Sticker preview" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" priority={true} />
            </div>
          </div>
        )}

        {form.formState.errors.root && <div className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</div>}

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/sticker-catalog")} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan…" : isEditing ? "Simpan perubahan" : "Tambah stiker"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

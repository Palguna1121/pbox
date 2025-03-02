// src/app/camera/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Camera } from "@/components/camera/Camera";
import FrameEditor from "@/components/camera/FrameEditor";
import StickerEditor from "@/components/camera/StickerEditor";
import FormalEditor from "@/components/camera/FormalEditor";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function CameraPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const type = searchParams.get("type") || ""; // frame, sticker, formal
  const itemId = searchParams.get("id") || "";
  const color = searchParams.get("color") || "";

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [finalImages, setFinalImages] = useState<string[]>([]);
  const [processingImage, setProcessingImage] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId || !type) {
        toast({
          title: "Error",
          description: "Informasi item tidak lengkap",
          variant: "destructive",
        });
        router.push("/dashboard");
        return;
      }

      try {
        setLoading(true);
        let endpoint;

        switch (type) {
          case "frame":
            endpoint = `/api/frames/${itemId}`;
            break;
          case "sticker":
            endpoint = `/api/stickers/${itemId}`;
            break;
          case "formal":
            endpoint = `/api/formal-pictures/${itemId}`;
            break;
          default:
            throw new Error("Tipe item tidak valid");
        }

        const response = await fetch(endpoint);
        if (!response.ok) throw new Error("Gagal mengambil data item");

        const data = await response.json();
        setItem(data);
      } catch (error) {
        console.error("Error fetching item:", error);
        toast({
          title: "Error",
          description: "Gagal mengambil data. Silakan coba lagi.",
          variant: "destructive",
        });
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId, type, toast, router]);

  const handleCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc);
  };

  const handleSaveImage = async (processedImage: string) => {
    setProcessingImage(true);
    try {
      // Save the image to the server
      const response = await fetch("/api/images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: processedImage,
          type: type,
          itemId: itemId,
        }),
      });

      if (!response.ok) throw new Error("Gagal menyimpan gambar");

      const data = await response.json();

      toast({
        title: "Sukses!",
        description: "Foto berhasil disimpan",
      });

      // Add to final images array
      setFinalImages((prev) => [...prev, data.imageUrl]);

      // Reset captured image to allow taking another photo
      setCapturedImage(null);
    } catch (error) {
      console.error("Error saving image:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan gambar. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setProcessingImage(false);
    }
  };

  const handleFinish = () => {
    if (finalImages.length > 0) {
      router.push(`/result?images=${finalImages.join(",")}`);
    } else {
      toast({
        title: "Perhatian",
        description: "Anda belum mengambil foto. Ambil foto terlebih dahulu.",
      });
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">
        {type === "frame" && "Photo dengan Frame"}
        {type === "sticker" && "Photo dengan Sticker"}
        {type === "formal" && "Foto Formal"}
      </h1>

      <div className="grid grid-cols-1 gap-6">
        {!capturedImage ? (
          <>
            <div className={cn("md:col-span-8", type === "frame" && "md:col-span-8", type === "sticker" && "md:col-span-9", type === "formal" && "md:col-span-10")}>
              <Camera onCapture={handleCapture} countdown={5} className="w-full" />
            </div>

            <div className={cn("md:col-span-4", type === "frame" && "md:col-span-4", type === "sticker" && "md:col-span-3", type === "formal" && "md:col-span-2")}>
              <div className="bg-muted p-4 rounded-md">
                <h2 className="font-semibold mb-2">{item?.name || "Item"}</h2>
                <div className="aspect-square relative mb-4">
                  <img src={item?.imageUrl || "/placeholder.png"} alt={item?.name || "Preview"} className="w-full h-full object-contain" />
                </div>
                <p className="text-sm text-muted-foreground">Klik "Mulai Sesi Foto" untuk memulai. Foto akan diambil setelah hitung mundur selesai.</p>
              </div>

              {finalImages.length > 0 && (
                <div className="mt-4">
                  <Button variant="default" className="w-full" onClick={handleFinish}>
                    Selesai ({finalImages.length} foto)
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {type === "frame" && <FrameEditor capturedImage={capturedImage} frameData={item} onSave={handleSaveImage} onRetake={handleRetake} isProcessing={processingImage} />}

            {type === "sticker" && <StickerEditor capturedImage={capturedImage} stickerData={item} onSave={handleSaveImage} onRetake={handleRetake} isProcessing={processingImage} />}

            {type === "formal" && <FormalEditor capturedImage={capturedImage} formalData={item} onSave={handleSaveImage} onRetake={handleRetake} isProcessing={processingImage} />}
          </>
        )}
      </div>
    </div>
  );
}

// Helper function to conditionally merge class names
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

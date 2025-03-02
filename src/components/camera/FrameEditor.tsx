// src/components/camera/FrameEditor.tsx
"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Camera } from "@/components/camera/Camera";

interface FrameEditorProps {
  capturedImage: string;
  frameData: {
    id: string;
    name: string;
    imageUrl: string;
    framePlaceholders: { id: string; x: number; y: number; width: number; height: number }[];
  };
  onSave: (processedImage: string) => void;
  onRetake: () => void;
  isProcessing: boolean;
}

export default function FrameEditor({ capturedImage, frameData, onSave, onRetake, isProcessing }: FrameEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessed, setIsProcessed] = useState(false);
  const [userPhotos, setUserPhotos] = useState<Map<string, string>>(new Map());
  const [processingPlaceholder, setProcessingPlaceholder] = useState<string | null>(null);
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<string | null>(null);

  // Process the image when first loaded
  useEffect(() => {
    if (!capturedImage || !frameData || userPhotos.size > 0) return;

    // For the first photo, use the captured image
    const firstPlaceholderId = frameData?.framePlaceholders?.[0]?.id;
    if (firstPlaceholderId) {
      setUserPhotos(new Map([[firstPlaceholderId, capturedImage]]));
    }
  }, [capturedImage, frameData, userPhotos]);

  // When user photos change, redraw the canvas
  useEffect(() => {
    if (userPhotos.size === 0 || !frameData) return;

    const processImages = async () => {
      if (!canvasRef.current) return;

      setIsProcessed(false);

      try {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        // Create an image element for the frame
        const frameImage = new Image();
        frameImage.crossOrigin = "anonymous";
        frameImage.src = frameData.imageUrl;

        await new Promise((resolve, reject) => {
          frameImage.onload = resolve;
          frameImage.onerror = reject;
        });

        // Set canvas size to match frame image
        canvas.width = frameImage.width;
        canvas.height = frameImage.height;

        // Draw the frame first
        context.drawImage(frameImage, 0, 0, canvas.width, canvas.height);

        // Draw each user photo in its respective placeholder
        for (const placeholder of frameData.framePlaceholders) {
          const userPhoto = userPhotos.get(placeholder.id);
          if (userPhoto) {
            const userImage = new Image();
            userImage.crossOrigin = "anonymous";
            userImage.src = userPhoto;

            await new Promise((resolve, reject) => {
              userImage.onload = resolve;
              userImage.onerror = reject;
            });

            // Draw the user's photo in the placeholder position
            context.drawImage(userImage, placeholder.x, placeholder.y, placeholder.width, placeholder.height);
          }
        }

        setIsProcessed(true);
      } catch (error) {
        console.error("Error processing image:", error);
      }
    };

    processImages();
  }, [userPhotos, frameData]);

  const handleNewCapture = (placeholderId: string, newImageSrc: string) => {
    setUserPhotos(new Map(userPhotos.set(placeholderId, newImageSrc)));
    setSelectedPlaceholder(null);
  };

  const handleSaveImage = () => {
    if (!canvasRef.current || !isProcessed) return;

    const canvas = canvasRef.current;
    const processedImage = canvas.toDataURL("image/png");
    onSave(processedImage);
  };
  const allPlaceholdersFilled = frameData?.framePlaceholders?.every((placeholder) => userPhotos.has(placeholder.id)) ?? false;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
      <div className="md:col-span-8">
        <div className="relative bg-muted rounded-md p-2">
          <canvas ref={canvasRef} className="w-full h-auto mx-auto" />
          {!isProcessed && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2">Memproses gambar...</span>
            </div>
          )}
        </div>
      </div>

      <div className="md:col-span-4">
        <div className="bg-muted p-4 rounded-md">
          <h2 className="font-semibold mb-4">Galeri Foto</h2>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {frameData.framePlaceholders?.map((placeholder, index) => (
              <Dialog key={placeholder.id}>
                <DialogTrigger asChild>
                  <button className="relative aspect-square overflow-hidden rounded-md bg-background border-2 hover:border-primary transition-colors" onClick={() => setSelectedPlaceholder(placeholder.id)}>
                    {userPhotos.has(placeholder.id) ? (
                      <img src={userPhotos.get(placeholder.id)} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <span className="text-xs">Tambah Foto</span>
                      </div>
                    )}
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <Camera onCapture={(imageSrc) => handleNewCapture(placeholder.id, imageSrc)} countdown={8} />
                </DialogContent>
              </Dialog>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={onRetake} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Ambil Foto Baru
            </Button>

            <Button disabled={!isProcessed || isProcessing || !allPlaceholdersFilled} onClick={handleSaveImage} className="w-full">
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Foto"
              )}
            </Button>
          </div>

          {!allPlaceholdersFilled && <p className="text-sm text-muted-foreground mt-4">Silakan isi semua placeholder foto untuk menyimpan.</p>}
        </div>
      </div>
    </div>
  );
}

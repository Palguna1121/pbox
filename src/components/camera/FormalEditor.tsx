// src/components/camera/FormalEditor.tsx
"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Save, ZoomIn, ZoomOut, Move } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Camera } from "@/components/camera/Camera";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FormalEditorProps {
  capturedImage: string;
  formalData: {
    id: string;
    name: string;
    backgroundUrl: string; // URL to the formal photo background
    sizes: { id: string; name: string; width: number; height: number; dpi: number }[];
  };
  onSave: (processedImage: string) => void;
  onRetake: () => void;
  isProcessing: boolean;
}

interface PhotoPosition {
  x: number;
  y: number;
  scale: number;
}

export default function FormalEditor({ capturedImage, formalData, onSave, onRetake, isProcessing }: FormalEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [isPreviewRendered, setIsPreviewRendered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(formalData.sizes[0]?.id || "");
  const [photoPosition, setPhotoPosition] = useState<PhotoPosition>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [faceDetected, setFaceDetected] = useState(false);

  // Load the models for face detection
  useEffect(() => {
    const loadFaceDetection = async () => {
      try {
        // This is a placeholder for face detection setup
        // In a real implementation, you might use a library like face-api.js
        // or tensorflow.js face detection models
        console.log("Face detection would be set up here");
        // Simulating face detection being ready
        setTimeout(() => setFaceDetected(true), 1000);
      } catch (error) {
        console.error("Error loading face detection:", error);
      }
    };

    loadFaceDetection();
  }, []);

  // Set up the canvas and draw the captured image
  useEffect(() => {
    if (!canvasRef.current || !capturedImage) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = capturedImage;

    img.onload = () => {
      // Set the canvas size to the image size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      setIsRendered(true);

      // Auto position the photo to center
      setPhotoPosition({
        x: canvas.width / 2,
        y: canvas.height / 2,
        scale: 1,
      });

      // Update the preview
      updatePreview();
    };
  }, [capturedImage]);

  // Update the preview canvas when photo position or selected size changes
  useEffect(() => {
    if (isRendered) {
      updatePreview();
    }
  }, [photoPosition, selectedSize, isRendered]);

  const updatePreview = () => {
    if (!previewCanvasRef.current || !canvasRef.current) return;

    const selectedSizeObj = formalData.sizes.find((size) => size.id === selectedSize);
    if (!selectedSizeObj) return;

    const previewCanvas = previewCanvasRef.current;
    const previewContext = previewCanvas.getContext("2d");
    if (!previewContext) return;

    // Set preview canvas size to match the selected formal photo size
    previewCanvas.width = selectedSizeObj.width;
    previewCanvas.height = selectedSizeObj.height;

    // Draw background first
    const bgImage = new Image();
    bgImage.crossOrigin = "anonymous";
    bgImage.src = formalData.backgroundUrl;

    bgImage.onload = () => {
      // Draw the background, stretched to fit the canvas
      previewContext.drawImage(bgImage, 0, 0, previewCanvas.width, previewCanvas.height);

      // Draw the user's photo on top, with position and scaling
      const sourceCanvas = canvasRef.current;
      if (!sourceCanvas) return;

      // Calculate the dimensions and position for the user's photo in the preview
      const sourceWidth = sourceCanvas.width * photoPosition.scale;
      const sourceHeight = sourceCanvas.height * photoPosition.scale;

      // Position is relative to the center of the original image
      const centerX = photoPosition.x;
      const centerY = photoPosition.y;

      // Calculate the top-left corner for drawing
      const drawX = previewCanvas.width / 2 - centerX * photoPosition.scale;
      const drawY = previewCanvas.height / 2 - centerY * photoPosition.scale;

      // Draw the user's photo
      previewContext.drawImage(sourceCanvas, drawX, drawY, sourceWidth, sourceHeight);

      setIsPreviewRendered(true);
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    setIsDragging(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Get mouse position relative to the canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    setDragStart({
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Get current mouse position relative to the canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;

    // Calculate how much the mouse has moved
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;

    // Update position
    setPhotoPosition((prev) => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));

    // Update drag start to current position
    setDragStart({ x: currentX, y: currentY });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleScaleChange = (newScale: number[]) => {
    setPhotoPosition((prev) => ({
      ...prev,
      scale: newScale[0],
    }));
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
  };

  const handleAutoPosition = () => {
    // In a real implementation, this would use face detection to position the face correctly
    // For now, we'll just center the image
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    setPhotoPosition({
      x: canvas.width / 2,
      y: canvas.height / 2,
      scale: 1,
    });
  };

  const handleSave = () => {
    if (!previewCanvasRef.current) return;

    const finalImage = previewCanvasRef.current.toDataURL("image/png");
    onSave(finalImage);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
      <div className="md:col-span-6">
        <div className="bg-muted p-4 rounded-md">
          <h2 className="font-semibold mb-2">Foto Asli</h2>
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full h-auto mx-auto cursor-move border border-muted-foreground/20 rounded-md"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />
            {!isRendered && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2">Memproses gambar...</span>
              </div>
            )}

            {/* Overlay with instructions */}
            <div className="absolute top-2 left-2 bg-background/80 text-xs px-2 py-1 rounded">
              <Move className="w-3 h-3 inline mr-1" /> Drag untuk menyesuaikan posisi
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium mb-2 block">Ukuran Foto</label>
            <div className="flex items-center">
              <ZoomOut className="w-4 h-4 mr-2" />
              <Slider value={[photoPosition.scale]} min={0.5} max={2} step={0.1} onValueChange={handleScaleChange} className="flex-1" />
              <ZoomIn className="w-4 h-4 ml-2" />
            </div>
          </div>

          <Button variant="outline" className="w-full mt-4" onClick={handleAutoPosition} disabled={!faceDetected}>
            {faceDetected ? "Posisikan Otomatis" : "Mendeteksi Wajah..."}
          </Button>
        </div>
      </div>

      <div className="md:col-span-6">
        <div className="bg-muted p-4 rounded-md">
          <h2 className="font-semibold mb-2">Hasil Foto Formal</h2>

          <div className="flex flex-col space-y-4">
            <Select value={selectedSize} onValueChange={handleSizeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih ukuran foto" />
              </SelectTrigger>
              <SelectContent>
                {formalData.sizes.map((size) => (
                  <SelectItem key={size.id} value={size.id}>
                    {size.name} ({size.width}x{size.height} px, {size.dpi} DPI)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative border border-muted-foreground/20 rounded-md bg-background p-2">
              <div className="flex justify-center">
                <div className="relative max-w-full">
                  <canvas ref={previewCanvasRef} className="max-w-full h-auto mx-auto object-contain" />
                  {!isPreviewRendered && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <span className="ml-2">Menghasilkan preview...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>Pastikan wajah terlihat jelas dan berada di tengah frame.</p>
              <p>Gunakan slider untuk menyesuaikan ukuran dan drag foto untuk menyesuaikan posisi.</p>
            </div>

            <div className="flex flex-col space-y-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Ambil Foto Baru
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <Camera onCapture={onRetake} countdown={8} />
                </DialogContent>
              </Dialog>

              <Button onClick={handleSave} disabled={isProcessing || !isPreviewRendered}>
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Foto
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

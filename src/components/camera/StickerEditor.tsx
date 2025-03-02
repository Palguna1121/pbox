// src/components/camera/StickerEditor.tsx
"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Save, Plus, Minus, RotateCw, RotateCcw, Trash } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Camera } from "@/components/camera/Camera";
import { cn } from "@/lib/utils";

interface StickerEditorProps {
  capturedImage: string;
  stickerData: {
    id: string;
    name: string;
    imageUrl: string;
  };
  onSave: (processedImage: string) => void;
  onRetake: () => void;
  isProcessing: boolean;
}

interface StickerInstance {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
}

export default function StickerEditor({ capturedImage, stickerData, onSave, onRetake, isProcessing }: StickerEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stickers, setStickers] = useState<StickerInstance[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isRendered, setIsRendered] = useState(false);

  // Initialize with the first sticker
  useEffect(() => {
    if (stickers.length === 0 && stickerData) {
      // Add the initial sticker
      const canvasWidth = canvasRef.current?.width || 800;
      const canvasHeight = canvasRef.current?.height || 600;

      const newSticker: StickerInstance = {
        id: `sticker-${Date.now()}`,
        url: stickerData.imageUrl,
        x: canvasWidth / 2 - 100,
        y: canvasHeight / 2 - 100,
        width: 200,
        height: 200,
        rotation: 0,
        scale: 1,
      };

      setStickers([newSticker]);
      setSelectedSticker(newSticker.id);
    }
  }, [stickerData, stickers.length]);

  // Set up the canvas and draw the background image
  useEffect(() => {
    if (!canvasRef.current || !capturedImage) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const bgImage = new Image();
    bgImage.crossOrigin = "anonymous";
    bgImage.src = capturedImage;

    bgImage.onload = () => {
      canvas.width = bgImage.width;
      canvas.height = bgImage.height;

      // Draw the background image
      context.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
      setIsRendered(true);

      // Draw all stickers
      drawStickers();
    };
  }, [capturedImage]);

  // Redraw everything when stickers change
  useEffect(() => {
    if (isRendered) {
      drawStickers();
    }
  }, [stickers, selectedSticker, isRendered]);

  const drawStickers = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Redraw the background image
    const bgImage = new Image();
    bgImage.crossOrigin = "anonymous";
    bgImage.src = capturedImage;

    bgImage.onload = () => {
      context.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

      // Draw each sticker
      stickers.forEach((sticker) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = sticker.url;

        img.onload = () => {
          context.save();

          // Move to the center of where we want to draw the sticker
          context.translate(sticker.x + sticker.width / 2, sticker.y + sticker.height / 2);

          // Rotate around this point
          context.rotate((sticker.rotation * Math.PI) / 180);

          // Draw the sticker, with scaling
          context.drawImage(img, -sticker.width / 2, -sticker.height / 2, sticker.width * sticker.scale, sticker.height * sticker.scale);

          // Draw a highlight if this sticker is selected
          if (selectedSticker === sticker.id) {
            context.strokeStyle = "#3b82f6"; // blue-500
            context.lineWidth = 3;
            context.strokeRect(-sticker.width / 2, -sticker.height / 2, sticker.width * sticker.scale, sticker.height * sticker.scale);
          }

          context.restore();
        };
      });
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Get click coordinates relative to the canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check if we clicked on a sticker
    let clickedSticker = null;

    // Check in reverse order (top-most sticker first)
    for (let i = stickers.length - 1; i >= 0; i--) {
      const sticker = stickers[i];

      // Simple bounding box check (not rotation-aware)
      if (clickX >= sticker.x && clickX <= sticker.x + sticker.width * sticker.scale && clickY >= sticker.y && clickY <= sticker.y + sticker.height * sticker.scale) {
        clickedSticker = sticker;
        break;
      }
    }

    if (clickedSticker) {
      setSelectedSticker(clickedSticker.id);
      setScale(clickedSticker.scale);
      setRotation(clickedSticker.rotation);

      // Set up for dragging
      setIsDragging(true);
      setDragOffset({
        x: clickX - clickedSticker.x,
        y: clickY - clickedSticker.y,
      });
    } else {
      setSelectedSticker(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedSticker) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Update the sticker's position
    setStickers((prevStickers) =>
      prevStickers.map((sticker) =>
        sticker.id === selectedSticker
          ? {
              ...sticker,
              x: mouseX - dragOffset.x,
              y: mouseY - dragOffset.y,
            }
          : sticker
      )
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const addNewSticker = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const newSticker: StickerInstance = {
      id: `sticker-${Date.now()}`,
      url: stickerData.imageUrl,
      x: canvas.width / 2 - 50,
      y: canvas.height / 2 - 50,
      width: 200,
      height: 200,
      rotation: 0,
      scale: 1,
    };

    setStickers((prev) => [...prev, newSticker]);
    setSelectedSticker(newSticker.id);
    setScale(1);
    setRotation(0);
  };

  const removeSelectedSticker = () => {
    if (!selectedSticker) return;

    setStickers((prevStickers) => prevStickers.filter((sticker) => sticker.id !== selectedSticker));
    setSelectedSticker(null);
  };

  const handleScaleChange = (newScale: number[]) => {
    if (!selectedSticker) return;

    const newScaleValue = newScale[0];
    setScale(newScaleValue);

    setStickers((prevStickers) => prevStickers.map((sticker) => (sticker.id === selectedSticker ? { ...sticker, scale: newScaleValue } : sticker)));
  };

  const handleRotationChange = (value: number) => {
    if (!selectedSticker) return;

    setRotation(value);

    setStickers((prevStickers) => prevStickers.map((sticker) => (sticker.id === selectedSticker ? { ...sticker, rotation: value } : sticker)));
  };

  const handleSave = () => {
    if (!canvasRef.current) return;

    const finalImage = canvasRef.current.toDataURL("image/png");
    onSave(finalImage);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
      <div className="md:col-span-9">
        <div className="relative bg-muted rounded-md p-2" ref={containerRef}>
          <canvas ref={canvasRef} className="w-full h-auto mx-auto cursor-move" onClick={handleCanvasClick} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} />
          {!isRendered && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2">Memproses gambar...</span>
            </div>
          )}
        </div>
      </div>

      <div className="md:col-span-3">
        <div className="bg-muted p-4 rounded-md">
          <h2 className="font-semibold mb-4">Edit Stiker</h2>

          <div className="mb-4">
            <div className="aspect-square relative mb-4 border rounded-md overflow-hidden">
              <img src={stickerData?.imageUrl || "/placeholder.png"} alt={stickerData?.name || "Sticker"} className="w-full h-full object-contain" />
            </div>

            <Button onClick={addNewSticker} className="w-full mb-2">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Stiker
            </Button>

            {selectedSticker && (
              <Button onClick={removeSelectedSticker} variant="destructive" className="w-full mb-4">
                <Trash className="w-4 h-4 mr-2" />
                Hapus Stiker
              </Button>
            )}
          </div>

          {selectedSticker && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Ukuran Stiker</label>
                <div className="flex items-center">
                  <Minus className="w-4 h-4 mr-2" />
                  <Slider value={[scale]} min={0.2} max={2} step={0.1} onValueChange={handleScaleChange} className="flex-1" />
                  <Plus className="w-4 h-4 ml-2" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Rotasi Stiker</label>
                <div className="flex items-center">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  <Slider value={[rotation]} min={0} max={360} step={5} onValueChange={(value: any) => handleRotationChange(value[0])} className="flex-1" />
                  <RotateCw className="w-4 h-4 ml-2" />
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Ambil Foto Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <Camera onCapture={onRetake} countdown={8} />
              </DialogContent>
            </Dialog>

            <Button onClick={handleSave} disabled={isProcessing || !isRendered} className="w-full">
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
  );
}

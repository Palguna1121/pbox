"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Loader2, ArrowLeft, Download, ZoomIn, ZoomOut, Move, Sun, Contrast, FlipHorizontal } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormalEditorProps {
  capturedImage: string;
  formalData: {
    id: string;
    name: string;
    backgroundUrl: string;
    sizes: { id: string; name: string; width: number; height: number; dpi: number }[];
  };
  onSave: (processedImage: string) => void;
  onBack: () => void;
  isProcessing: boolean;
}

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export default function FormalEditor({ capturedImage, formalData, onSave, onBack, isProcessing }: FormalEditorProps) {
  const previewRef = useRef<HTMLCanvasElement>(null);

  const [selectedSize, setSelectedSize] = useState<string>(formalData.sizes[0]?.id ?? "");
  const [photoX, setPhotoX] = useState(0);
  const [photoY, setPhotoY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [flipX, setFlipX] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [previewReady, setPreviewReady] = useState(false);

  const drawPreview = useCallback(async () => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = formalData.sizes.find((s) => s.id === selectedSize);
    if (!size) return;

    canvas.width = size.width;
    canvas.height = size.height;

    // Background
    const bg = await loadImage(formalData.backgroundUrl);
    ctx.drawImage(bg, 0, 0, size.width, size.height);

    // User photo
    const photo = await loadImage(capturedImage);
    const pAspect = photo.width / photo.height;
    const sAspect = size.width / size.height;

    let dw: number, dh: number;
    if (pAspect > sAspect) {
      dh = size.height * zoom;
      dw = dh * pAspect;
    } else {
      dw = size.width * zoom;
      dh = dw / pAspect;
    }

    const cx = size.width / 2 + photoX;
    const cy = size.height / 2 + photoY;

    ctx.save();
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.translate(cx, cy);
    if (flipX) ctx.scale(-1, 1);
    ctx.drawImage(photo, -dw / 2, -dh / 2, dw, dh);
    ctx.filter = "none";
    ctx.restore();

    setPreviewReady(true);
  }, [capturedImage, formalData, selectedSize, photoX, photoY, zoom, flipX, brightness, contrast]);

  // Center on size change
  useEffect(() => {
    setPhotoX(0);
    setPhotoY(0);
    setZoom(1);
  }, [selectedSize]);

  useEffect(() => { drawPreview(); }, [drawPreview]);

  /* Drag handlers */
  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = previewRef.current!;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const client = "touches" in e ? e.touches[0] : e;
    return { x: (client.clientX - rect.left) * sx, y: (client.clientY - rect.top) * sy };
  };

  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    setDragStart(getPos(e));
  };

  const onDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const pos = getPos(e);
    setPhotoX((prev) => prev + pos.x - dragStart.x);
    setPhotoY((prev) => prev + pos.y - dragStart.y);
    setDragStart(pos);
  };

  const onDragEnd = () => setIsDragging(false);

  const handleSave = () => {
    const canvas = previewRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL("image/png"));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Ganti Background
      </button>

      <div className="mb-4">
        <p className="text-primary font-semibold text-xs uppercase tracking-widest mb-0.5">Foto Formal — Edit</p>
        <h2 className="text-2xl font-black tracking-tighter">{formalData.name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        {/* Preview canvas */}
        <div className="relative bg-muted rounded-3xl overflow-hidden">
          <div className="relative" style={{ cursor: isDragging ? "grabbing" : "grab" }}>
            <canvas
              ref={previewRef}
              className="w-full h-auto block max-h-[70vh] object-contain mx-auto"
              onMouseDown={onDragStart}
              onMouseMove={onDragMove}
              onMouseUp={onDragEnd}
              onMouseLeave={onDragEnd}
              onTouchStart={onDragStart}
              onTouchMove={onDragMove}
              onTouchEnd={onDragEnd}
            />
            {!previewReady && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-3xl">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
              </div>
            )}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm border border-border rounded-full px-3 py-1.5 text-xs text-muted-foreground">
              <Move className="w-3 h-3" /> Drag untuk geser foto
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          {/* Size picker */}
          <div className="bg-card border border-border rounded-3xl p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Ukuran Foto</p>
            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger className="rounded-xl h-10">
                <SelectValue placeholder="Pilih ukuran" />
              </SelectTrigger>
              <SelectContent>
                {formalData.sizes.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — {s.width}×{s.height}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Photo controls */}
          <div className="bg-card border border-border rounded-3xl p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Posisi & Ukuran</p>

            {/* Zoom */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><ZoomIn className="w-3 h-3" /> Zoom</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <Slider value={[zoom]} min={0.5} max={3} step={0.05}
                onValueChange={([v]) => setZoom(v)} />
            </div>

            {/* Brightness */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Sun className="w-3 h-3" /> Kecerahan</span>
                <span>{brightness}%</span>
              </div>
              <Slider value={[brightness]} min={40} max={180} step={5}
                onValueChange={([v]) => setBrightness(v)} />
            </div>

            {/* Contrast */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Contrast className="w-3 h-3" /> Kontras</span>
                <span>{contrast}%</span>
              </div>
              <Slider value={[contrast]} min={40} max={180} step={5}
                onValueChange={([v]) => setContrast(v)} />
            </div>

            {/* Center + Flip */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button onClick={() => { setPhotoX(0); setPhotoY(0); setZoom(1); }}
                className="py-2 rounded-xl border border-border text-xs font-medium hover:bg-muted transition-colors">
                Tengahkan
              </button>
              <button onClick={() => setFlipX((f) => !f)}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-medium transition-colors ${flipX ? "bg-primary/10 border-primary text-primary" : "border-border hover:bg-muted"}`}>
                <FlipHorizontal className="w-3.5 h-3.5" /> Cermin
              </button>
            </div>
          </div>

          {/* Save */}
          <button
            disabled={isProcessing || !previewReady}
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold rounded-full py-3.5 text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isProcessing ? "Menyimpan..." : "Simpan Foto"}
          </button>
        </div>
      </div>
    </div>
  );
}

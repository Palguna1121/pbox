"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Loader2, ArrowLeft, RefreshCw, Download, FlipHorizontal, ZoomIn, ZoomOut, Sun, Contrast } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Camera } from "@/components/camera/Camera";

interface Slot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SlotPhoto {
  src: string;
  zoom: number;    // 1.0 = fit, >1 = zoomed in
  offsetX: number; // pan within slot, normalized -0.5..0.5
  offsetY: number;
  flipX: boolean;
  brightness: number; // 0..200
  contrast: number;   // 0..200
}

interface FrameEditorProps {
  capturedImage: string;
  frameData: {
    id: string;
    name: string;
    imageUrl: string;
    positions: Slot[];
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

function defaultSlotPhoto(src: string): SlotPhoto {
  return { src, zoom: 1, offsetX: 0, offsetY: 0, flipX: false, brightness: 100, contrast: 100 };
}

export default function FrameEditor({ capturedImage, frameData, onSave, onBack, isProcessing }: FrameEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [slotPhotos, setSlotPhotos] = useState<Map<string, SlotPhoto>>(new Map());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [retakeOpen, setRetakeOpen] = useState(false);
  const [retakeSlotId, setRetakeSlotId] = useState<string | null>(null);

  const slots = frameData.positions ?? [];

  // Assign first captured photo to first slot
  useEffect(() => {
    if (slots.length > 0 && !slotPhotos.has(slots[0].id)) {
      setSlotPhotos(new Map([[slots[0].id, defaultSlotPhoto(capturedImage)]]));
      setSelectedSlot(slots[0].id);
    }
  }, [capturedImage, slots]); // eslint-disable-line react-hooks/exhaustive-deps

  const drawCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setRendering(true);
    try {
      const frameImg = await loadImage(frameData.imageUrl);
      canvas.width = frameImg.width;
      canvas.height = frameImg.height;

      // Draw each slot photo BEHIND frame
      for (const slot of slots) {
        const sp = slotPhotos.get(slot.id);
        if (!sp) continue;
        const photo = await loadImage(sp.src);

        // Compute draw dimensions to fill slot with zoom
        const slotAspect = slot.width / slot.height;
        const photoAspect = photo.width / photo.height;
        let dw: number, dh: number;
        if (photoAspect > slotAspect) {
          dh = slot.height * sp.zoom;
          dw = dh * photoAspect;
        } else {
          dw = slot.width * sp.zoom;
          dh = dw / photoAspect;
        }
        const cx = slot.x + slot.width / 2 + sp.offsetX * slot.width;
        const cy = slot.y + slot.height / 2 + sp.offsetY * slot.height;

        ctx.save();
        // Clip to slot
        ctx.beginPath();
        ctx.rect(slot.x, slot.y, slot.width, slot.height);
        ctx.clip();
        // Filter
        ctx.filter = `brightness(${sp.brightness}%) contrast(${sp.contrast}%)`;
        // Flip
        if (sp.flipX) {
          ctx.translate(cx * 2, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(photo, cx - dw / 2, cy - dh / 2, dw, dh);
        ctx.filter = "none";
        ctx.restore();
      }

      // Draw frame on top
      ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
    } catch (e) {
      console.error("Frame draw error:", e);
    } finally {
      setRendering(false);
    }
  }, [frameData.imageUrl, slots, slotPhotos]);

  useEffect(() => {
    if (slotPhotos.size > 0) drawCanvas();
  }, [slotPhotos, drawCanvas]);

  const handleRetakeCapture = (newSrc: string) => {
    if (!retakeSlotId) return;
    setSlotPhotos((prev) => {
      const next = new Map(prev);
      const existing = next.get(retakeSlotId) ?? defaultSlotPhoto(newSrc);
      next.set(retakeSlotId, { ...existing, src: newSrc });
      return next;
    });
    setRetakeOpen(false);
  };

  const updateSlot = (id: string, patch: Partial<SlotPhoto>) => {
    setSlotPhotos((prev) => {
      const next = new Map(prev);
      const cur = next.get(id);
      if (cur) next.set(id, { ...cur, ...patch });
      return next;
    });
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL("image/png"));
  };

  const allFilled = slots.every((s) => slotPhotos.has(s.id));
  const sel = selectedSlot ? slotPhotos.get(selectedSlot) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Ganti Frame
      </button>

      <div className="mb-4">
        <p className="text-primary font-semibold text-xs uppercase tracking-widest mb-0.5">Langkah 3 — Edit</p>
        <h2 className="text-2xl font-black tracking-tighter">{frameData.name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Canvas */}
        <div className="relative bg-muted rounded-3xl overflow-hidden min-h-48">
          <canvas ref={canvasRef} className="w-full h-auto mx-auto block" />
          {rendering && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-3xl">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Slot grid */}
          <div className="bg-card border border-border rounded-3xl p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Slot Foto ({slots.length})
            </p>
            <div className="grid grid-cols-2 gap-2">
              {slots.map((slot, i) => {
                const photo = slotPhotos.get(slot.id);
                const isActive = selectedSlot === slot.id;
                return (
                  <button
                    key={slot.id}
                    onClick={() => {
                      setSelectedSlot(slot.id);
                      if (!photo) {
                        setRetakeSlotId(slot.id);
                        setRetakeOpen(true);
                      }
                    }}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                      isActive ? "border-primary" : "border-border hover:border-primary/50"
                    }`}
                  >
                    {photo ? (
                      <img src={photo.src} alt={`Slot ${i + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex flex-col items-center justify-center gap-1">
                        <span className="text-xl">📷</span>
                        <span className="text-[10px] text-muted-foreground font-medium">Ambil Foto</span>
                      </div>
                    )}
                    {isActive && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slot controls */}
          {sel && selectedSlot && (
            <div className="bg-card border border-border rounded-3xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Kustom Slot</p>
                <button
                  onClick={() => { setRetakeSlotId(selectedSlot); setRetakeOpen(true); }}
                  className="flex items-center gap-1.5 text-xs text-primary font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Ganti foto
                </button>
              </div>

              {/* Zoom */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><ZoomIn className="w-3.5 h-3.5" /> Zoom</span>
                  <span>{Math.round(sel.zoom * 100)}%</span>
                </div>
                <Slider value={[sel.zoom]} min={1} max={3} step={0.05}
                  onValueChange={([v]) => updateSlot(selectedSlot, { zoom: v })} />
              </div>

              {/* Brightness */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5" /> Kecerahan</span>
                  <span>{sel.brightness}%</span>
                </div>
                <Slider value={[sel.brightness]} min={40} max={180} step={5}
                  onValueChange={([v]) => updateSlot(selectedSlot, { brightness: v })} />
              </div>

              {/* Contrast */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Contrast className="w-3.5 h-3.5" /> Kontras</span>
                  <span>{sel.contrast}%</span>
                </div>
                <Slider value={[sel.contrast]} min={40} max={180} step={5}
                  onValueChange={([v]) => updateSlot(selectedSlot, { contrast: v })} />
              </div>

              {/* Flip */}
              <button
                onClick={() => updateSlot(selectedSlot, { flipX: !sel.flipX })}
                className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl border w-full transition-colors ${
                  sel.flipX ? "bg-primary/10 border-primary text-primary" : "border-border hover:bg-muted"
                }`}
              >
                <FlipHorizontal className="w-4 h-4" /> Cermin Horizontal
              </button>
            </div>
          )}

          {/* Save */}
          <div className="space-y-2">
            {!allFilled && (
              <p className="text-xs text-muted-foreground text-center">
                Isi semua {slots.length} slot foto untuk menyimpan.
              </p>
            )}
            <button
              disabled={!allFilled || isProcessing || rendering}
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold rounded-full py-3.5 text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isProcessing ? "Menyimpan..." : "Simpan Foto"}
            </button>
          </div>
        </div>
      </div>

      {/* Retake dialog */}
      <Dialog open={retakeOpen} onOpenChange={setRetakeOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogTitle className="text-lg font-black tracking-tight">
            {retakeSlotId === slots[0]?.id ? "Slot pertama" : `Slot ${slots.findIndex((s) => s.id === retakeSlotId) + 1}`}
          </DialogTitle>
          <Camera onCapture={handleRetakeCapture} countdown={5} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

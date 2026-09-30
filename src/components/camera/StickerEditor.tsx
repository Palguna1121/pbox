"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Loader2, ArrowLeft, Download, Plus, Trash2, FlipHorizontal, FlipVertical,
  RotateCw, RotateCcw, Layers, ChevronUp, ChevronDown, Sun, Contrast,
  Undo2, Eye, Sparkles, X
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

/* ─── Types ──────────────────────────────────────────────── */
interface StickerInstance {
  id: string;
  url: string;
  name: string;
  x: number;
  y: number;
  baseSize: number; // base width in canvas px
  scale: number;
  rotation: number; // degrees
  opacity: number;  // 0..1
  flipX: boolean;
  flipY: boolean;
}

interface CatalogSticker {
  id: string;
  stickerName: string;
  imageUrl: string;
}

interface StickerEditorProps {
  capturedImage: string;
  onSave: (processedImage: string, stickerCatalogId: string) => void;
  onBack: () => void;
  isProcessing: boolean;
}

/* ─── Helpers ────────────────────────────────────────────── */
const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

let imgCache: Map<string, HTMLImageElement> = new Map();
const cachedLoad = async (src: string): Promise<HTMLImageElement> => {
  if (imgCache.has(src)) return imgCache.get(src)!;
  const img = await loadImage(src);
  imgCache.set(src, img);
  return img;
};

/* ─── Component ──────────────────────────────────────────── */
export default function StickerEditor({ capturedImage, onSave, onBack, isProcessing }: StickerEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [stickers, setStickers] = useState<StickerInstance[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<StickerInstance[][]>([[]]);
  const [historyIdx, setHistoryIdx] = useState(0);

  // Canvas size (in logical px)
  const [canvasW, setCanvasW] = useState(0);
  const [canvasH, setCanvasH] = useState(0);

  // Drag state
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Photo adjustments
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  // Catalog
  const [catalog, setCatalog] = useState<CatalogSticker[]>([]);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Used sticker id (for onSave)
  const [lastUsedId, setLastUsedId] = useState<string>("");

  // Render flag
  const [bgReady, setBgReady] = useState(false);
  const [savePending, setSavePending] = useState(false);

  /* Initialise canvas with background photo */
  useEffect(() => {
    loadImage(capturedImage).then((bg) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = bg.width;
      canvas.height = bg.height;
      setCanvasW(bg.width);
      setCanvasH(bg.height);
      setBgReady(true);
    });
  }, [capturedImage]);

  /* Redraw everything */
  const drawCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !bgReady) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    const bg = await cachedLoad(capturedImage);
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    ctx.filter = "none";

    // Stickers
    for (const s of stickers) {
      const img = await cachedLoad(s.url);
      const w = s.baseSize * s.scale;
      const h = (img.height / img.width) * w;
      const cx = s.x + w / 2;
      const cy = s.y + h / 2;

      ctx.save();
      ctx.globalAlpha = s.opacity;
      ctx.translate(cx, cy);
      ctx.rotate((s.rotation * Math.PI) / 180);
      ctx.scale(s.flipX ? -1 : 1, s.flipY ? -1 : 1);

      ctx.drawImage(img, -w / 2, -h / 2, w, h);

      // Selection indicator (dashed rect)
      if (s.id === selectedId && !savePending) {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "hsl(352 78% 57%)";
        ctx.lineWidth = Math.max(2, w * 0.015);
        ctx.setLineDash([w * 0.05, w * 0.03]);
        ctx.strokeRect(-w / 2, -h / 2, w, h);
        ctx.setLineDash([]);

        // Corner handles
        const hs = Math.max(6, w * 0.04);
        ctx.fillStyle = "white";
        ctx.strokeStyle = "hsl(352 78% 57%)";
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        const corners = [[-w / 2, -h / 2], [w / 2, -h / 2], [-w / 2, h / 2], [w / 2, h / 2]];
        for (const [hx, hy] of corners) {
          ctx.beginPath();
          ctx.arc(hx, hy, hs / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }, [stickers, selectedId, bgReady, brightness, contrast, capturedImage, savePending]);

  useEffect(() => { drawCanvas(); }, [drawCanvas]);

  /* Handle save pending (draw without selection then capture) */
  useEffect(() => {
    if (!savePending) return;
    drawCanvas().then(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const img = canvas.toDataURL("image/png");
      setSavePending(false);
      onSave(img, lastUsedId || stickers[0]?.id.split("-")[1] || "");
    });
  }, [savePending]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── History helpers ──────────────────────────────────── */
  const pushHistory = (newStickers: StickerInstance[]) => {
    const base = history.slice(0, historyIdx + 1);
    setHistory([...base, newStickers].slice(-20));
    setHistoryIdx(Math.min(historyIdx + 1, 19));
  };

  const undo = () => {
    if (historyIdx <= 0) return;
    const prev = history[historyIdx - 1];
    setStickers(prev);
    setHistoryIdx(historyIdx - 1);
  };

  const applyStickers = (fn: (prev: StickerInstance[]) => StickerInstance[]) => {
    setStickers((prev) => {
      const next = fn(prev);
      pushHistory(next);
      return next;
    });
  };

  /* ─── Load catalog ─────────────────────────────────────── */
  const openCatalog = async () => {
    setCatalogOpen(true);
    if (catalog.length > 0) return;
    setCatalogLoading(true);
    try {
      const res = await fetch("/api/sticker-catalog");
      const data = await res.json();
      setCatalog(data);
    } catch { /* ignore */ }
    finally { setCatalogLoading(false); }
  };

  /* ─── Add sticker from catalog ─────────────────────────── */
  const addSticker = (item: CatalogSticker) => {
    const baseSize = canvasW * 0.25;
    const newS: StickerInstance = {
      id: `${item.id}-${Date.now()}`,
      url: item.imageUrl,
      name: item.stickerName,
      x: canvasW / 2 - baseSize / 2,
      y: canvasH / 2 - baseSize / 2,
      baseSize,
      scale: 1,
      rotation: 0,
      opacity: 1,
      flipX: false,
      flipY: false,
    };
    setLastUsedId(item.id);
    applyStickers((prev) => [...prev, newS]);
    setSelectedId(newS.id);
    setCatalogOpen(false);
  };

  /* ─── Canvas pointer events ────────────────────────────── */
  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const client = "touches" in e ? e.touches[0] : e;
    return {
      x: (client.clientX - rect.left) * sx,
      y: (client.clientY - rect.top) * sy,
    };
  };

  const hitTest = (pos: { x: number; y: number }) => {
    // Test in reverse (top sticker first)
    for (let i = stickers.length - 1; i >= 0; i--) {
      const s = stickers[i];
      const img = imgCache.get(s.url);
      const w = s.baseSize * s.scale;
      const h = img ? (img.height / img.width) * w : w;
      if (pos.x >= s.x && pos.x <= s.x + w && pos.y >= s.y && pos.y <= s.y + h) {
        return s;
      }
    }
    return null;
  };

  const onPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getCanvasPos(e);
    const hit = hitTest(pos);
    if (hit) {
      setSelectedId(hit.id);
      dragging.current = true;
      dragOffset.current = { x: pos.x - hit.x, y: pos.y - hit.y };
    } else {
      setSelectedId(null);
    }
  };

  const onPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging.current || !selectedId) return;
    const pos = getCanvasPos(e);
    setStickers((prev) =>
      prev.map((s) =>
        s.id === selectedId ? { ...s, x: pos.x - dragOffset.current.x, y: pos.y - dragOffset.current.y } : s
      )
    );
  };

  const onPointerUp = () => {
    if (dragging.current) {
      dragging.current = false;
      // Push to history after drag ends
      setStickers((curr) => { pushHistory(curr); return curr; });
    }
  };

  /* ─── Sticker mutators ─────────────────────────────────── */
  const sel = stickers.find((s) => s.id === selectedId) ?? null;

  const updateSel = (patch: Partial<StickerInstance>) => {
    if (!selectedId) return;
    applyStickers((prev) => prev.map((s) => (s.id === selectedId ? { ...s, ...patch } : s)));
  };

  const deleteSel = () => {
    if (!selectedId) return;
    applyStickers((prev) => prev.filter((s) => s.id !== selectedId));
    setSelectedId(null);
  };

  const moveLayer = (dir: 1 | -1) => {
    if (!selectedId) return;
    applyStickers((prev) => {
      const idx = prev.findIndex((s) => s.id === selectedId);
      if (idx < 0) return prev;
      const next = [...prev];
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  };

  /* ─── Render ─────────────────────────────────────────────  */
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Foto ulang
      </button>

      <div className="mb-4">
        <p className="text-primary font-semibold text-xs uppercase tracking-widest mb-0.5">Sticker Pic — Edit</p>
        <h2 className="text-2xl font-black tracking-tighter">Tambahkan <span className="text-primary">Stiker</span></h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        {/* Canvas */}
        <div ref={containerRef} className="relative bg-muted rounded-3xl overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-auto block touch-none"
            style={{ cursor: dragging.current ? "grabbing" : "grab" }}
            onMouseDown={onPointerDown}
            onMouseMove={onPointerMove}
            onMouseUp={onPointerUp}
            onMouseLeave={onPointerUp}
            onTouchStart={onPointerDown}
            onTouchMove={onPointerMove}
            onTouchEnd={onPointerUp}
          />
          {!bgReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Canvas toolbar */}
          <div className="absolute top-3 left-3 flex gap-2">
            <button
              onClick={undo}
              disabled={historyIdx <= 0}
              className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-3">
          {/* Add sticker */}
          <button
            onClick={openCatalog}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold rounded-2xl py-3 text-sm hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="w-4 h-4" /> Pilih Stiker
          </button>

          {/* Sticker list */}
          {stickers.length > 0 && (
            <div className="bg-card border border-border rounded-3xl p-3 space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
                Stiker ({stickers.length})
              </p>
              {[...stickers].reverse().map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-colors text-left ${
                    s.id === selectedId ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"
                  }`}
                >
                  <img src={s.url} alt={s.name} className="w-8 h-8 object-contain rounded-lg bg-muted" />
                  <span className="text-xs font-medium truncate flex-1">{s.name}</span>
                  <Eye className={`w-3.5 h-3.5 shrink-0 ${s.id === selectedId ? "text-primary" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          )}

          {/* Selected sticker controls */}
          {sel && (
            <div className="bg-card border border-border rounded-3xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Edit Stiker</p>
                <button onClick={deleteSel} className="w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Scale */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Ukuran</span><span>{Math.round(sel.scale * 100)}%</span>
                </div>
                <Slider value={[sel.scale]} min={0.15} max={3} step={0.05}
                  onValueChange={([v]) => updateSel({ scale: v })} />
              </div>

              {/* Rotation */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Rotasi</span><span>{sel.rotation}°</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateSel({ rotation: (sel.rotation - 15 + 360) % 360 })}
                    className="w-7 h-7 rounded-full bg-muted hover:bg-border flex items-center justify-center transition-colors shrink-0">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <Slider value={[sel.rotation]} min={0} max={360} step={5}
                    onValueChange={([v]) => updateSel({ rotation: v })} className="flex-1" />
                  <button onClick={() => updateSel({ rotation: (sel.rotation + 15) % 360 })}
                    className="w-7 h-7 rounded-full bg-muted hover:bg-border flex items-center justify-center transition-colors shrink-0">
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Opacity */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Transparansi</span><span>{Math.round(sel.opacity * 100)}%</span>
                </div>
                <Slider value={[sel.opacity]} min={0.05} max={1} step={0.05}
                  onValueChange={([v]) => updateSel({ opacity: v })} />
              </div>

              {/* Flip + Layer */}
              <div className="grid grid-cols-2 gap-1.5">
                <button onClick={() => updateSel({ flipX: !sel.flipX })}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl border text-xs font-medium transition-colors ${sel.flipX ? "bg-primary/10 border-primary text-primary" : "border-border hover:bg-muted"}`}>
                  <FlipHorizontal className="w-3.5 h-3.5" /> Cermin H
                </button>
                <button onClick={() => updateSel({ flipY: !sel.flipY })}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl border text-xs font-medium transition-colors ${sel.flipY ? "bg-primary/10 border-primary text-primary" : "border-border hover:bg-muted"}`}>
                  <FlipVertical className="w-3.5 h-3.5" /> Cermin V
                </button>
                <button onClick={() => moveLayer(1)}
                  className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted transition-colors">
                  <ChevronUp className="w-3.5 h-3.5" /> Ke Depan
                </button>
                <button onClick={() => moveLayer(-1)}
                  className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted transition-colors">
                  <ChevronDown className="w-3.5 h-3.5" /> Ke Belakang
                </button>
              </div>
            </div>
          )}

          {/* Photo adjustments */}
          <div className="bg-card border border-border rounded-3xl p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Foto</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Sun className="w-3 h-3" /> Kecerahan</span>
                <span>{brightness}%</span>
              </div>
              <Slider value={[brightness]} min={40} max={180} step={5}
                onValueChange={([v]) => setBrightness(v)} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Contrast className="w-3 h-3" /> Kontras</span>
                <span>{contrast}%</span>
              </div>
              <Slider value={[contrast]} min={40} max={180} step={5}
                onValueChange={([v]) => setContrast(v)} />
            </div>
          </div>

          {/* Save */}
          <button
            disabled={isProcessing || !bgReady}
            onClick={() => { setSelectedId(null); setSavePending(true); }}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold rounded-full py-3.5 text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isProcessing ? "Menyimpan..." : "Simpan Foto"}
          </button>
        </div>
      </div>

      {/* Sticker Catalog Sheet */}
      {catalogOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setCatalogOpen(false)} />
          <div className="relative bg-background border border-border rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 pb-3 border-b border-border shrink-0">
              <div>
                <p className="font-black text-lg tracking-tight">Pilih Stiker</p>
                <p className="text-xs text-muted-foreground">{catalog.length} stiker tersedia</p>
              </div>
              <button onClick={() => setCatalogOpen(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              {catalogLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {catalog.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => addSticker(c)}
                      className="group flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border border-border hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <div className="w-full aspect-square rounded-xl bg-muted overflow-hidden flex items-center justify-center">
                        <img src={c.imageUrl} alt={c.stickerName} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-200" />
                      </div>
                      <span className="text-[11px] font-medium text-center leading-tight line-clamp-2">{c.stickerName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { FabricImage } from "fabric";
import {
  ArrowLeft,
  Brush,
  Download,
  Layers,
  Loader2,
  MousePointer2,
  Redo2,
  Save,
  SlidersHorizontal,
  Sticker,
  Type,
  Undo2,
  Crop,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip } from "@/components/motion/tooltip";
import { KbdCombo } from "@/components/motion/kbd";
import { Camera } from "@/components/camera/Camera";
import { cn } from "@/lib/utils";
import { useCanvasEditor } from "./useCanvasEditor";
import { AdjustPanel, CanvasPanel, DrawPanel, LayersPanel, ObjectPanel, StickerPanel, TextPanel } from "./EditorPanels";
import type { EditorMode, FormalData, FrameData, ToolId } from "./types";

export interface EditorResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
}

interface PhotoEditorProps {
  mode: EditorMode;
  photos: string[];
  frame?: FrameData | null;
  formal?: FormalData | null;
  saving?: boolean;
  onSave: (result: EditorResult) => void;
  onBack: () => void;
}

const TOOLS: { id: ToolId; label: string; icon: typeof Brush; key: string }[] = [
  { id: "select", label: "Pilih", icon: MousePointer2, key: "v" },
  { id: "adjust", label: "Filter", icon: SlidersHorizontal, key: "f" },
  { id: "sticker", label: "Stiker", icon: Sticker, key: "s" },
  { id: "text", label: "Teks", icon: Type, key: "t" },
  { id: "draw", label: "Kuas", icon: Brush, key: "b" },
  { id: "canvas", label: "Kanvas", icon: Crop, key: "c" },
  { id: "layers", label: "Layer", icon: Layers, key: "l" },
];

const MODE_TITLE: Record<EditorMode, string> = {
  frame: "Photobox",
  sticker: "Sticker Pic",
  formal: "Foto Formal",
};

export function PhotoEditor({ mode, photos, frame, formal, saving, onSave, onBack }: PhotoEditorProps) {
  const { canvasElRef, stageRef, ...ed } = useCanvasEditor({ mode, photos, frame, formal });
  const [tool, setTool] = useState<ToolId>("adjust");
  const [retakeTarget, setRetakeTarget] = useState<FabricImage | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts. Ignored while typing in inputs or editing canvas text.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))) return;
      const editingText = (ed.active as unknown as { isEditing?: boolean } | null)?.isEditing;
      if (editingText) return;
      const mod = e.metaKey || e.ctrlKey;
      const k = e.key.toLowerCase();

      if (mod && k === "z" && !e.shiftKey) { e.preventDefault(); void ed.undo(); return; }
      if (mod && ((k === "z" && e.shiftKey) || k === "y")) { e.preventDefault(); void ed.redo(); return; }
      if (mod && k === "d") { e.preventDefault(); void ed.duplicateActive(); return; }
      if (mod) return;

      if ((k === "delete" || k === "backspace") && ed.active) { e.preventDefault(); ed.deleteActive(); return; }
      if (k === "escape") { ed.select(null); setTool("select"); return; }
      if (k.startsWith("arrow") && ed.active) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        ed.nudgeActive(k === "arrowleft" ? -step : k === "arrowright" ? step : 0, k === "arrowup" ? -step : k === "arrowdown" ? step : 0);
        return;
      }
      if (k === "]") { ed.reorder("up"); return; }
      if (k === "[") { ed.reorder("down"); return; }
      if (el?.tagName === "BUTTON" && (k === " " || k === "enter")) return;
      const t = TOOLS.find((x) => x.key === k);
      if (t) setTool(t.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ed]);

  const download = async () => {
    setDownloading(true);
    try {
      const { dataUrl } = await ed.exportImage("png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `pbox-${mode}-${Date.now()}.png`;
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  // JPEG keeps shared files small (a 2400px PNG photo is ~5 MB); downloads stay PNG.
  const save = async () => {
    const result = await ed.exportImage("jpeg");
    onSave(result);
  };

  const back = () => (ed.canUndo ? setConfirmLeave(true) : onBack());

  // Roving arrow-key focus inside the tool rail.
  const onToolbarKey = (e: React.KeyboardEvent) => {
    if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    e.stopPropagation();
    const idx = TOOLS.findIndex((t) => t.id === tool);
    const next =
      e.key === "Home" ? 0 : e.key === "End" ? TOOLS.length - 1 : (idx + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1) + TOOLS.length) % TOOLS.length;
    setTool(TOOLS[next].id);
    toolbarRef.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  };

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-[560px] flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center gap-2 border-b-2 border-border bg-card px-3 py-2 sm:px-4">
        <Button variant="ghost" size="sm" onClick={back} aria-label="Kembali">
          <ArrowLeft /> <span className="hidden sm:inline">Kembali</span>
        </Button>
        <div className="mr-auto min-w-0">
          <p className="font-pixel text-[0.55rem] uppercase text-primary">Stage 3 · Edit</p>
          <p className="truncate font-display text-lg font-bold leading-tight">{MODE_TITLE[mode]}{frame ? ` · ${frame.name}` : formal ? ` · ${formal.name}` : ""}</p>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip content={<span className="flex items-center gap-2">Undo <KbdCombo keys={["mod", "z"]} size="sm" /></span>}>
            <button type="button" onClick={() => void ed.undo()} disabled={!ed.canUndo} aria-label="Undo" className="grid size-11 place-items-center rounded-sm hover:bg-muted disabled:opacity-35">
              <Undo2 className="size-5" />
            </button>
          </Tooltip>
          <Tooltip content={<span className="flex items-center gap-2">Redo <KbdCombo keys={["mod", "shift", "z"]} size="sm" /></span>}>
            <button type="button" onClick={() => void ed.redo()} disabled={!ed.canRedo} aria-label="Redo" className="grid size-11 place-items-center rounded-sm hover:bg-muted disabled:opacity-35">
              <Redo2 className="size-5" />
            </button>
          </Tooltip>
          <span className="hidden w-14 text-center font-mono text-xl text-muted-foreground md:inline" aria-label={`Zoom ${Math.round(ed.zoom * 100)} persen`}>
            {Math.round(ed.zoom * 100)}%
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={() => void download()} disabled={!ed.ready || downloading} className="hidden sm:inline-flex">
          {downloading ? <Loader2 className="animate-spin" /> : <Download />} Unduh
        </Button>
        <Button size="sm" onClick={() => void save()} disabled={!ed.ready || saving}>
          {saving ? <Loader2 className="animate-spin" /> : <Save />} Simpan
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Tool rail */}
        <div
          ref={toolbarRef}
          role="toolbar"
          aria-label="Alat editor"
          aria-orientation="vertical"
          onKeyDown={onToolbarKey}
          className="order-last flex shrink-0 gap-1 overflow-x-auto scrollbar-none border-t-2 border-border bg-card p-2 lg:order-none lg:w-20 lg:flex-col lg:overflow-visible lg:border-r-2 lg:border-t-0"
        >
          {TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              tabIndex={tool === t.id ? 0 : -1}
              aria-pressed={tool === t.id}
              onClick={() => setTool(t.id)}
              title={`${t.label} (${t.key.toUpperCase()})`}
              className={cn(
                "flex min-h-14 min-w-16 flex-col items-center justify-center gap-1 rounded-sm border-2 border-transparent px-2 text-xs font-semibold transition-colors hover:bg-muted",
                tool === t.id && "border-ink bg-primary text-primary-foreground shadow-arcade-sm hover:bg-primary",
              )}
            >
              <t.icon className="size-5" aria-hidden />
              {t.label}
            </button>
          ))}
        </div>

        {/* Stage */}
        <div className="relative min-h-0 flex-1 bg-muted bg-arcade-grid">
          <div ref={stageRef} className="absolute inset-0 grid place-items-center overflow-hidden">
            <div
              className={cn("relative border-2 border-ink shadow-arcade-lg", ed.ready ? "opacity-100" : "opacity-0")}
              role="img"
              aria-label="Kanvas foto. Pilih objek lewat panel Layer, geser dengan tombol panah."
            >
              <canvas ref={canvasElRef} />
            </div>
          </div>
          {!ed.ready && !ed.error && (
            <div className="absolute inset-0 grid place-items-center">
              <p className="flex items-center gap-3 font-pixel text-xs text-primary">
                <Loader2 className="size-5 animate-spin" aria-hidden /> LOADING…
              </p>
            </div>
          )}
          {ed.error && (
            <div className="absolute inset-0 grid place-items-center p-6 text-center">
              <div className="arcade-panel max-w-sm space-y-3 p-6">
                <p className="font-pixel text-xs text-destructive">ERROR</p>
                <p className="text-sm">{ed.error}</p>
                <Button variant="outline" onClick={onBack}>Kembali</Button>
              </div>
            </div>
          )}
        </div>

        {/* Inspector */}
        <aside aria-label="Panel pengaturan" className="max-h-[42dvh] shrink-0 overflow-y-auto border-t-2 border-border bg-card lg:max-h-none lg:w-[340px] lg:border-l-2 lg:border-t-0">
          {ed.ready && (
            <>
              {tool !== "layers" && tool !== "draw" && <ObjectPanel ed={ed} />}
              {tool === "select" && !ed.active && (
                <div className="p-4 text-sm text-muted-foreground">
                  Klik objek di kanvas untuk memilih. Pintasan: <KbdCombo keys={["mod", "z"]} size="sm" /> undo, <KbdCombo keys={["delete"]} size="sm" /> hapus, panah untuk geser.
                </div>
              )}
              {tool === "adjust" && <AdjustPanel ed={ed} mode={mode} />}
              {tool === "sticker" && <StickerPanel ed={ed} />}
              {tool === "text" && <TextPanel ed={ed} />}
              {tool === "draw" && <DrawPanel ed={ed} />}
              {tool === "canvas" && <CanvasPanel ed={ed} mode={mode} formal={formal} onRetake={setRetakeTarget} />}
              {tool === "layers" && <LayersPanel ed={ed} />}
            </>
          )}
        </aside>
      </div>

      <Dialog open={!!retakeTarget} onOpenChange={(o) => !o && setRetakeTarget(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Ambil ulang foto</DialogTitle>
            <DialogDescription>Foto baru menggantikan isi slot ini. Filter yang sudah dipasang tetap dipakai.</DialogDescription>
          </DialogHeader>
          {retakeTarget && (
            <Camera
              compact
              shots={1}
              onComplete={([img]) => {
                const t = retakeTarget;
                setRetakeTarget(null);
                if (img && t) void ed.replacePhoto(t, img, { recover: true });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmLeave} onOpenChange={setConfirmLeave}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Keluar dari editor?</DialogTitle>
            <DialogDescription>Editan yang belum disimpan akan hilang. Unduh dulu kalau masih mau menyimpannya.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmLeave(false)}>Lanjut edit</Button>
            <Button variant="destructive" onClick={() => { setConfirmLeave(false); onBack(); }}>Keluar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PhotoEditor;

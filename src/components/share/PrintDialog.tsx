"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Printer, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type PrintKind = "frame" | "sticker" | "formal";
type Orientation = "portrait" | "landscape";
type Layout = "single" | "strip" | "tile";

interface Preset {
  id: string;
  label: string;
  hint: string;
  /** Paper size in mm, portrait. */
  paper: [number, number];
  layout: Layout;
  /** Tile size in mm for pas foto layouts. */
  tile?: [number, number];
  kinds: PrintKind[];
  /** CUPS media name used by the booth printer. */
  media: string;
}

const R4: [number, number] = [101.6, 152.4];

const PRESETS: Preset[] = [
  { id: "4r", label: "4R · 4×6 in", hint: "Satu foto penuh", paper: R4, layout: "single", kinds: ["frame", "sticker", "formal"], media: "w288h432" },
  { id: "strip", label: "Strip 2×6 in ×2", hint: "Dua strip di kertas 4×6, potong di tengah", paper: R4, layout: "strip", kinds: ["frame", "sticker"], media: "w288h432" },
  { id: "a6", label: "A6", hint: "105×148 mm", paper: [105, 148], layout: "single", kinds: ["frame", "sticker", "formal"], media: "A6" },
  { id: "pas23", label: "Pas foto 2×3 cm", hint: "Disusun di kertas 4R", paper: R4, layout: "tile", tile: [20, 30], kinds: ["formal"], media: "w288h432" },
  { id: "pas34", label: "Pas foto 3×4 cm", hint: "Disusun di kertas 4R", paper: R4, layout: "tile", tile: [30, 40], kinds: ["formal"], media: "w288h432" },
  { id: "pas46", label: "Pas foto 4×6 cm", hint: "Disusun di kertas 4R", paper: R4, layout: "tile", tile: [40, 60], kinds: ["formal"], media: "w288h432" },
];

const TILE_MARGIN = 4;
const TILE_GAP = 2;

interface BoothStatus {
  enabled: boolean;
  printer?: { name: string | null; ready: boolean };
}

function paperSize(preset: Preset, orientation: Orientation): [number, number] {
  const [w, h] = preset.paper;
  return orientation === "portrait" ? [w, h] : [h, w];
}

function pct(value: number, total: number) {
  return `${(value / total) * 100}%`;
}

function Sheet({
  imageUrl,
  preset,
  orientation,
  cover = false,
  style,
  className,
}: {
  imageUrl: string;
  preset: Preset;
  orientation: Orientation;
  /** Fill the area and crop edges instead of letterboxing. */
  cover?: boolean;
  style?: CSSProperties;
  className?: string;
}) {
  const [pw, ph] = paperSize(preset, orientation);
  const base = "absolute block h-full w-full";
  const fit = cover ? "inset-0 object-cover" : "inset-0 object-contain";

  let content: React.ReactNode;
  if (preset.layout === "single") {
    content = (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt="" className={cn(base, fit)} />
    );
  } else if (preset.layout === "strip") {
    const vertical = orientation === "portrait";
    content = (
      <>
        {[0, 1].map((i) => (
          <div
            key={i}
            className="absolute overflow-hidden"
            style={vertical ? { left: `${i * 50}%`, top: 0, width: "50%", height: "100%" } : { top: `${i * 50}%`, left: 0, height: "50%", width: "100%" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="" className={cn(base, fit)} />
          </div>
        ))}
        <div
          aria-hidden
          className="absolute border-dashed border-neutral-500"
          style={vertical ? { left: "50%", top: 0, height: "100%", borderLeftWidth: 1 } : { top: "50%", left: 0, width: "100%", borderTopWidth: 1 }}
        />
      </>
    );
  } else {
    const [tw, th] = preset.tile!;
    const cols = Math.max(1, Math.floor((pw - 2 * TILE_MARGIN + TILE_GAP) / (tw + TILE_GAP)));
    const rows = Math.max(1, Math.floor((ph - 2 * TILE_MARGIN + TILE_GAP) / (th + TILE_GAP)));
    const x0 = (pw - (cols * tw + (cols - 1) * TILE_GAP)) / 2;
    const y0 = (ph - (rows * th + (rows - 1) * TILE_GAP)) / 2;
    content = Array.from({ length: rows * cols }, (_, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      return (
        <div
          key={i}
          className="absolute overflow-hidden outline outline-1 outline-neutral-400"
          style={{
            left: pct(x0 + c * (tw + TILE_GAP), pw),
            top: pct(y0 + r * (th + TILE_GAP), ph),
            width: pct(tw, pw),
            height: pct(th, ph),
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className={cn(base, "inset-0 object-cover")} />
        </div>
      );
    });
  }

  return (
    <div className={cn("relative overflow-hidden bg-white", className)} style={style}>
      {content}
    </div>
  );
}

export function PrintDialog({
  imageUrl,
  kind,
  open,
  onOpenChange,
}: {
  imageUrl: string;
  kind: PrintKind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const presets = useMemo(() => PRESETS.filter((p) => p.kinds.includes(kind)), [kind]);
  const [presetId, setPresetId] = useState(kind === "formal" ? "pas34" : "4r");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [cover, setCover] = useState(false);
  const [copies, setCopies] = useState(1);
  const [printing, setPrinting] = useState(false);
  const [booth, setBooth] = useState<BoothStatus | null>(null);
  const [boothState, setBoothState] = useState<{ busy: boolean; message: string | null }>({ busy: false, message: null });

  const preset = presets.find((p) => p.id === presetId) ?? presets[0];
  const [pw, ph] = paperSize(preset, orientation);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/booth/status", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: BoothStatus) => !cancelled && setBooth(data))
      .catch(() => !cancelled && setBooth(null));
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!printing) return;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setPrinting(false);
    };
    window.addEventListener("afterprint", finish);

    const run = async () => {
      const images = Array.from(document.querySelectorAll<HTMLImageElement>(".pbox-print-root img"));
      await Promise.all(images.map((img) => img.decode().catch(() => undefined)));
      window.print();
      // Some browsers never fire afterprint; print() blocks until the dialog closes in most of them.
      setTimeout(finish, 500);
    };
    const frame = requestAnimationFrame(() => void run());
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("afterprint", finish);
    };
  }, [printing]);

  const sendToBooth = useCallback(async () => {
    setBoothState({ busy: true, message: null });
    try {
      const res = await fetch("/api/booth/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, copies, media: preset.media }),
      });
      const data = await res.json().catch(() => ({}));
      setBoothState({
        busy: false,
        message: res.ok ? `Terkirim ke printer booth (job ${data.job ?? "-"}).` : (data.error ?? "Printer booth gagal."),
      });
    } catch {
      setBoothState({ busy: false, message: "Printer booth tidak dapat dihubungi." });
    }
  }, [copies, imageUrl, preset.media]);

  const boothReady = Boolean(booth?.enabled && booth.printer?.ready);
  // The booth agent prints one image with fit-to-page, so tiled layouts go through the browser.
  const boothSupportsLayout = preset.layout === "single";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92dvh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-pixel text-sm uppercase">Cetak foto</DialogTitle>
            <DialogDescription>Pilih ukuran kertas, lihat pratinjau, lalu cetak lewat dialog printer browser.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-[1fr_minmax(0,16rem)]">
            <div className="space-y-5">
              <fieldset>
                <legend className="mb-2 text-sm font-semibold">Ukuran</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {presets.map((p) => (
                    <label
                      key={p.id}
                      className={cn(
                        "flex min-h-11 cursor-pointer flex-col justify-center rounded-sm border-2 px-3 py-2 text-sm has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                        p.id === preset.id ? "border-primary bg-primary/10" : "border-border hover:bg-muted",
                      )}
                    >
                      <input
                        type="radio"
                        name="print-preset"
                        value={p.id}
                        checked={p.id === preset.id}
                        onChange={() => setPresetId(p.id)}
                        className="sr-only"
                      />
                      <span className="font-bold">{p.label}</span>
                      <span className="text-xs text-muted-foreground">{p.hint}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-wrap gap-6">
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold">Orientasi</legend>
                  <div className="flex gap-2">
                    {(["portrait", "landscape"] as const).map((o) => (
                      <label
                        key={o}
                        className={cn(
                          "flex min-h-11 cursor-pointer items-center rounded-sm border-2 px-3 text-sm has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                          o === orientation ? "border-primary bg-primary/10" : "border-border hover:bg-muted",
                        )}
                      >
                        <input
                          type="radio"
                          name="print-orientation"
                          value={o}
                          checked={o === orientation}
                          onChange={() => setOrientation(o)}
                          className="sr-only"
                        />
                        {o === "portrait" ? "Tegak" : "Mendatar"}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="print-copies" className="mb-2 block text-sm font-semibold">
                    Jumlah salinan
                  </label>
                  <input
                    id="print-copies"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={10}
                    value={copies}
                    onChange={(e) => setCopies(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
                    className="min-h-11 w-24 rounded-sm border-2 border-border bg-background px-3 font-mono text-lg"
                  />
                </div>

                {preset.layout !== "tile" && (
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 self-end text-sm">
                    <input type="checkbox" className="size-5" checked={cover} onChange={(e) => setCover(e.target.checked)} />
                    Isi penuh (potong tepi)
                  </label>
                )}
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                Atur skala printer ke 100% atau &ldquo;Ukuran sebenarnya&rdquo;. Cetak tanpa dialog hanya bisa di mode kiosk, misalnya Chrome
                dengan <code className="font-mono text-sm">--kiosk-printing</code>.
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <p className="self-start text-sm font-semibold">Pratinjau</p>
              <div className="grid w-full place-items-center rounded-sm border-2 border-border bg-muted p-3">
                <Sheet
                  imageUrl={imageUrl}
                  preset={preset}
                  orientation={orientation}
                  cover={cover}
                  className="h-auto max-h-[46dvh] w-full max-w-full shadow-arcade"
                  style={{ aspectRatio: `${pw} / ${ph}`, width: pw > ph ? "100%" : `min(100%, calc(46dvh * ${pw / ph}))` }}
                />
              </div>
              <p className="font-mono text-base text-muted-foreground">
                {Math.round(pw * 10) / 10} × {Math.round(ph * 10) / 10} mm
              </p>
            </div>
          </div>

          {boothState.message && (
            <p role="status" className="text-sm">
              {boothState.message}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            {boothReady && (
              <Button
                type="button"
                variant="secondary"
                onClick={sendToBooth}
                disabled={boothState.busy || !boothSupportsLayout}
                title={boothSupportsLayout ? undefined : "Tata letak ini dicetak lewat dialog browser"}
              >
                <Send aria-hidden />
                {boothState.busy ? "Mengirim..." : "Kirim ke printer booth"}
              </Button>
            )}
            <Button type="button" onClick={() => setPrinting(true)} disabled={printing}>
              <Printer aria-hidden />
              Cetak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {printing &&
        createPortal(
          <div className="pbox-print-root print-sheet" aria-hidden>
            <style>{`
@page { size: ${pw}mm ${ph}mm; margin: 0; }
.pbox-print-root { position: fixed !important; left: -200vw; top: 0; }
@media print {
  body > *:not(.pbox-print-root) { display: none !important; }
  .pbox-print-root { position: static !important; left: auto; }
  .pbox-print-root .pbox-page { break-after: page; }
  .pbox-print-root .pbox-page:last-child { break-after: auto; }
}`}</style>
            {Array.from({ length: copies }, (_, i) => (
              <Sheet
                key={i}
                imageUrl={imageUrl}
                preset={preset}
                orientation={orientation}
                cover={cover}
                className="pbox-page"
                style={{ width: `${pw}mm`, height: `${ph}mm` }}
              />
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

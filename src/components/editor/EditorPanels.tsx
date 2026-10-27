"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { FabricImage, IText } from "fabric";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  FlipHorizontal2,
  FlipVertical2,
  ImagePlus,
  Loader2,
  Lock,
  RotateCcw,
  RotateCw,
  Trash2,
  Unlock,
  Wand2,
  Camera as CameraIcon,
  Frame as FrameIcon,
  Image as ImageIcon,
  Type,
  Brush,
  Sticker as StickerIcon,
  Square,
} from "lucide-react";
import { RangeSlider } from "@/components/motion/range-slider";
import { SegmentedControl } from "@/components/motion/segmented-control";
import { ColorPickerPopover } from "@/components/motion/color-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FILTER_PRESETS, type PboxObject } from "./fabric-utils";
import { removeBackground } from "./segment";
import type { CanvasEditor } from "./useCanvasEditor";
import { DEFAULT_ADJUST, type EditorMode, type FormalData, type LayerRole, type PhotoAdjust, type StickerItem } from "./types";

export const ARCADE_SWATCHES = ["#ffd23f", "#ff3d7f", "#3ef0ff", "#9cff3a", "#f5efe0", "#0b0820", "#7b5cff", "#ff8a3d"];
const FORMAL_COLORS = [
  { label: "Merah", value: "#b3122e" },
  { label: "Biru", value: "#1f4fa3" },
  { label: "Biru muda", value: "#8fc3ea" },
  { label: "Putih", value: "#ffffff" },
  { label: "Abu", value: "#c9c9c9" },
];
const FONTS = [
  { value: "Press Start 2P", label: "Press Start" },
  { value: "Pixelify Sans Variable", label: "Pixelify" },
  { value: "VT323", label: "VT323" },
  { value: "GeistSans", label: "Geist" },
];

/* ─── Small building blocks ─────────────────────────────── */

export function PanelSection({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="border-b-2 border-border p-4 last:border-b-0">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-pixel text-[0.6rem] uppercase text-primary">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, children }: { label: string; value?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        {value !== undefined && <span className="font-mono text-lg leading-none text-muted-foreground">{value}</span>}
      </div>
      {children}
    </div>
  );
}

function IconAction({ label, onClick, children, disabled, danger }: { label: string; onClick: () => void; children: ReactNode; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-11 place-items-center rounded-sm border-2 border-border bg-card transition-colors hover:bg-muted disabled:opacity-40",
        danger && "text-destructive hover:bg-destructive hover:text-destructive-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Swatches({ value, onChange, colors = ARCADE_SWATCHES, label }: { value: string; onChange: (c: string) => void; colors?: string[]; label: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label={label}>
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value.toLowerCase() === c.toLowerCase()}
          aria-label={c}
          onClick={() => onChange(c)}
          className={cn(
            "size-8 rounded-sm border-2 border-ink shadow-arcade-sm transition-transform hover:-translate-y-0.5",
            value.toLowerCase() === c.toLowerCase() && "outline-3 outline-offset-2 outline-ring",
          )}
          style={{ background: c }}
        />
      ))}
      <ColorPickerPopover value={value || "#ffffff"} onChange={onChange} label="Warna lain" swatches={[]} className="h-9 rounded-sm border-2" />
    </div>
  );
}

/* ─── Object inspector (active selection) ───────────────── */

const ROLE_LABEL: Record<LayerRole, string> = {
  photo: "Foto",
  frame: "Frame",
  background: "Latar",
  sticker: "Stiker",
  text: "Teks",
  drawing: "Coretan",
  shape: "Bentuk",
};

export function ObjectPanel({ ed }: { ed: CanvasEditor }) {
  const o = ed.active;
  if (!o) return null;
  const role = o.pboxRole;
  const removable = role && ["sticker", "text", "drawing", "shape"].includes(role);
  const locked = !!o.lockMovementX;

  return (
    <PanelSection title={`Objek · ${role ? ROLE_LABEL[role] : "Grup"}`}>
      <div className="grid grid-cols-5 gap-2">
        <IconAction label="Putar kiri 90°" onClick={() => ed.rotateActive(-90)} disabled={locked}><RotateCcw /></IconAction>
        <IconAction label="Putar kanan 90°" onClick={() => ed.rotateActive(90)} disabled={locked}><RotateCw /></IconAction>
        <IconAction label="Balik horizontal" onClick={() => ed.flipActive("x")}><FlipHorizontal2 /></IconAction>
        <IconAction label="Balik vertikal" onClick={() => ed.flipActive("y")}><FlipVertical2 /></IconAction>
        <IconAction label={locked ? "Buka kunci" : "Kunci posisi"} onClick={() => ed.toggleLock(o)}>{locked ? <Unlock /> : <Lock />}</IconAction>
        <IconAction label="Naikkan lapisan" onClick={() => ed.reorder("up")}><ArrowUp /></IconAction>
        <IconAction label="Turunkan lapisan" onClick={() => ed.reorder("down")}><ArrowDown /></IconAction>
        <IconAction label="Duplikat" onClick={() => void ed.duplicateActive()} disabled={!removable}><Copy /></IconAction>
        <IconAction label="Hapus" onClick={ed.deleteActive} disabled={!removable} danger><Trash2 /></IconAction>
        {role === "photo" && (
          <IconAction
            label="Atur ulang posisi foto"
            onClick={() => {
              const img = o as unknown as FabricImage;
              void ed.replacePhoto(img, img.getSrc(), { recover: true });
            }}
          >
            <Square />
          </IconAction>
        )}
      </div>
      <div className="mt-4">
        <Field label="Opasitas" value={`${Math.round((o.opacity ?? 1) * 100)}%`}>
          <RangeSlider
            aria-label="Opasitas objek"
            min={10}
            max={100}
            step={1}
            showTicks={false}
            value={Math.round((o.opacity ?? 1) * 100)}
            onValueChange={(v) => ed.updateActive({ opacity: v / 100 })}
            formatValueText={(v) => `${v}%`}
          />
        </Field>
      </div>
      {role === "photo" && (
        <p className="mt-3 text-sm text-muted-foreground">Seret foto untuk menggeser isi slot. Tarik sudut untuk zoom.</p>
      )}
    </PanelSection>
  );
}

/* ─── Filter & adjustments ──────────────────────────────── */

const SLIDERS: { key: keyof Omit<PhotoAdjust, "preset">; label: string; min: number; max: number }[] = [
  { key: "brightness", label: "Kecerahan", min: -100, max: 100 },
  { key: "contrast", label: "Kontras", min: -100, max: 100 },
  { key: "saturation", label: "Saturasi", min: -100, max: 100 },
  { key: "hue", label: "Rona", min: -100, max: 100 },
  { key: "blur", label: "Blur", min: 0, max: 100 },
  { key: "noise", label: "Grain", min: 0, max: 100 },
  { key: "pixelate", label: "Pixel", min: 0, max: 100 },
];

export function AdjustPanel({ ed, mode }: { ed: CanvasEditor; mode: EditorMode }) {
  // Adjustments live on the photo objects, so selection changes and undo stay in sync for free.
  const adjust = ed.getAdjustTarget();
  const multi = mode === "frame" && ed.getPhotos().length > 1;
  const [applyAll, setApplyAll] = useState(true);

  const change = (next: PhotoAdjust) => ed.setAdjust(next, multi ? applyAll : true);

  return (
    <>
      <PanelSection
        title="Filter"
        action={
          <button type="button" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline" onClick={() => change({ ...DEFAULT_ADJUST })}>
            Reset
          </button>
        }
      >
        {multi && (
          <label className="mb-3 flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" className="size-5 accent-[var(--primary)]" checked={applyAll} onChange={(e) => setApplyAll(e.target.checked)} />
            Terapkan ke semua foto
            {!applyAll && <span className="text-muted-foreground">(pilih foto di kanvas)</span>}
          </label>
        )}
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Preset filter">
          {FILTER_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={adjust.preset === p.id}
              onClick={() => change({ ...adjust, preset: p.id })}
              className={cn(
                "flex flex-col items-stretch gap-1.5 rounded-sm border-2 border-border bg-card p-1.5 text-left transition-transform hover:-translate-y-0.5",
                adjust.preset === p.id && "border-primary shadow-arcade-sm",
              )}
            >
              <span className="h-10 rounded-[2px] border-2 border-ink" style={{ background: p.swatch }} aria-hidden />
              <span className="truncate text-xs font-semibold">{p.label}</span>
            </button>
          ))}
        </div>
      </PanelSection>
      <PanelSection title="Atur manual">
        <div className="space-y-4">
          {SLIDERS.map((s) => (
            <Field key={s.key} label={s.label} value={String(adjust[s.key])}>
              <RangeSlider
                aria-label={s.label}
                min={s.min}
                max={s.max}
                step={1}
                showTicks={false}
                value={adjust[s.key]}
                onValueChange={(v) => change({ ...adjust, [s.key]: v })}
              />
            </Field>
          ))}
        </div>
      </PanelSection>
    </>
  );
}

/* ─── Stickers ───────────────────────────────────────────── */

let stickerCache: StickerItem[] | null = null;

export function StickerPanel({ ed }: { ed: CanvasEditor }) {
  const [items, setItems] = useState<StickerItem[] | null>(stickerCache);
  const [failed, setFailed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (stickerCache) return;
    fetch("/api/sticker-catalog")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: StickerItem[]) => {
        stickerCache = data;
        setItems(data);
      })
      .catch(() => setFailed(true));
  }, []);

  return (
    <PanelSection
      title="Stiker"
      action={
        <>
          <button type="button" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline" onClick={() => fileRef.current?.click()}>
            Unggah PNG
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void ed.addSticker(URL.createObjectURL(f), f.name.replace(/\.[^.]+$/, ""));
              e.target.value = "";
            }}
          />
        </>
      }
    >
      {failed && <p className="text-sm text-destructive">Katalog stiker gagal dimuat. Kamu tetap bisa mengunggah PNG sendiri.</p>}
      {!items && !failed && (
        <div className="grid place-items-center py-10"><Loader2 className="size-6 animate-spin text-primary" aria-label="Memuat stiker" /></div>
      )}
      {items && (
        <ul className="grid grid-cols-4 gap-2">
          {items.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => void ed.addSticker(s.imageUrl, s.stickerName)}
                className="grid aspect-square w-full place-items-center overflow-hidden rounded-sm border-2 border-border bg-muted p-1.5 transition-transform hover:-translate-y-0.5 hover:border-primary"
                aria-label={`Tambah stiker ${s.stickerName}`}
                title={s.stickerName}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.imageUrl} alt="" className="size-full object-contain" loading="lazy" draggable={false} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </PanelSection>
  );
}

/* ─── Text ──────────────────────────────────────────────── */

export function TextPanel({ ed }: { ed: CanvasEditor }) {
  const activeText = ed.active?.pboxRole === "text" ? (ed.active as unknown as IText & PboxObject) : null;
  const [draft, setDraft] = useState("PLAYER 1");
  const [font, setFont] = useState(FONTS[0].value);
  const [fill, setFill] = useState("#ffd23f");
  const [outline, setOutline] = useState(true);

  const fontValue = activeText ? String(activeText.fontFamily) : font;
  const fillValue = activeText ? String(activeText.fill) : fill;
  const outlined = activeText ? !!activeText.strokeWidth && activeText.stroke !== null : outline;

  return (
    <PanelSection title={activeText ? "Teks terpilih" : "Tambah teks"}>
      <div className="space-y-4">
        {!activeText && (
          <div className="flex gap-2">
            <label className="sr-only" htmlFor="new-text">Isi teks</label>
            <input
              id="new-text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={80}
              className="min-h-11 w-full rounded-sm border-2 border-border bg-input px-3 text-base"
            />
            <Button onClick={() => void ed.addText({ text: draft || "TEKS", fontFamily: font, fill, stroke: outline ? "#0b0820" : undefined })}>
              Tambah
            </Button>
          </div>
        )}
        {activeText && <p className="text-sm text-muted-foreground">Klik dua kali teks di kanvas untuk mengetik ulang.</p>}

        <Field label="Font">
          <SegmentedControl
            aria-label="Font"
            fullWidth
            size="sm"
            value={fontValue}
            options={FONTS.map((f) => ({ value: f.value, label: f.label }))}
            onValueChange={(v) => {
              setFont(v);
              if (activeText) {
                void document.fonts?.load(`32px "${v}"`).finally(() => ed.updateActive({ fontFamily: v }));
              }
            }}
          />
        </Field>

        {activeText && (
          <Field label="Ukuran" value={String(Math.round(activeText.fontSize ?? 0))}>
            <RangeSlider
              aria-label="Ukuran teks"
              min={10}
              max={240}
              step={1}
              showTicks={false}
              value={Math.round(activeText.fontSize ?? 40)}
              onValueChange={(v) => ed.updateActive({ fontSize: v })}
            />
          </Field>
        )}

        <Field label="Warna">
          <Swatches
            label="Warna teks"
            value={fillValue}
            onChange={(c) => {
              setFill(c);
              if (activeText) ed.updateActive({ fill: c });
            }}
          />
        </Field>

        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="size-5"
            checked={outlined}
            onChange={(e) => {
              setOutline(e.target.checked);
              if (activeText) ed.updateActive(e.target.checked ? { stroke: "#0b0820", strokeWidth: Math.max(2, Math.round((activeText.fontSize ?? 40) / 12)) } : { stroke: null, strokeWidth: 0 });
            }}
          />
          Garis tepi gelap (lebih terbaca di atas foto)
        </label>

        {activeText && (
          <Field label="Rata">
            <SegmentedControl
              aria-label="Perataan teks"
              fullWidth
              size="sm"
              value={String(activeText.textAlign ?? "center")}
              options={[
                { value: "left", label: "Kiri" },
                { value: "center", label: "Tengah" },
                { value: "right", label: "Kanan" },
              ]}
              onValueChange={(v) => ed.updateActive({ textAlign: v })}
            />
          </Field>
        )}
      </div>
    </PanelSection>
  );
}

/* ─── Draw ──────────────────────────────────────────────── */

export function DrawPanel({ ed }: { ed: CanvasEditor }) {
  const [color, setColor] = useState("#ff3d7f");
  const [width, setWidth] = useState(12);

  useEffect(() => {
    ed.setDrawing(true, color, width);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, width]);
  useEffect(() => () => ed.setDrawing(false), [ed.setDrawing]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PanelSection title="Kuas">
      <p className="mb-4 text-sm text-muted-foreground">Gambar bebas di atas foto. Salah gores? Tekan undo.</p>
      <div className="space-y-4">
        <Field label="Warna">
          <Swatches label="Warna kuas" value={color} onChange={setColor} />
        </Field>
        <Field label="Tebal" value={`${width}px`}>
          <RangeSlider aria-label="Tebal kuas" min={2} max={60} step={1} showTicks={false} value={width} onValueChange={setWidth} />
        </Field>
      </div>
    </PanelSection>
  );
}

/* ─── Canvas / mode specific ────────────────────────────── */

const ASPECTS = [
  { value: "orig", label: "Asli", ratio: null },
  { value: "1:1", label: "1:1", ratio: 1 },
  { value: "4:5", label: "4:5", ratio: 4 / 5 },
  { value: "9:16", label: "9:16", ratio: 9 / 16 },
  { value: "16:9", label: "16:9", ratio: 16 / 9 },
];

export function CanvasPanel({
  ed,
  mode,
  formal,
  onRetake,
}: {
  ed: CanvasEditor;
  mode: EditorMode;
  formal?: FormalData | null;
  onRetake: (target: FabricImage) => void;
}) {
  const [aspect, setAspect] = useState("orig");
  const [bgColor, setBgColor] = useState(mode === "formal" ? "" : "#0b0820");
  const [segState, setSegState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<FabricImage | null>(null);
  const photos = ed.getPhotos();

  const pickFile = (target: FabricImage) => {
    replaceTarget.current = target;
    fileRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          const t = replaceTarget.current;
          if (f && t) void ed.replacePhoto(t, URL.createObjectURL(f), { recover: true });
          e.target.value = "";
        }}
      />

      {mode === "sticker" && (
        <PanelSection title="Potong rasio">
          <SegmentedControl
            aria-label="Rasio kanvas"
            fullWidth
            size="sm"
            value={aspect}
            options={ASPECTS.map((a) => ({ value: a.value, label: a.label }))}
            onValueChange={(v) => {
              setAspect(v);
              ed.setAspect(ASPECTS.find((a) => a.value === v)?.ratio ?? null);
            }}
          />
          <p className="mt-3 text-sm text-muted-foreground">4:5 cocok untuk feed, 9:16 untuk story.</p>
        </PanelSection>
      )}

      {mode === "formal" && formal && (
        <>
          <PanelSection title="Ukuran pas foto">
            <div className="grid grid-cols-2 gap-2">
              {formal.sizes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={ed.formalSize?.id === s.id}
                  onClick={() => ed.setFormalSize(s)}
                  className={cn(
                    "min-h-11 rounded-sm border-2 border-border bg-card px-2 text-sm font-semibold",
                    ed.formalSize?.id === s.id && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </PanelSection>
          <PanelSection title="Warna latar">
            <Swatches
              label="Warna latar formal"
              colors={FORMAL_COLORS.map((c) => c.value)}
              value={bgColor}
              onChange={(c) => {
                setBgColor(c);
                ed.setBackgroundColor(c);
              }}
            />
          </PanelSection>
          <PanelSection title="Hapus latar foto">
            <p className="mb-3 text-sm text-muted-foreground">
              Memisahkan orang dari latar kamera langsung di perangkatmu (tidak diunggah). Hasil terbaik dengan latar polos dan cahaya rata.
            </p>
            <Button
              variant="secondary"
              className="w-full"
              disabled={segState === "busy" || !photos[0]}
              onClick={async () => {
                const target = photos[0];
                if (!target) return;
                setSegState("busy");
                try {
                  const url = await removeBackground(target.getSrc());
                  await ed.replacePhoto(target, url);
                  setSegState("done");
                } catch (err) {
                  console.error(err);
                  setSegState("error");
                }
              }}
            >
              {segState === "busy" ? <Loader2 className="animate-spin" /> : <Wand2 />}
              {segState === "busy" ? "Memproses…" : "Hapus latar"}
            </Button>
            <p className="mt-2 min-h-5 text-sm" aria-live="polite">
              {segState === "done" && <span className="text-neon-lime">Latar dihapus. Undo untuk membatalkan.</span>}
              {segState === "error" && <span className="text-destructive">Gagal memproses. Browser ini mungkin tidak mendukung WebGL/WASM.</span>}
            </p>
          </PanelSection>
        </>
      )}

      {mode !== "formal" && (
        <PanelSection title="Warna dasar">
          <Swatches label="Warna dasar kanvas" value={bgColor} onChange={(c) => { setBgColor(c); ed.setBackgroundColor(c); }} />
        </PanelSection>
      )}

      <PanelSection title={mode === "frame" ? "Foto per slot" : "Foto"}>
        <ul className="space-y-2">
          {photos.map((p, i) => (
            <li key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => ed.select(p)}
                className="flex min-h-11 flex-1 items-center gap-2 rounded-sm border-2 border-border bg-card px-3 text-left text-sm font-semibold hover:bg-muted"
              >
                <ImageIcon className="size-4" aria-hidden /> {(p as unknown as PboxObject).pboxName ?? `Foto ${i + 1}`}
              </button>
              <IconAction label={`Ambil ulang ${(p as unknown as PboxObject).pboxName ?? ""}`} onClick={() => onRetake(p)}><CameraIcon /></IconAction>
              <IconAction label={`Ganti dari file ${(p as unknown as PboxObject).pboxName ?? ""}`} onClick={() => pickFile(p)}><ImagePlus /></IconAction>
            </li>
          ))}
        </ul>
      </PanelSection>
    </>
  );
}

/* ─── Layers ────────────────────────────────────────────── */

const ROLE_ICON: Record<LayerRole, typeof ImageIcon> = {
  photo: ImageIcon,
  frame: FrameIcon,
  background: Square,
  sticker: StickerIcon,
  text: Type,
  drawing: Brush,
  shape: Square,
};

export function LayersPanel({ ed }: { ed: CanvasEditor }) {
  const list = [...ed.objects].reverse();
  return (
    <PanelSection title={`Layer · ${list.length}`}>
      <ol className="space-y-1.5">
        {list.map((o, i) => {
          const role = o.pboxRole ?? "shape";
          const Icon = ROLE_ICON[role];
          const isActive = ed.active === o;
          const fixed = role === "frame" || role === "background";
          return (
            <li key={i} className={cn("flex items-center gap-1.5 rounded-sm border-2 bg-card p-1", isActive ? "border-primary" : "border-border")}>
              <button
                type="button"
                disabled={!o.selectable}
                onClick={() => ed.select(o)}
                className="flex min-h-10 min-w-0 flex-1 items-center gap-2 px-2 text-left text-sm disabled:cursor-default"
                aria-current={isActive ? "true" : undefined}
              >
                <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className={cn("truncate", !o.visible && "text-muted-foreground line-through")}>{o.pboxName ?? ROLE_LABEL[role]}</span>
              </button>
              <button type="button" className="grid size-10 place-items-center rounded-sm hover:bg-muted" onClick={() => ed.toggleVisible(o)} aria-label={o.visible ? `Sembunyikan ${o.pboxName}` : `Tampilkan ${o.pboxName}`}>
                {o.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </button>
              {!fixed && (
                <button type="button" className="grid size-10 place-items-center rounded-sm hover:bg-muted" onClick={() => ed.toggleLock(o)} aria-label={o.lockMovementX ? `Buka kunci ${o.pboxName}` : `Kunci ${o.pboxName}`}>
                  {o.lockMovementX ? <Lock className="size-4" /> : <Unlock className="size-4 text-muted-foreground" />}
                </button>
              )}
              <button type="button" className="grid size-10 place-items-center rounded-sm hover:bg-muted" onClick={() => ed.reorder("up", o)} aria-label={`Naikkan ${o.pboxName}`}>
                <ArrowUp className="size-4" />
              </button>
              <button type="button" className="grid size-10 place-items-center rounded-sm hover:bg-muted" onClick={() => ed.reorder("down", o)} aria-label={`Turunkan ${o.pboxName}`}>
                <ArrowDown className="size-4" />
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-sm text-muted-foreground">Urutan atas = paling depan. Frame bisa diturunkan kalau stiker perlu di belakangnya.</p>
    </PanelSection>
  );
}

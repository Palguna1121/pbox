"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ExternalLink, Loader2, RotateCcw } from "lucide-react";
import { Camera } from "@/components/camera/Camera";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ShareActions } from "@/components/share/ShareActions";
import { cn } from "@/lib/utils";
import type { EditorResult } from "@/components/editor/PhotoEditor";
import type { EditorMode, FormalData, FrameData } from "@/components/editor/types";

// fabric touches the DOM on import, so the editor only loads in the browser.
const PhotoEditor = dynamic(() => import("@/components/editor/PhotoEditor"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[60vh] place-items-center">
      <Loader2 className="size-8 animate-spin text-primary" aria-label="Memuat editor" />
    </div>
  ),
});

type Step = "select" | "capture" | "edit" | "result";

interface CatalogCard {
  id: string;
  name: string;
  imageUrl: string;
}

interface SavedResult {
  imageUrl: string;
  shareUrl: string;
  shareToken: string;
}

const MODE_LABEL: Record<EditorMode, string> = {
  frame: "Photobox",
  sticker: "Sticker Pic",
  formal: "Foto Formal",
};

const STAGES: { id: Step; label: string }[] = [
  { id: "select", label: "Pilih" },
  { id: "capture", label: "Foto" },
  { id: "edit", label: "Edit" },
  { id: "result", label: "Hasil" },
];

function parseMode(v: string | null): EditorMode {
  return v === "frame" || v === "formal" ? v : "sticker";
}

/* ─── Stage HUD ──────────────────────────────────────────── */

function StageBar({ step, mode }: { step: Step; mode: EditorMode }) {
  const stages = mode === "sticker" ? STAGES.filter((s) => s.id !== "select") : STAGES;
  const current = stages.findIndex((s) => s.id === step);
  return (
    <nav aria-label="Tahap sesi foto" className="mx-auto w-full max-w-5xl px-4 pt-6 sm:px-6">
      <ol className="flex items-center gap-2">
        {stages.map((s, i) => (
          <li key={s.id} className="flex flex-1 items-center gap-2" aria-current={i === current ? "step" : undefined}>
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-sm border-2 font-pixel text-[0.6rem]",
                i < current && "border-ink bg-neon-lime text-[#0b0820]",
                i === current && "border-ink bg-primary text-primary-foreground shadow-arcade-sm",
                i > current && "border-border text-muted-foreground",
              )}
            >
              {i + 1}
            </span>
            <span className={cn("hidden text-sm font-semibold sm:inline", i !== current && "text-muted-foreground")}>{s.label}</span>
            {i < stages.length - 1 && <span className={cn("h-0.5 flex-1", i < current ? "bg-neon-lime" : "bg-border")} aria-hidden />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ─── Catalog pickers ────────────────────────────────────── */

function Picker({
  mode,
  onPick,
}: {
  mode: "frame" | "formal";
  onPick: (id: string) => void;
}) {
  const [items, setItems] = useState<CatalogCard[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const url = mode === "frame" ? "/api/frame-catalog" : "/api/formal-pictures";
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Record<string, string>[]) =>
        setItems(
          data.map((d) => ({
            id: d.id,
            name: mode === "frame" ? d.frameName : d.name,
            imageUrl: mode === "frame" ? d.imageUrl : d.backgroundUrl,
          })),
        ),
      )
      .catch(() => setFailed(true));
  }, [mode]);

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <p className="font-pixel mb-3 text-[0.6rem] uppercase text-primary">Stage 1</p>
      <h1 className="font-display text-4xl font-bold tracking-tight">{mode === "frame" ? "Pilih frame" : "Pilih latar formal"}</h1>
      <p className="mt-2 max-w-[60ch] text-muted-foreground">
        {mode === "frame"
          ? "Jumlah jepretan mengikuti jumlah slot di frame. Frame bisa diganti nanti dengan mengulang sesi."
          : "Warna latar masih bisa diganti di editor, termasuk merah, biru, dan putih untuk dokumen."}
      </p>
      {failed && <p className="mt-6 text-destructive">Katalog gagal dimuat. Muat ulang halaman untuk mencoba lagi.</p>}
      {!items && !failed && (
        <div className="grid place-items-center py-20"><Loader2 className="size-8 animate-spin text-primary" aria-label="Memuat katalog" /></div>
      )}
      {items && (
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((it) => (
            <li key={it.id}>
              <button
                type="button"
                onClick={() => onPick(it.id)}
                className="group w-full overflow-hidden rounded-md border-2 border-border bg-card text-left shadow-arcade transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-primary"
              >
                <span className={cn("relative block aspect-[3/4] w-full border-b-2 border-border", mode === "frame" ? "frame-preview" : "bg-muted")}>
                  <Image src={it.imageUrl} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" />
                </span>
                <span className="block p-3 text-sm font-semibold">{it.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ─── Flow ───────────────────────────────────────────────── */

function CameraFlow() {
  const params = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const mode = parseMode(params.get("type"));
  const frameId = params.get("frameId");
  const formalId = params.get("formalId");

  const [frame, setFrame] = useState<FrameData | null>(null);
  const [formal, setFormal] = useState<FormalData | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<SavedResult | null>(null);
  const [session, setSession] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const needsSelect = (mode === "frame" && !frameId) || (mode === "formal" && !formalId);
  const loading = (mode === "frame" && !!frameId && !frame) || (mode === "formal" && !!formalId && !formal);

  const step: Step = needsSelect ? "select" : saved ? "result" : photos.length ? "edit" : "capture";

  useEffect(() => {
    if (mode === "frame" && frameId) {
      fetch(`/api/frames/${frameId}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then(setFrame)
        .catch(() => setLoadError("Frame tidak ditemukan."));
    }
    if (mode === "formal" && formalId) {
      fetch(`/api/formal-picture/${formalId}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then(setFormal)
        .catch(() => setLoadError("Latar formal tidak ditemukan."));
    }
  }, [mode, frameId, formalId]);

  const setParam = (key: string, value: string | null) => {
    setLoadError(null);
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/camera?${next.toString()}`);
  };

  const shots = mode === "frame" ? Math.max(1, frame?.positions.length ?? 1) : 1;

  const save = async (result: EditorResult) => {
    setSaving(true);
    try {
      const body = new FormData();
      body.append("file", result.blob, `pbox-${mode}.jpg`);
      body.append("type", mode);
      body.append("itemId", frame?.id ?? formal?.id ?? "");
      const res = await fetch("/api/images", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan foto");
      setSaved({ imageUrl: data.imageUrl, shareUrl: data.shareUrl, shareToken: data.shareToken });
      window.scrollTo({ top: 0 });
    } catch (err) {
      toast({ title: "Foto belum tersimpan", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const restart = () => {
    setSaved(null);
    setPhotos([]);
    setSession((s) => s + 1);
  };

  if (loadError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="font-pixel text-xs text-destructive">ERROR</p>
        <p className="mt-3">{loadError}</p>
        <Button className="mt-6" onClick={() => setParam(mode === "frame" ? "frameId" : "formalId", null)}>Pilih ulang</Button>
      </div>
    );
  }

  if (step === "edit") {
    return (
      <PhotoEditor
        key={session}
        mode={mode}
        photos={photos}
        frame={frame}
        formal={formal}
        saving={saving}
        onSave={save}
        onBack={() => setPhotos([])}
      />
    );
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-arcade-grid pb-16">
      <StageBar step={step} mode={mode} />

      {step === "select" && <Picker mode={mode as "frame" | "formal"} onPick={(id) => setParam(mode === "frame" ? "frameId" : "formalId", id)} />}

      {step === "capture" && (
        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          {mode !== "sticker" && (
            <button
              type="button"
              onClick={() => setParam(mode === "frame" ? "frameId" : "formalId", null)}
              className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" /> Ganti {mode === "frame" ? "frame" : "latar"}
            </button>
          )}
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div>
              <p className="font-pixel mb-3 text-[0.6rem] uppercase text-primary">{MODE_LABEL[mode]} · Stage {mode === "sticker" ? 1 : 2}</p>
              <h1 className="font-display text-4xl font-bold tracking-tight">
                {shots > 1 ? `${shots} jepretan, siap?` : "Siap difoto?"}
              </h1>
              <p className="mb-6 mt-2 max-w-[60ch] text-muted-foreground">
                Ada hitung mundur sebelum tiap jepretan. Foto yang kurang pas bisa diambil ulang satu per satu.
              </p>
              {loading ? (
                <div className="grid aspect-video place-items-center rounded-md border-2 border-border bg-card">
                  <Loader2 className="size-8 animate-spin text-primary" aria-label="Memuat" />
                </div>
              ) : (
                <Camera key={`${session}-${shots}`} shots={shots} onComplete={setPhotos} />
              )}
            </div>
            {(frame || formal) && (
              <aside className="arcade-panel h-fit p-4">
                <p className="font-pixel mb-3 text-[0.55rem] uppercase text-muted-foreground">{frame ? "Frame" : "Latar"}</p>
                <div className={cn("relative aspect-[3/4] overflow-hidden rounded-sm border-2 border-border", frame ? "frame-preview" : "bg-muted")}>
                  <Image src={frame?.imageUrl ?? formal!.backgroundUrl} alt="" fill sizes="260px" className="object-cover" />
                </div>
                <p className="mt-3 font-semibold">{frame?.name ?? formal?.name}</p>
                {frame && <p className="font-mono text-lg text-muted-foreground">{shots} SLOT</p>}
              </aside>
            )}
          </div>
        </section>
      )}

      {step === "result" && saved && (
        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
            <div className="relative overflow-hidden rounded-md border-2 border-ink bg-card shadow-arcade-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={saved.imageUrl} alt="Hasil foto yang baru disimpan" className="w-full" />
            </div>
            <div>
              <p className="font-pixel text-[0.6rem] uppercase text-neon-lime">Stage clear</p>
              <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">Foto tersimpan</h1>
              <p className="mt-2 text-muted-foreground">
                Siapa pun yang punya tautan bisa melihat foto ini. Halaman share tidak diindeks mesin pencari.
              </p>
              <div className="mt-6">
                <ShareActions
                  imageUrl={saved.imageUrl}
                  shareUrl={typeof window !== "undefined" ? new URL(saved.shareUrl, window.location.origin).toString() : saved.shareUrl}
                  fileName={`pbox-${mode}.jpg`}
                  kind={mode}
                />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="outline" asChild>
                  <Link href={saved.shareUrl}><ExternalLink /> Halaman share + QR</Link>
                </Button>
                <Button variant="secondary" onClick={restart}><RotateCcw /> Main lagi</Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default function CameraPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[60vh] place-items-center">
          <Loader2 className="size-8 animate-spin text-primary" aria-label="Memuat" />
        </div>
      }
    >
      <CameraFlow />
    </Suspense>
  );
}

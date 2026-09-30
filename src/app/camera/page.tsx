"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Camera } from "@/components/camera/Camera";
import FrameEditor from "@/components/camera/FrameEditor";
import StickerEditor from "@/components/camera/StickerEditor";
import FormalEditor from "@/components/camera/FormalEditor";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import Image from "next/image";

/* ─── Types ──────────────────────────────────────────────── */
interface FrameItem {
  id: string;
  name: string;
  imageUrl: string;
  positions: { id: string; x: number; y: number; width: number; height: number }[];
}

interface StickerCatalogItem {
  id: string;
  stickerName: string;
  imageUrl: string;
}

interface FormalItem {
  id: string;
  name: string;
  backgroundUrl: string;
  sizes: { id: string; name: string; width: number; height: number; dpi: number }[];
}

interface FrameCatalogItem {
  id: string;
  frameName: string;
  imageUrl: string;
}

type Step =
  | "capture"
  | "pick-frame"
  | "pick-formal"
  | "edit-frame"
  | "edit-sticker"
  | "edit-formal";

/* ─── Picker: Frame ─────────────────────────────────────── */
function FramePicker({
  onPick,
  onBack,
}: {
  onPick: (frame: FrameItem) => void;
  onBack: () => void;
}) {
  const [frames, setFrames] = React.useState<FrameCatalogItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [picking, setPicking] = React.useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    fetch("/api/frame-catalog")
      .then((r) => r.json())
      .then(setFrames)
      .catch(() => toast({ title: "Gagal memuat frame", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  const handlePick = async (f: FrameCatalogItem) => {
    setPicking(f.id);
    try {
      const res = await fetch(`/api/frames/${f.id}`);
      const data: FrameItem = await res.json();
      onPick(data);
    } catch {
      toast({ title: "Gagal memuat frame", variant: "destructive" });
    } finally {
      setPicking(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Foto ulang
      </button>
      <div className="mb-6">
        <p className="text-primary font-semibold text-xs uppercase tracking-widest mb-1">Langkah 2</p>
        <h2 className="text-3xl font-black tracking-tighter">Pilih <span className="text-primary">Frame</span></h2>
        <p className="text-muted-foreground text-sm mt-1">Foto sudah diambil. Sekarang pilih frame yang kamu suka.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {frames.map((f) => (
            <button
              key={f.id}
              onClick={() => handlePick(f)}
              disabled={picking === f.id}
              className="group relative bg-card border border-border rounded-3xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left disabled:opacity-70"
            >
              <div className="frame-preview relative aspect-[3/4] w-full">
                <Image src={f.imageUrl} alt={f.frameName} fill sizes="25vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-3">
                <p className="font-bold text-sm leading-tight">{f.frameName}</p>
              </div>
              {picking === f.id && (
                <div className="absolute inset-0 bg-background/70 flex items-center justify-center rounded-3xl">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Picker: Formal ────────────────────────────────────── */
function FormalPicker({
  onPick,
  onBack,
}: {
  onPick: (f: FormalItem) => void;
  onBack: () => void;
}) {
  const [list, setList] = React.useState<FormalItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    fetch("/api/formal-pictures")
      .then((r) => r.json())
      .then(setList)
      .catch(() => toast({ title: "Gagal memuat background", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Foto ulang
      </button>
      <div className="mb-6">
        <p className="text-primary font-semibold text-xs uppercase tracking-widest mb-1">Langkah 2</p>
        <h2 className="text-3xl font-black tracking-tighter">Pilih <span className="text-primary">Background</span></h2>
        <p className="text-muted-foreground text-sm mt-1">Pilih background foto formal yang sesuai.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {list.map((f) => (
            <button
              key={f.id}
              onClick={() => onPick(f)}
              className="group bg-card border border-border rounded-3xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left"
            >
              <div className="relative aspect-[3/4] w-full bg-muted">
                <Image src={f.backgroundUrl} alt={f.name} fill sizes="25vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-3">
                <p className="font-bold text-sm">{f.name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Capture Step ──────────────────────────────────────── */
function CaptureStep({ type, onCapture }: { type: string; onCapture: (src: string) => void }) {
  const labelMap: Record<string, string> = {
    frame: "Photobox",
    sticker: "Sticker Pic",
    formal: "Foto Formal",
  };
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <p className="text-primary font-semibold text-xs uppercase tracking-widest mb-1">
          {labelMap[type] ?? "Studio"} — Langkah 1
        </p>
        <h2 className="text-3xl font-black tracking-tighter">
          Ambil <span className="text-primary">Foto</span>
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {type === "frame" && "Setelah foto, kamu akan memilih frame."}
          {type === "sticker" && "Setelah foto, kamu bisa menambahkan berbagai stiker."}
          {type === "formal" && "Setelah foto, kamu akan memilih background formal."}
        </p>
      </div>
      <Camera onCapture={onCapture} countdown={5} />
    </div>
  );
}

/* ─── Save Helper ───────────────────────────────────────── */
async function saveImage(processedImage: string, type: string, itemId: string): Promise<string> {
  const res = await fetch("/api/images", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: processedImage, type, itemId }),
  });
  if (!res.ok) throw new Error("Gagal menyimpan gambar");
  const data = await res.json();
  return data.imageUrl as string;
}

/* ─── Main Page ─────────────────────────────────────────── */
function CameraFlow() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "sticker";
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("capture");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [frameData, setFrameData] = useState<FrameItem | null>(null);
  const [formalData, setFormalData] = useState<FormalItem | null>(null);
  const [processing, setProcessing] = useState(false);
  const [savedImages, setSavedImages] = useState<string[]>([]);

  const handleCapture = (src: string) => {
    setCapturedImage(src);
    if (type === "frame") setStep("pick-frame");
    else if (type === "sticker") setStep("edit-sticker");
    else setStep("pick-formal");
  };

  const handlePickFrame = (frame: FrameItem) => {
    setFrameData(frame);
    setStep("edit-frame");
  };

  const handlePickFormal = (formal: FormalItem) => {
    setFormalData(formal);
    setStep("edit-formal");
  };

  const handleSave = async (processedImage: string, itemId: string) => {
    setProcessing(true);
    try {
      const url = await saveImage(processedImage, type, itemId);
      setSavedImages((p) => [...p, url]);
      toast({ title: "Foto berhasil disimpan! ✨" });
      // Reset for another shot
      setCapturedImage(null);
      setFrameData(null);
      setFormalData(null);
      setStep("capture");
    } catch (err: any) {
      toast({ title: "Gagal menyimpan", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {savedImages.length > 0 && step === "capture" && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3 flex items-center gap-3">
            <span className="text-primary text-sm font-semibold">{savedImages.length} foto tersimpan</span>
            <a
              href={`/result?images=${savedImages.join(",")}`}
              className="ml-auto text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-semibold hover:bg-primary/90 transition-colors"
            >
              Lihat Hasil
            </a>
          </div>
        </div>
      )}

      {step === "capture" && <CaptureStep type={type} onCapture={handleCapture} />}

      {step === "pick-frame" && (
        <FramePicker onPick={handlePickFrame} onBack={() => { setCapturedImage(null); setStep("capture"); }} />
      )}

      {step === "pick-formal" && (
        <FormalPicker onPick={handlePickFormal} onBack={() => { setCapturedImage(null); setStep("capture"); }} />
      )}

      {step === "edit-frame" && capturedImage && frameData && (
        <FrameEditor
          capturedImage={capturedImage}
          frameData={frameData}
          onSave={(img) => handleSave(img, frameData.id)}
          onBack={() => setStep("pick-frame")}
          isProcessing={processing}
        />
      )}

      {step === "edit-sticker" && capturedImage && (
        <StickerEditor
          capturedImage={capturedImage}
          onSave={(img, id) => handleSave(img, id)}
          onBack={() => { setCapturedImage(null); setStep("capture"); }}
          isProcessing={processing}
        />
      )}

      {step === "edit-formal" && capturedImage && formalData && (
        <FormalEditor
          capturedImage={capturedImage}
          formalData={formalData}
          onSave={(img) => handleSave(img, formalData.id)}
          onBack={() => setStep("pick-formal")}
          isProcessing={processing}
        />
      )}
    </div>
  );
}

export default function CameraPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <CameraFlow />
    </Suspense>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { RotateCw } from "lucide-react";
import { PixelLabel } from "@/components/arcade/PageIntro";
import { NumberTicker } from "@/components/motion/number-ticker";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HoldDeleteButton } from "@/components/pages/HoldDeleteButton";

export interface UserImage {
  id: string;
  url: string;
  type: string;
  shareToken: string;
  createdAt: string;
  width: number | null;
  height: number | null;
}

type State =
  | { status: "loading" }
  | { status: "ready"; images: UserImage[] }
  | { status: "unauthorized" }
  | { status: "error" };

const TYPE_LABEL: Record<string, string> = { frame: "Frame", sticker: "Stiker", formal: "Formal" };

const dateFormat = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });

export function MyPhotos() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/images", { cache: "no-store" });
      if (res.status === 401) return setState({ status: "unauthorized" });
      if (!res.ok) return setState({ status: "error" });
      const data: { images?: UserImage[] } = await res.json();
      setState({ status: "ready", images: Array.isArray(data.images) ? data.images : [] });
    } catch {
      setState({ status: "error" });
    }
  }, []);

  // Fetch on mount; state updates happen after the request resolves.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const remove = (id: string) => {
    setState((prev) => (prev.status === "ready" ? { ...prev, images: prev.images.filter((img) => img.id !== id) } : prev));
    setNotice("Foto dihapus.");
  };

  const count = state.status === "ready" ? state.images.length : null;

  return (
    <section aria-labelledby="my-photos-title" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <PixelLabel className="text-primary">Galeri</PixelLabel>
          <h2 id="my-photos-title" className="font-display mt-2 text-3xl font-bold tracking-tight">
            Foto saya
          </h2>
        </div>
        {count !== null && count > 0 && (
          <p className="flex items-baseline gap-2 text-sm text-muted-foreground">
            <NumberTicker value={count} pad={3} className="font-mono text-4xl leading-none text-primary" />
            foto tersimpan
          </p>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {notice}
      </p>

      {state.status === "loading" && (
        <div role="status" aria-label="Memuat foto kamu" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="aspect-3/4 w-full border-2 border-border" />
          ))}
        </div>
      )}

      {state.status === "error" && (
        <div className="arcade-panel flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-pixel text-xs uppercase text-destructive">Gagal memuat</p>
            <p className="mt-2 text-sm text-muted-foreground">Daftar foto belum bisa diambil dari server.</p>
          </div>
          <Button variant="outline" onClick={() => { setState({ status: "loading" }); void load(); }}>
            <RotateCw aria-hidden="true" />
            Coba lagi
          </Button>
        </div>
      )}

      {state.status === "unauthorized" && (
        <div className="arcade-panel flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Sesi kamu berakhir. Masuk lagi untuk melihat foto yang tersimpan.</p>
          <Button asChild>
            <Link href="/login?callbackUrl=/dashboard">Masuk</Link>
          </Button>
        </div>
      )}

      {state.status === "ready" && state.images.length === 0 && (
        <div className="arcade-panel flex flex-col items-center gap-3 px-6 py-12 text-center">
          <p className="font-pixel text-xs uppercase text-primary">Belum ada skor</p>
          <p className="max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
            Foto yang kamu simpan dari editor saat sedang masuk akan muncul di sini, lengkap dengan tautan bagikan.
          </p>
          <Button asChild className="mt-2">
            <Link href="/photobox">Mulai sesi foto</Link>
          </Button>
        </div>
      )}

      {state.status === "ready" && state.images.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {state.images.map((img) => {
            const created = new Date(img.createdAt);
            const dateText = Number.isNaN(created.getTime()) ? "" : dateFormat.format(created);
            const typeLabel = TYPE_LABEL[img.type] ?? img.type;
            return (
              <li key={img.id} className="arcade-panel flex flex-col overflow-hidden">
                <Link
                  href={`/p/${img.shareToken}`}
                  className="group relative block aspect-3/4 overflow-hidden border-b-2 border-border bg-muted focus-visible:outline-offset-[-3px]"
                >
                  <Image
                    src={img.url}
                    alt={`Foto ${typeLabel.toLowerCase()}${dateText ? ` dari ${dateText}` : ""}`}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                  <span className="sr-only">Buka halaman bagikan</span>
                </Link>
                <div className="flex flex-1 flex-col gap-3 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                    <PixelLabel className="text-foreground">{typeLabel}</PixelLabel>
                    {dateText && (
                      <time dateTime={img.createdAt} className="font-mono text-lg leading-none text-muted-foreground">
                        {dateText}
                      </time>
                    )}
                  </div>
                  <HoldDeleteButton
                    endpoint={`/api/images/${img.id}`}
                    ariaLabel={`Hapus foto ${typeLabel.toLowerCase()}${dateText ? ` dari ${dateText}` : ""}`}
                    label="Tahan hapus"
                    onDeleted={() => remove(img.id)}
                    className="w-full"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

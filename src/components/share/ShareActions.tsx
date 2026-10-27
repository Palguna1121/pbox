"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/motion/copy-button";
import { PrintDialog, type PrintKind } from "@/components/share/PrintDialog";

interface ShareActionsProps {
  imageUrl: string;
  shareUrl: string;
  fileName: string;
  kind: PrintKind;
}

const SHARE_TEXT = "Hasil fotoku di PBOX";

export function ShareActions({ imageUrl, shareUrl, fileName, kind }: ShareActionsProps) {
  const [printOpen, setPrintOpen] = useState(false);
  const [canShareFile, setCanShareFile] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);

  // Fetch the file ahead of time: navigator.share must run inside the click's user activation.
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.canShare) return;
    let cancelled = false;
    fetch(imageUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], fileName, { type: blob.type || "image/png" });
        if (!cancelled && navigator.canShare({ files: [file] })) {
          fileRef.current = file;
          setCanShareFile(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [imageUrl, fileName]);

  const shareFile = async () => {
    if (!fileRef.current) return;
    try {
      await navigator.share({ files: [fileRef.current], title: "Foto PBOX", text: SHARE_TEXT, url: shareUrl });
      setStatus(null);
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") setStatus("Gagal membuka menu bagikan. Pakai tautan di bawah.");
    }
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(SHARE_TEXT);
  const intents = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${shareUrl}`)}` },
    { label: "X", href: `https://x.com/intent/post?text=${encodedText}&url=${encodedUrl}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: "Telegram", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <a href={imageUrl} download={fileName}>
            <Download aria-hidden />
            Unduh
          </a>
        </Button>
        {canShareFile && (
          <Button type="button" size="lg" variant="secondary" onClick={shareFile}>
            <Share2 aria-hidden />
            Bagikan
          </Button>
        )}
        <Button type="button" size="lg" variant="outline" onClick={() => setPrintOpen(true)}>
          <Printer aria-hidden />
          Cetak
        </Button>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Kirim tautan</p>
        <ul className="flex flex-wrap gap-2">
          {intents.map((intent) => (
            <li key={intent.label}>
              <Button asChild variant="outline" size="sm">
                <a href={intent.href} target="_blank" rel="noopener noreferrer">
                  {intent.label}
                  <span className="sr-only"> (tab baru)</span>
                </a>
              </Button>
            </li>
          ))}
          <li>
            <CopyButton
              value={shareUrl}
              showLabel
              variant="outline"
              size="md"
              labels={{ idle: "Salin tautan", copied: "Tersalin", error: "Gagal menyalin" }}
            />
          </li>
        </ul>
      </div>

      {status && (
        <p role="status" className="text-sm text-muted-foreground">
          {status}
        </p>
      )}

      <PrintDialog imageUrl={imageUrl} kind={kind} open={printOpen} onOpenChange={setPrintOpen} />
    </div>
  );
}

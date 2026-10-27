import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { site, siteUrl } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { PixelLabel } from "@/components/arcade/PageIntro";
import { ShareActions } from "@/components/share/ShareActions";
import type { PrintKind } from "@/components/share/PrintDialog";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<PrintKind, string> = {
  frame: "Photobox",
  sticker: "Sticker Pic",
  formal: "Foto Formal",
};

const getImage = cache(async (token: string) => {
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(token)) return null;
  return prisma.image.findUnique({
    where: { shareToken: token },
    select: { url: true, type: true, shareToken: true, createdAt: true, width: true, height: true, mimeType: true },
  });
});

function toKind(type: string): PrintKind {
  return type === "sticker" || type === "formal" ? type : "frame";
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const image = await getImage(token);
  if (!image) return { title: "Foto tidak ditemukan", robots: { index: false, follow: false } };

  const title = "Foto PBOX";
  const description = `Hasil ${KIND_LABEL[toKind(image.type)]} dari ${site.name}. Buka untuk mengunduh, membagikan, atau mencetak.`;
  const ogImage = {
    url: siteUrl(image.url),
    width: image.width ?? undefined,
    height: image.height ?? undefined,
    alt: "Foto hasil PBOX",
    type: image.mimeType ?? undefined,
  };

  return {
    title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: `/p/${image.shareToken}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: siteUrl(`/p/${image.shareToken}`),
      siteName: site.name,
      locale: site.locale,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: ogImage.url, alt: ogImage.alt }],
    },
  };
}

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const image = await getImage(token);
  if (!image) notFound();

  const kind = toKind(image.type);
  const shareUrl = siteUrl(`/p/${image.shareToken}`);
  const ext = image.url.split(".").pop() || "png";
  const qr = await QRCode.toDataURL(shareUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 320,
    color: { dark: "#0b0820", light: "#ffffff" },
  });
  const taken = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(
    image.createdAt,
  );

  return (
    <main className="bg-arcade-grid">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:py-14">
        <section aria-labelledby="result-title" className="arcade-panel crt-lines relative overflow-hidden bg-card p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <PixelLabel className="text-primary">Player 1 result</PixelLabel>
            <PixelLabel className="text-neon-cyan">{KIND_LABEL[kind]}</PixelLabel>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.url}
            alt={`Foto hasil ${KIND_LABEL[kind]} dari PBOX`}
            width={image.width ?? undefined}
            height={image.height ?? undefined}
            className="mx-auto block h-auto max-h-[78dvh] w-auto max-w-full border-2 border-ink bg-muted object-contain"
          />
        </section>

        <div className="space-y-8">
          <header>
            <p className="font-pixel mb-3 text-[0.65rem] uppercase text-primary">Stage clear</p>
            <h1 id="result-title" className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl">
              Fotomu sudah jadi
            </h1>
            <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-muted-foreground">
              Unduh file aslinya, kirim tautan ke teman, atau cetak langsung. Diambil {taken} WIB.
            </p>
          </header>

          <ShareActions imageUrl={image.url} shareUrl={shareUrl} fileName={`pbox-${image.shareToken}.${ext}`} kind={kind} />

          <section aria-labelledby="qr-title" className="arcade-panel flex flex-col gap-4 bg-card p-4 sm:flex-row sm:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="Kode QR menuju halaman foto ini" width={160} height={160} className="size-40 shrink-0 border-2 border-ink bg-white" />
            <div>
              <h2 id="qr-title" className="font-pixel text-[0.65rem] uppercase text-coin">
                Scan untuk unduh
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Arahkan kamera ponsel ke kode ini untuk membuka foto di ponselmu. Siapa pun yang punya tautan ini bisa melihat fotonya.
              </p>
            </div>
          </section>

          <Button asChild variant="ghost">
            <Link href="/">Main lagi</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

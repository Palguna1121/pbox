import Image from "next/image";
import Link from "next/link";
import { Camera, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MotionReveal } from "@/components/MotionReveal";

const FACTS = [
  { value: "3", label: "mode foto" },
  { value: "0", label: "aplikasi dipasang" },
  { value: "4R", label: "siap cetak" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b-2 border-border bg-arcade-grid">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:pb-24 lg:pt-20">
        <MotionReveal>
          <p className="font-pixel inline-flex items-center gap-2 border-2 border-border bg-card px-3 py-2 text-[0.6rem] uppercase text-primary shadow-arcade-sm">
            <span className="size-2 animate-blink bg-neon-pink" aria-hidden /> Insert coin · 1 player
          </p>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[0.95] tracking-tight text-balance sm:text-6xl xl:text-7xl">
            Photobooth arcade, <span className="text-primary">langsung di browser.</span>
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted-foreground">
            Foto lewat webcam atau kamera booth, pasang frame, stiker, teks, dan filter retro. Setelah itu unduh, bagikan lewat QR, atau cetak 4R.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link href="/camera?type=sticker"><Camera /> Mulai foto</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/photobox"><LayoutGrid /> Lihat frame</Link>
            </Button>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-3">
            {FACTS.map((f) => (
              <div key={f.label} className="border-l-4 border-primary pl-3">
                <dt className="sr-only">{f.label}</dt>
                <dd className="font-mono text-4xl leading-none">{f.value}</dd>
                <dd className="mt-1 text-sm text-muted-foreground">{f.label}</dd>
              </div>
            ))}
          </dl>
        </MotionReveal>

        <MotionReveal delay={0.12}>
          <ArcadeCabinet />
        </MotionReveal>
      </div>
    </section>
  );
}

/** Decorative cabinet framing the hero photo like a CRT screen. */
function ArcadeCabinet() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="rounded-md border-2 border-ink bg-[#1a1538] p-3 shadow-arcade-lg sm:p-5">
        <div className="mb-3 flex items-center justify-between border-2 border-ink bg-[#ffd23f] px-3 py-2">
          <span className="font-pixel text-[0.6rem] text-[#0b0820]">PBOX</span>
          <span className="font-pixel text-[0.5rem] text-[#0b0820]">PHOTO · STAGE 1</span>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-sm border-4 border-[#05030f] bg-[#05030f]">
          <Image
            src="/images/pbox-hero.webp"
            alt="Tiga teman tertawa sambil berpose di depan kamera photobooth"
            fill
            priority
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover"
          />
          <div className="crt-lines absolute inset-0" aria-hidden />
          <div className="absolute inset-0 shadow-[inset_0_0_80px_rgb(0_0_0/0.65)]" aria-hidden />
          <div className="absolute inset-x-0 top-0 flex justify-between p-3 font-pixel text-[0.5rem] text-[#f5efe0]" aria-hidden>
            <span className="flex items-center gap-1.5"><span className="size-1.5 animate-blink bg-[#ff3d7f]" />REC</span>
            <span>SHOT 1/4</span>
          </div>
          <div className="absolute inset-x-0 bottom-3 text-center font-pixel text-xs text-[#ffd23f] text-outline" aria-hidden>
            PRESS START
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between px-2" aria-hidden>
          <div className="relative size-14">
            <span className="absolute inset-x-5 inset-y-0 rounded-sm bg-[#05030f]" />
            <span className="absolute inset-x-0 inset-y-5 rounded-sm bg-[#05030f]" />
          </div>
          <div className="flex gap-3">
            <span className="size-10 rounded-full border-2 border-ink bg-[#ff3d7f] shadow-arcade-sm" />
            <span className="size-10 rounded-full border-2 border-ink bg-[#3ef0ff] shadow-arcade-sm" />
            <span className="size-10 rounded-full border-2 border-ink bg-[#9cff3a] shadow-arcade-sm" />
          </div>
        </div>
      </div>
      <div className="absolute -right-3 -top-4 rotate-6 border-2 border-ink bg-neon-pink px-3 py-2 font-pixel text-[0.55rem] text-[#0b0820] shadow-arcade-sm sm:-right-6" aria-hidden>
        NEW HI-SCORE!
      </div>
    </div>
  );
}

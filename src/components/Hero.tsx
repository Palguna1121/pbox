import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Sticker, UserRound } from "lucide-react";
import { MotionReveal } from "@/components/MotionReveal";

const SERVICES = [
  {
    title: "Photobox",
    description: "Ambil foto lalu pilih frame untuk hasil yang terasa personal.",
    href: "/photobox",
    icon: Camera,
    featured: true,
  },
  {
    title: "Sticker Pic",
    description: "Atur stiker, posisi, dan warna sebelum menyimpan foto.",
    href: "/sticker-pic",
    icon: Sticker,
    featured: false,
  },
  {
    title: "Foto Formal",
    description: "Pilih latar dan ukuran untuk kebutuhan dokumen.",
    href: "/formal-pic",
    icon: UserRound,
    featured: false,
  },
];

export function Hero() {
  return (
    <>
      <section className="relative isolate flex min-h-[calc(100dvh-4rem)] items-end overflow-hidden bg-zinc-900 text-white">
        <Image
          src="/images/pbox-hero.webp"
          alt="Tiga teman berpose bersama di studio foto berlatar coral"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-950/45 to-zinc-950/10" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/65 via-transparent to-transparent" aria-hidden="true" />

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-24 sm:px-6 sm:pb-20 lg:pb-24">
          <MotionReveal>
            <p className="mb-5 text-sm font-semibold tracking-[0.16em] text-white/85 uppercase">Studio foto online</p>
            <h1 className="max-w-[11ch] text-balance text-5xl font-black leading-[0.98] tracking-tighter sm:text-6xl lg:text-7xl">
              Foto seru, sesukamu.
            </h1>
          </MotionReveal>
          <MotionReveal delay={0.09}>
            <p className="mt-6 max-w-[42ch] text-base leading-relaxed text-white/90 sm:text-lg">
              Pilih frame, tambahkan stiker, atau siapkan foto formal. Semua dari kamera browser.
            </p>
          </MotionReveal>
          <MotionReveal delay={0.16} className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/photobox"
              className="group inline-flex min-h-12 items-center gap-4 rounded-full bg-primary px-5 py-2 font-semibold text-primary-foreground shadow-[0_10px_32px_hsl(352_68%_25%_/_0.24)] transition-transform duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
            >
              Mulai photobox
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true">
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </span>
            </Link>
            <a href="#layanan" className="inline-flex min-h-11 items-center rounded-full px-3 font-semibold text-white underline decoration-white/55 underline-offset-4 transition-colors hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              Lihat layanan
            </a>
          </MotionReveal>
        </div>
      </section>

      <section id="layanan" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28" aria-labelledby="layanan-title">
        <MotionReveal className="mb-9 max-w-2xl">
          <h2 id="layanan-title" className="text-balance text-4xl font-black tracking-tighter sm:text-5xl">Pilih hasil yang kamu mau.</h2>
          <p className="mt-4 max-w-[55ch] text-base leading-relaxed text-muted-foreground">
            Setiap layanan memakai kamera yang sama. Pilih cara mengolah fotonya setelah mengambil gambar.
          </p>
        </MotionReveal>

        <div className="grid gap-4 lg:grid-cols-12">
          {SERVICES.map((service, index) => {
            const Icon = service.icon;
            return (
              <MotionReveal key={service.href} delay={index * 0.07} className={service.featured ? "lg:col-span-7 lg:row-span-2" : "lg:col-span-5"}>
                <Link
                  href={service.href}
                  className={service.featured
                    ? "group flex h-full min-h-72 flex-col justify-between rounded-[2rem] bg-primary p-7 text-primary-foreground transition-transform duration-200 ease-out hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 sm:p-9"
                    : "group flex h-full min-h-48 flex-col justify-between rounded-[2rem] bg-muted p-7 text-foreground transition-transform duration-200 ease-out hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 sm:p-9"}
                >
                  <div className="flex items-start justify-between gap-4">
                    <Icon className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
                    <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className={service.featured ? "text-3xl font-black tracking-tight sm:text-4xl" : "text-2xl font-bold tracking-tight"}>{service.title}</h3>
                    <p className={service.featured ? "mt-2 max-w-[36ch] text-sm leading-relaxed text-primary-foreground/90 sm:text-base" : "mt-2 max-w-[36ch] text-sm leading-relaxed text-muted-foreground sm:text-base"}>
                      {service.description}
                    </p>
                  </div>
                </Link>
              </MotionReveal>
            );
          })}
        </div>
      </section>
    </>
  );
}

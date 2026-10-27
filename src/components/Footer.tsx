import Link from "next/link";
import { Logo } from "@/components/arcade/Logo";

const GROUPS = [
  {
    title: "Mode",
    links: [
      { label: "Photobox", href: "/photobox" },
      { label: "Sticker Pic", href: "/sticker-pic" },
      { label: "Foto Formal", href: "/formal-pic" },
      { label: "Studio", href: "/camera?type=sticker" },
    ],
  },
  {
    title: "Akun",
    links: [
      { label: "Masuk", href: "/login" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Pengaturan", href: "/settings" },
    ],
  },
  {
    title: "Info",
    links: [
      { label: "Cara kerja", href: "/#cara-kerja" },
      { label: "Booth & hardware", href: "/#booth" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t-2 border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div>
          <Link href="/" aria-label="PBOX, beranda" className="inline-flex min-h-11 items-center">
            <Logo size="lg" />
          </Link>
          <p className="mt-4 max-w-[36ch] text-sm leading-relaxed text-muted-foreground">
            Photobooth di browser: foto, pasang frame dan stiker, lalu unduh, bagikan, atau cetak.
          </p>
        </div>
        {GROUPS.map((g) => (
          <nav key={g.title} aria-label={`${g.title} di footer`}>
            <h2 className="font-pixel mb-4 text-[0.6rem] uppercase text-primary">{g.title}</h2>
            <ul className="space-y-1">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-9 items-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t-2 border-border px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 font-mono text-lg text-muted-foreground">
          <span>© {new Date().getFullYear()} PBOX</span>
          <span aria-hidden>GAME OVER? <span className="animate-blink text-primary">INSERT COIN</span></span>
        </div>
      </div>
    </footer>
  );
}

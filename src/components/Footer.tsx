import Link from "next/link";

const SERVICES = [
  { label: "Photobox", href: "/photobox" },
  { label: "Sticker Pic", href: "/sticker-pic" },
  { label: "Foto Formal", href: "/formal-pic" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/55 text-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <Link href="/" className="inline-block text-2xl font-black tracking-tighter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            P<span className="text-primary">BOX</span>
          </Link>
          <p className="mt-4 max-w-[38ch] text-sm leading-relaxed text-muted-foreground">
            Studio foto di browser untuk frame, stiker, dan foto formal.
          </p>
        </div>

        <nav aria-label="Layanan di footer">
          <h2 className="mb-4 text-sm font-bold">Layanan</h2>
          <ul className="space-y-3">
            {SERVICES.map((service) => (
              <li key={service.href}>
                <Link href={service.href} className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {service.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Akun di footer">
          <h2 className="mb-4 text-sm font-bold">Akun</h2>
          <ul className="space-y-3">
            <li><Link href="/dashboard" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Dashboard</Link></li>
            <li><Link href="/profile" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Profil</Link></li>
            <li><Link href="/settings" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Pengaturan</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground sm:px-6">
        © PBOX
      </div>
    </footer>
  );
}

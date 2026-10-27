"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X, User, LogOut, Settings, LayoutDashboard, Shield, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/arcade/Logo";
import { cn } from "@/lib/utils";
import SubHeader from "./SubHeader";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { label: "Photobox", href: "/photobox" },
  { label: "Sticker Pic", href: "/sticker-pic" },
  { label: "Foto Formal", href: "/formal-pic" },
];

const ACCOUNT = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/profile", icon: User, label: "Profil" },
  { href: "/settings", icon: Settings, label: "Pengaturan" },
];

export const Header = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  // The menu belongs to the page it was opened on, so navigating closes it.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const setOpen = (value: boolean) => setOpenPath(value ? pathname : null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "P1";

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-16 border-b-2 border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" aria-label="PBOX, beranda" className="flex min-h-11 shrink-0 items-center">
            <Logo />
          </Link>

          <nav aria-label="Utama" className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={isActive(n.href) ? "page" : undefined}
                className={cn(
                  "relative px-4 py-2 text-sm font-semibold transition-colors",
                  isActive(n.href) ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {n.label}
                {isActive(n.href) && <span className="absolute inset-x-4 -bottom-[13px] h-1 bg-primary" aria-hidden />}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle />
            <Button asChild size="sm" variant="secondary">
              <Link href="/camera?type=sticker"><Camera /> Mulai foto</Link>
            </Button>

            {session?.user ? (
              <div className="group relative">
                <button
                  type="button"
                  className="flex min-h-11 items-center gap-2 rounded-sm px-2 hover:bg-muted"
                  aria-haspopup="true"
                >
                  <Avatar className="size-8">
                    <AvatarImage src={session.user.image ?? undefined} alt="" />
                    <AvatarFallback className="bg-primary font-pixel text-[0.55rem] text-primary-foreground">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="max-w-28 truncate text-sm font-semibold">{session.user.name}</span>
                </button>
                <div className="pointer-events-none invisible absolute right-0 top-full w-60 pt-2 opacity-0 transition-opacity duration-150 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100">
                  <div className="arcade-panel p-2">
                    <div className="mb-1 border-b-2 border-border px-3 py-2.5">
                      <p className="truncate text-sm font-bold">{session.user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
                    </div>
                    {ACCOUNT.map(({ href, icon: Icon, label }) => (
                      <Link key={href} href={href} className="flex min-h-10 items-center gap-2.5 rounded-sm px-3 text-sm hover:bg-muted">
                        <Icon className="size-4 text-muted-foreground" aria-hidden /> {label}
                      </Link>
                    ))}
                    {session.user.role === "admin" && (
                      <Link href="/admin/home" className="flex min-h-10 items-center gap-2.5 rounded-sm px-3 text-sm text-primary hover:bg-muted">
                        <Shield className="size-4" aria-hidden /> Panel admin
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="mt-1 flex min-h-10 w-full items-center gap-2.5 rounded-sm border-t-2 border-border px-3 text-sm text-destructive hover:bg-muted"
                    >
                      <LogOut className="size-4" aria-hidden /> Keluar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Masuk</Link>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="grid size-11 place-items-center rounded-sm border-2 border-border bg-card"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Tutup menu" : "Buka menu"}
              aria-expanded={open}
              aria-controls="mobile-navigation"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-navigation"
            className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-background bg-arcade-grid lg:hidden"
            initial={reduceMotion ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.2, 0, 0, 1] }}
          >
            <nav aria-label="Menu seluler" className="mx-auto max-w-7xl space-y-6 px-4 py-6">
              <div>
                <p className="font-pixel mb-3 text-[0.55rem] uppercase text-primary">Pilih mode</p>
                <ul className="space-y-2">
                  {NAV.map((n, i) => (
                    <li key={n.href}>
                      <Link
                        href={n.href}
                        className={cn(
                          "flex min-h-14 items-center gap-4 rounded-sm border-2 bg-card px-4 font-display text-xl font-bold",
                          isActive(n.href) ? "border-primary" : "border-border",
                        )}
                      >
                        <span className="font-mono text-2xl text-muted-foreground">0{i + 1}</span> {n.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <Button asChild size="lg" variant="secondary" className="w-full">
                <Link href="/camera?type=sticker"><Camera /> Mulai foto</Link>
              </Button>

              <div className="border-t-2 border-border pt-6">
                {session?.user ? (
                  <ul className="space-y-1">
                    {ACCOUNT.map(({ href, icon: Icon, label }) => (
                      <li key={href}>
                        <Link href={href} className="flex min-h-12 items-center gap-3 rounded-sm px-3 font-medium hover:bg-muted">
                          <Icon className="size-4 text-muted-foreground" aria-hidden /> {label}
                        </Link>
                      </li>
                    ))}
                    {session.user.role === "admin" && (
                      <li>
                        <Link href="/admin/home" className="flex min-h-12 items-center gap-3 rounded-sm px-3 font-medium text-primary hover:bg-muted">
                          <Shield className="size-4" aria-hidden /> Panel admin
                        </Link>
                      </li>
                    )}
                    <li>
                      <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex min-h-12 w-full items-center gap-3 rounded-sm px-3 font-medium text-destructive hover:bg-muted"
                      >
                        <LogOut className="size-4" aria-hidden /> Keluar
                      </button>
                    </li>
                  </ul>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Button asChild variant="outline"><Link href="/login">Masuk</Link></Button>
                    <Button asChild><Link href="/register">Daftar</Link></Button>
                  </div>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-16" aria-hidden />
      <SubHeader />
    </>
  );
};

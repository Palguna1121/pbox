"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X, ChevronDown, User, LogOut, Settings, LayoutDashboard, Shield, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SubHeader from "./SubHeader";
import { ThemeToggle } from "./ThemeToggle";

const SERVICES = [
  { label: "Photobox", href: "/photobox", desc: "Frame foto keren & unik" },
  { label: "Sticker Pic", href: "/sticker-pic", desc: "Overlay sticker lucu" },
  { label: "Foto Formal", href: "/formal-pic", desc: "Background profesional" },
];

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [svcOpen, setSvcOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="font-black text-2xl tracking-tighter shrink-0" onClick={() => setOpen(false)}>
            P<span className="text-primary">BOX</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                pathname === "/" ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Beranda
            </Link>

            {/* Hover and focus can both reveal the service menu. */}
            <div className="relative group">
              <button type="button" className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Layanan <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180 duration-200" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto">
                <div className="bg-background border border-border rounded-2xl shadow-xl p-2">
                  {SERVICES.map((s) => (
                    <Link key={s.href} href={s.href} className="flex flex-col px-3 py-2.5 rounded-xl hover:bg-muted transition-colors">
                      <span className="text-sm font-semibold">{s.label}</span>
                      <span className="text-xs text-muted-foreground">{s.desc}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Desktop right: theme toggle + auth */}
          <div className="hidden lg:flex items-center gap-2">
            <ThemeToggle />

            {session?.user ? (
              <div className="relative group">
                <button type="button" className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={session.user.image ?? undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium max-w-28 truncate">{session.user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground transition-transform group-hover:rotate-180 duration-200" />
                </button>
                <div className="absolute top-full right-0 pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto">
                  <div className="bg-background border border-border rounded-2xl shadow-xl p-2">
                    <div className="px-3 py-2.5 border-b border-border mb-1">
                      <p className="text-sm font-bold truncate">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                    </div>
                    {[
                      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                      { href: "/profile", icon: User, label: "Profil" },
                      { href: "/settings", icon: Settings, label: "Pengaturan" },
                    ].map(({ href, icon: Icon, label }) => (
                      <Link key={href} href={href} className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl hover:bg-muted transition-colors">
                        <Icon className="w-4 h-4 text-muted-foreground" /> {label}
                      </Link>
                    ))}
                    {session.user.role === "admin" && (
                      <Link href="/admin/home" className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl hover:bg-primary/10 text-primary transition-colors">
                        <Shield className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Keluar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="rounded-full">Masuk</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="rounded-full">Daftar Gratis</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="lg:hidden flex items-center gap-1">
            <ThemeToggle />
            <button type="button" className="grid h-11 w-11 place-items-center rounded-full hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setOpen(!open)} aria-label={open ? "Tutup menu" : "Buka menu"} aria-expanded={open} aria-controls="mobile-navigation">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="mobile-navigation"
          id="mobile-navigation"
          className="fixed inset-x-0 top-16 bottom-0 z-40 bg-background overflow-y-auto lg:hidden"
          initial={reduceMotion ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.2, 0, 0, 1] }}
        >
          <div className="max-w-7xl mx-auto px-4 py-5 space-y-1">
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center px-4 py-3 rounded-2xl hover:bg-muted transition-colors font-medium text-sm">
              Beranda
            </Link>

            <div>
              <button
                onClick={() => setSvcOpen(!svcOpen)}
                type="button"
                aria-expanded={svcOpen}
                aria-controls="mobile-services"
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-muted transition-colors font-medium text-sm"
              >
                Layanan
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${svcOpen ? "rotate-180" : ""}`} />
              </button>
              {svcOpen && (
                <div id="mobile-services" className="mx-2 mt-1 mb-2 space-y-1 pl-3 border-l-2 border-primary/20">
                  {SERVICES.map((s) => (
                    <Link key={s.href} href={s.href} onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors">
                      <Camera className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <p className="font-semibold">{s.label}</p>
                        <p className="text-xs text-muted-foreground">{s.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border">
              {session?.user ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-4 py-3 bg-muted rounded-2xl mb-2">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={session.user.image ?? undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                    </div>
                  </div>
                  {[
                    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                    { href: "/profile", icon: User, label: "Profil" },
                    { href: "/settings", icon: Settings, label: "Pengaturan" },
                  ].map(({ href, icon: Icon, label }) => (
                    <Link key={href} href={href} onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-muted transition-colors text-sm font-medium">
                      <Icon className="w-4 h-4 text-muted-foreground" /> {label}
                    </Link>
                  ))}
                  {session.user.role === "admin" && (
                    <Link href="/admin/home" onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-primary/10 text-primary transition-colors text-sm font-medium">
                      <Shield className="w-4 h-4" /> Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium mt-1"
                  >
                    <LogOut className="w-4 h-4" /> Keluar
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full">Masuk</Button>
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    <Button className="w-full rounded-full">Daftar Gratis</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      <SubHeader />
      <div className="h-16" />
    </>
  );
};

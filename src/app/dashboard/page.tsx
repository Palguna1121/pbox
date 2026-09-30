"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Camera, Layers, Sticker, BookImage, Settings, Shield } from "lucide-react";

const services = [
  {
    icon: Camera,
    title: "Photobox",
    description: "Foto dengan frame pilihan",
    href: "/photobox",
    coral: true,
  },
  {
    icon: Sticker,
    title: "Sticker Pic",
    description: "Tambahkan sticker ke foto",
    href: "/sticker-pic",
  },
  {
    icon: BookImage,
    title: "Formal Pic",
    description: "Background foto resmi",
    href: "/formal-pic",
  },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-1">Dashboard</p>
        <h1 className="text-4xl font-black tracking-tighter">
          Halo, <span className="text-primary">{user?.name?.split(" ")[0] ?? "Kamu"}</span>!
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Selamat datang kembali di PBOX.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 mb-8">
        {services.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`group rounded-3xl border p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
              s.coral
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                s.coral ? "bg-white/20" : "bg-primary/10"
              }`}
            >
              <s.icon className={`w-5 h-5 ${s.coral ? "text-white" : "text-primary"}`} />
            </div>
            <div>
              <p className={`font-bold text-sm ${s.coral ? "text-white" : ""}`}>{s.title}</p>
              <p className={`text-xs mt-0.5 ${s.coral ? "text-white/70" : "text-muted-foreground"}`}>
                {s.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/settings"
          className="group rounded-3xl border border-border bg-card p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-bold text-sm">Pengaturan</p>
            <p className="text-xs text-muted-foreground mt-0.5">Ubah nama & password</p>
          </div>
        </Link>

        <Link
          href="/profile"
          className="group rounded-3xl border border-border bg-card p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
            {initials}
          </div>
          <div>
            <p className="font-bold text-sm">Profil Saya</p>
            <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
          </div>
        </Link>

        {user?.role === "admin" && (
          <Link
            href="/admin/home"
            className="group rounded-3xl border border-border bg-foreground text-background p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 sm:col-span-2"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Admin Panel</p>
              <p className="text-xs text-white/60 mt-0.5">Kelola katalog & data</p>
            </div>
          </Link>
        )}
      </div>
    </main>
  );
}

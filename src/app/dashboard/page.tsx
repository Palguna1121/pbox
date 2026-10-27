"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Camera, Settings, Shield, UserRound } from "lucide-react";
import { PageIntro, PixelLabel } from "@/components/arcade/PageIntro";
import { Button } from "@/components/ui/button";
import { MyPhotos } from "@/components/pages/dashboard/MyPhotos";

const modes = [
  { title: "Photobox", description: "Foto dengan frame pilihan", href: "/photobox" },
  { title: "Stiker", description: "Tempel stiker di atas foto", href: "/sticker-pic" },
  { title: "Formal", description: "Pas foto dengan latar polos", href: "/formal-pic" },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const firstName = user?.name?.split(" ")[0];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageIntro
        label="Player 1"
        title={firstName ? `Halo, ${firstName}` : "Halo"}
        description="Foto yang kamu simpan saat sedang masuk ada di sini. Buka fotonya untuk menyalin tautan bagikan."
        actions={
          <Button asChild size="lg">
            <Link href="/photobox">
              <Camera aria-hidden="true" />
              Mulai sesi foto
            </Link>
          </Button>
        }
        className="mb-12"
      />

      <MyPhotos />

      <div className="mt-14 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="modes-title">
          <PixelLabel className="text-muted-foreground">Mode</PixelLabel>
          <h2 id="modes-title" className="font-display mt-2 text-2xl font-bold tracking-tight">
            Pilih mode foto
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {modes.map((mode, i) => (
              <li key={mode.href}>
                <Link
                  href={mode.href}
                  className="arcade-panel arcade-press flex h-full flex-col gap-1 p-4 hover:bg-muted"
                >
                  <span className="font-mono text-xl leading-none text-primary" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-lg font-semibold">{mode.title}</span>
                  <span className="text-sm text-muted-foreground">{mode.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="account-title">
          <PixelLabel className="text-muted-foreground">Akun</PixelLabel>
          <h2 id="account-title" className="font-display mt-2 text-2xl font-bold tracking-tight">
            Pengaturan akun
          </h2>
          <ul className="arcade-panel mt-4 divide-y-2 divide-border">
            <li>
              <Link href="/profile" className="flex min-h-14 items-center gap-3 px-4 py-3 hover:bg-muted">
                <UserRound className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block font-semibold">Profil</span>
                  <span className="block truncate text-sm text-muted-foreground">{user?.email ?? "Data akun"}</span>
                </span>
              </Link>
            </li>
            <li>
              <Link href="/settings" className="flex min-h-14 items-center gap-3 px-4 py-3 hover:bg-muted">
                <Settings className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span>
                  <span className="block font-semibold">Pengaturan</span>
                  <span className="block text-sm text-muted-foreground">Ubah nama dan password</span>
                </span>
              </Link>
            </li>
            {user?.role === "admin" && (
              <li>
                <Link href="/admin/home" className="flex min-h-14 items-center gap-3 px-4 py-3 hover:bg-muted">
                  <Shield className="size-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <span className="block font-semibold">Panel admin</span>
                    <span className="block text-sm text-muted-foreground">Kelola kategori, frame, dan stiker</span>
                  </span>
                </Link>
              </li>
            )}
          </ul>
        </section>
      </div>
    </main>
  );
}

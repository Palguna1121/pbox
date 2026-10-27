"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Mail, Settings, Shield, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/arcade/PageIntro";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "P1";

  const rows = [
    { icon: User, label: "Nama", value: user?.name ?? "—" },
    { icon: Mail, label: "Email", value: user?.email ?? "—" },
    { icon: Shield, label: "Peran", value: user?.role === "admin" ? "Admin" : "Pengguna" },
  ];

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-14">
      <PageIntro label="Player card" title="Profil" className="mb-10" />

      <div className="arcade-panel overflow-hidden">
        <div className="flex items-center gap-5 border-b-2 border-border bg-muted p-6">
          <Avatar className="size-16">
            <AvatarImage src={user?.image ?? undefined} alt="" />
            <AvatarFallback className="bg-primary font-pixel text-xs text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-display text-2xl font-bold">{user?.name ?? "—"}</p>
            <span className="mt-1 inline-block border-2 border-ink bg-coin px-2 py-0.5 font-pixel text-[0.5rem] uppercase text-[#0b0820]">
              {user?.role === "admin" ? "Admin" : "Player 1"}
            </span>
          </div>
        </div>

        <dl className="divide-y-2 divide-border">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-4 px-6 py-4">
              <r.icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0">
                <dt className="text-sm text-muted-foreground">{r.label}</dt>
                <dd className="truncate font-semibold">{r.value}</dd>
              </div>
            </div>
          ))}
        </dl>

        <div className="border-t-2 border-border p-6">
          <Button asChild variant="outline" className="w-full">
            <Link href="/settings"><Settings /> Ubah nama atau password</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

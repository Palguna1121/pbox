"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Shield } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <main className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-1">Akun</p>
        <h1 className="text-4xl font-black tracking-tighter">Profil <span className="text-primary">Saya</span></h1>
      </div>

      <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-5">
          <Avatar className="w-16 h-16 text-lg border-2 border-primary/20">
            <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? "User"} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-black text-xl tracking-tight">{user?.name ?? "—"}</p>
            <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mt-1 inline-block ${
              user?.role === "admin"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}>
              {user?.role === "admin" ? "Admin" : "User"}
            </span>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nama</p>
              <p className="font-semibold">{user?.name ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-semibold">{user?.email ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Peran</p>
              <p className="font-semibold capitalize">{user?.role ?? "user"}</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        <Link
          href="/settings"
          className="inline-flex items-center justify-center w-full rounded-full border border-border bg-muted py-3 text-sm font-semibold hover:bg-border transition-colors"
        >
          Edit Profil
        </Link>
      </div>
    </main>
  );
}

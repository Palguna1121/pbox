"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "user" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Pendaftaran gagal");
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-3xl border border-border shadow-sm p-8 space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest">Bergabung Sekarang</p>
        <h1 className="text-3xl font-black tracking-tighter">Buat Akun PBOX</h1>
        <p className="text-muted-foreground text-sm">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-semibold">Nama Lengkap</Label>
          <Input id="name" type="text" placeholder="John Doe" value={name}
            onChange={(e) => setName(e.target.value)} required className="rounded-xl h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
          <Input id="email" type="email" placeholder="nama@email.com" value={email}
            onChange={(e) => setEmail(e.target.value)} required className="rounded-xl h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
          <Input id="password" type="password" placeholder="Min. 8 karakter" value={password}
            onChange={(e) => setPassword(e.target.value)} required minLength={8} className="rounded-xl h-11" />
        </div>
        <Button type="submit" className="w-full rounded-full h-11 font-bold" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {loading ? "Mendaftar..." : "Daftar Gratis"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Dengan mendaftar kamu menyetujui{" "}
        <Link href="#" className="underline">Syarat & Ketentuan</Link>
        {" "}dan{" "}
        <Link href="#" className="underline">Kebijakan Privasi</Link>.
      </p>
    </div>
  );
}

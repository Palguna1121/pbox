"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCabinet, FormAlert } from "@/components/pages/auth/AuthCabinet";

const MIN_PASSWORD = 8;

/** The register API answers in English; show users a sentence they can act on. */
function registerError(status: number, message?: string) {
  if (status === 409) return "Email ini sudah terdaftar. Masuk saja, atau pakai email lain.";
  if (message === "Invalid email format") return "Format email belum benar.";
  if (status === 400) return "Nama, email, dan password wajib diisi.";
  return "Pendaftaran gagal. Coba lagi sebentar lagi.";
}

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
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(registerError(res.status, data.error));
        setLoading(false);
        return;
      }
      router.push("/login?registered=1");
    } catch {
      setError("Tidak bisa terhubung ke server. Periksa koneksi lalu coba lagi.");
      setLoading(false);
    }
  };

  const invalid = Boolean(error);

  return (
    <AuthCabinet
      label="New player"
      title="Buat akun PBOX"
      intro={
        <>
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            Masuk di sini
          </Link>
        </>
      }
    >
      <FormAlert id="register-alert" error={error} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Nama kamu"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? "register-alert" : undefined}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="email@contoh.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? "register-alert" : undefined}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={MIN_PASSWORD}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? "password-hint register-alert" : "password-hint"}
          />
          <p id="password-hint" className="text-xs text-muted-foreground">
            Minimal {MIN_PASSWORD} karakter.
          </p>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
          {loading ? "Membuat akun..." : "Daftar"}
        </Button>
      </form>
    </AuthCabinet>
  );
}

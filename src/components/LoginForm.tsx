"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    searchParams.get("error") === "CredentialsSignin" ? "Email atau password tidak valid" : ""
  );
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Email atau password salah!");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="bg-card rounded-3xl border border-border shadow-sm p-8 space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest">Selamat Datang</p>
        <h1 className="text-3xl font-black tracking-tighter">Masuk ke PBOX</h1>
        <p className="text-muted-foreground text-sm">
          Belum punya akun?{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Daftar gratis
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
          <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
          <Input id="email" type="email" placeholder="nama@email.com" value={email}
            onChange={(e) => setEmail(e.target.value)} required className="rounded-xl h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" value={password}
            onChange={(e) => setPassword(e.target.value)} required className="rounded-xl h-11" />
        </div>
        <Button type="submit" className="w-full rounded-full h-11 font-bold" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {loading ? "Masuk..." : "Masuk"}
        </Button>
      </form>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 border-t border-border" />
        <span className="text-xs text-muted-foreground">atau</span>
        <div className="flex-1 border-t border-border" />
      </div>

      <Button type="button" variant="outline" className="w-full rounded-full h-11 font-semibold"
        onClick={() => { setGoogleLoading(true); signIn("google", { callbackUrl }); }}
        disabled={googleLoading}>
        {googleLoading
          ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          : <img src="/google-color.svg" alt="Google" className="w-4 h-4 mr-2" />
        }
        Masuk dengan Google
      </Button>
    </div>
  );
}

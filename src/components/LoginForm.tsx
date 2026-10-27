"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCabinet, FormAlert } from "@/components/pages/auth/AuthCabinet";

const AUTH_ERRORS: Record<string, string> = {
  CredentialsSignin: "Email atau password tidak cocok.",
  OAuthAccountNotLinked: "Email ini sudah terdaftar dengan cara masuk lain. Masuk memakai email dan password.",
  AccessDenied: "Akses ditolak. Coba masuk lagi.",
};

/** Only same-origin paths, so a crafted link cannot bounce users elsewhere. */
function safeCallback(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallback(searchParams.get("callbackUrl"));
  const errorCode = searchParams.get("error");
  const justRegistered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    errorCode ? AUTH_ERRORS[errorCode] ?? "Gagal masuk. Coba lagi sebentar lagi." : "",
  );
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (!result || result.error) {
        setError("Email atau password tidak cocok.");
        setLoading(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server. Periksa koneksi lalu coba lagi.");
      setLoading(false);
    }
  };

  const invalid = Boolean(error);

  return (
    <AuthCabinet
      label="Player 1 login"
      title="Masuk ke PBOX"
      intro={
        <>
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
            Daftar dulu
          </Link>
        </>
      }
    >
      <FormAlert
        id="login-alert"
        error={error}
        notice={justRegistered ? "Akun sudah dibuat. Masuk dengan email dan password tadi." : undefined}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
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
            aria-describedby={invalid ? "login-alert" : undefined}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? "login-alert" : undefined}
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
          {loading ? "Memeriksa..." : "Masuk"}
        </Button>
      </form>

      <div className="flex items-center gap-3" aria-hidden="true">
        <div className="h-0.5 flex-1 bg-border" />
        <span className="font-pixel text-[0.6rem] uppercase text-muted-foreground">atau</span>
        <div className="h-0.5 flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full normal-case tracking-normal"
        onClick={() => {
          setGoogleLoading(true);
          signIn("google", { callbackUrl });
        }}
        disabled={googleLoading}
      >
        {googleLoading ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/google-color.svg" alt="" width={16} height={16} />
        )}
        Masuk dengan Google
      </Button>
    </AuthCabinet>
  );
}

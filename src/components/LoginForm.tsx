// Perbarui src/components/login-form.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Cek apakah ada error dari NextAuth
  const authError = searchParams.get("error");

  // Set error message berdasarkan error dari NextAuth
  useState(() => {
    if (authError === "CredentialsSignin") {
      setError("Email atau password tidak valid");
    } else if (authError) {
      setError(`Error: ${authError}`);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah!");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto space-y-6 w-full max-w-md">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="text-gray-500">Masukkan kredensial Anda untuk login</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-100 text-red-600 rounded-md text-sm">{error}</div>}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Lupa password?
            </Link>
          </div>
          <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Loading..." : "Login"}
        </Button>
      </form>

      <div className="text-center text-sm">
        Belum punya akun?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          Daftar sekarang
        </Link>
      </div>
    </div>
  );
}

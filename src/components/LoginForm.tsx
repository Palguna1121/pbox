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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

  const loginWithGoogle = async () => {
    try {
      setIsGoogleLoading(true);
      await signIn("google", { callbackUrl });
    } catch (error) {
      setIsGoogleLoading(false);
      setError("Terjadi kesalahan sistem");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="mx-auto space-y-6 w-full max-w-md">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Sign in</h1>
        <p className="text-gray-500">Masukkan kredensial Anda untuk masuk</p>
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
            {/* <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Lupa password?
            </Link> */}
          </div>
          <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required min="8" />
        </div>

        <Button type="submit" className="w-full mb-4" disabled={isLoading}>
          {isLoading ? "Loading..." : "Sign in"}
        </Button>

        <hr className="border-gray-300 my-4" />

        <Button disabled={isGoogleLoading} type="button" className="w-full flex justify-center items-center gap-2" onClick={loginWithGoogle}>
          <img src="/google-color.svg" alt="Google Logo" className="h-4 w-4" />
          {isGoogleLoading && (
            <svg xmlns="www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2 animate-spin">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          )}
          <span className="text-sm">Sign in with Google</span>
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

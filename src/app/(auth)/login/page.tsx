// src/app/(auth)/login/page.tsx
import { LoginForm } from "@/components/LoginForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Masuk - PBOX",
  description: "Login ke akun Anda",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-80 rounded-3xl bg-muted" role="status" aria-label="Memuat formulir masuk" />}>
      <LoginForm />
    </Suspense>
  );
}

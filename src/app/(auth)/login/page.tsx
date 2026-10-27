import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun PBOX untuk menyimpan dan mengelola foto hasil sesi.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="arcade-panel h-96 animate-pulse" role="status" aria-label="Memuat formulir masuk" />
      }
    >
      <LoginForm />
    </Suspense>
  );
}

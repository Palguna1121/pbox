import type { Metadata } from "next";
import { RegisterForm } from "@/components/RegisterForm";

export const metadata: Metadata = {
  title: "Daftar",
  description: "Buat akun PBOX supaya foto hasil sesi tersimpan di dashboard.",
  alternates: { canonical: "/register" },
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return <RegisterForm />;
}

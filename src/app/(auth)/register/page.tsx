// src/app/(auth)/register/page.tsx
import { RegisterForm } from "@/components/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar - PBOX",
  description: "Daftar akun baru",
};

export default function RegisterPage() {
  return <RegisterForm />;
}

// src/app/(auth)/login/page.tsx
import { LoginForm } from "@/components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - MyApp",
  description: "Login ke akun Anda",
};

export default function LoginPage() {
  return <LoginForm />;
}

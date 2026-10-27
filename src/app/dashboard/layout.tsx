import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Foto tersimpan dan akun PBOX kamu.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}

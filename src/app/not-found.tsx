import type { Metadata } from "next";
import { NotFoundGlitch } from "@/components/motion/not-found/glitch";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="bg-arcade-grid">
      <NotFoundGlitch
        className="min-h-[70vh]"
        code="404"
        title="GAME OVER"
        description="Halaman ini tidak ada, sudah pindah, atau tautannya salah ketik."
        homeHref="/"
        homeLabel="Ke beranda"
        browseHref="/photobox"
        browseLabel="Lihat frame"
      />
    </main>
  );
}

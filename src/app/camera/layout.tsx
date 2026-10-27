import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio",
  description: "Ambil foto lewat webcam, kamera booth, atau unggah file, lalu edit dengan frame, stiker, teks, dan filter.",
  alternates: { canonical: "/camera" },
};

export default function CameraLayout({ children }: { children: React.ReactNode }) {
  return children;
}

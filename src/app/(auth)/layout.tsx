import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-arcade-grid relative flex min-h-[calc(100dvh-8rem)] items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}

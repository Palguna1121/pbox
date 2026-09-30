import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "PBOX — Photobox Studio",
  description: "Photobox online & photo studio services!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <a href="#main-content" className="skip-link">Lewati ke konten</a>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <Header />
            <div id="main-content" tabIndex={-1}>{children}</div>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

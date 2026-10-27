import type { ReactNode } from "react";
import { PixelLabel } from "@/components/arcade/PageIntro";

interface AuthCabinetProps {
  label: string;
  title: string;
  intro: ReactNode;
  children: ReactNode;
}

/** Card shell for login and register, styled as a cabinet screen. */
export function AuthCabinet({ label, title, intro, children }: AuthCabinetProps) {
  return (
    <section className="arcade-panel overflow-hidden shadow-arcade-lg" aria-labelledby="auth-title">
      <div className="relative flex items-center justify-between gap-3 border-b-2 border-border bg-muted px-5 py-3">
        <PixelLabel className="text-primary">{label}</PixelLabel>
        <PixelLabel className="text-muted-foreground">PBOX</PixelLabel>
      </div>
      <div className="space-y-6 p-5 sm:p-8">
        <header className="space-y-2">
          <h1 id="auth-title" className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{intro}</p>
        </header>
        {children}
      </div>
    </section>
  );
}

/** Live region for form errors and notices. Always mounted so screen readers catch updates. */
export function FormAlert({ id, error, notice }: { id: string; error?: string; notice?: string }) {
  return (
    <div id={id} aria-live="polite" aria-atomic="true">
      {error ? (
        <p className="rounded-sm border-2 border-destructive bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
          {error}
        </p>
      ) : notice ? (
        <p className="rounded-sm border-2 border-neon-lime bg-neon-lime/10 px-3 py-2.5 text-sm font-medium text-foreground">
          {notice}
        </p>
      ) : null}
    </div>
  );
}

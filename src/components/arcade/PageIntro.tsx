import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageIntroProps {
  /** Short pixel label above the title, e.g. "MODE 01". */
  label?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/** Page heading block shared by catalog, account, and admin pages. */
export function PageIntro({ label, title, description, actions, className }: PageIntroProps) {
  return (
    <header className={cn("flex flex-col gap-5 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        {label && <p className="font-pixel mb-3 text-[0.65rem] uppercase text-primary">{label}</p>}
        <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}

/** Small pixel caption used for section labels and HUD readouts. */
export function PixelLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("font-pixel text-[0.6rem] uppercase leading-none", className)}>{children}</span>;
}

import Link from "next/link";
import type { ReactNode } from "react";
import { PixelLabel } from "@/components/arcade/PageIntro";
import { cn } from "@/lib/utils";

const modes = [
  { key: "frame", label: "Frame", href: "/photobox" },
  { key: "sticker", label: "Stiker", href: "/sticker-pic" },
  { key: "formal", label: "Formal", href: "/formal-pic" },
] as const;

export type CatalogMode = (typeof modes)[number]["key"];

/** Switches between the three catalogs, like a game mode select. */
export function CatalogModeNav({ current }: { current: CatalogMode }) {
  return (
    <nav aria-label="Pilih mode foto" className="mb-8">
      <ul className="flex flex-wrap gap-2">
        {modes.map((mode, i) => {
          const active = mode.key === current;
          return (
            <li key={mode.key}>
              <Link
                href={mode.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-sm border-2 px-3 text-sm font-bold uppercase tracking-wide transition-colors",
                  active
                    ? "border-ink bg-primary text-primary-foreground shadow-arcade-sm"
                    : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span className="font-mono text-lg leading-none" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {mode.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** A real count rendered like a score readout. */
export function ScoreReadout({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className={cn("arcade-panel inline-flex flex-col gap-1 px-4 py-2", className)}>
      <PixelLabel className="text-muted-foreground">{label}</PixelLabel>
      <p className="font-mono text-4xl leading-none text-primary">{String(value).padStart(3, "0")}</p>
    </div>
  );
}

/** Empty catalog or list, phrased like a blank high-score table. */
export function ArcadeEmpty({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("arcade-panel flex flex-col items-center gap-3 px-6 py-14 text-center", className)}>
      <p className="font-pixel text-xs uppercase text-primary">{title}</p>
      <p className="max-w-[48ch] text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

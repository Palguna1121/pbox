import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CartridgeCardProps {
  href: string;
  imageSrc: string;
  imageAlt: string;
  title: string;
  /** 1-based position in the grid, printed like a cartridge number. */
  slot: number;
  tag?: string;
  cta: string;
  meta?: ReactNode;
  /** Classes for the media box, e.g. aspect ratio or `frame-preview`. */
  mediaClassName?: string;
  imageClassName?: string;
  sizes: string;
  priority?: boolean;
}

/** Catalog item drawn as a game cartridge: number strip, preview window, label. */
export function CartridgeCard({
  href,
  imageSrc,
  imageAlt,
  title,
  slot,
  tag,
  cta,
  meta,
  mediaClassName,
  imageClassName,
  sizes,
  priority,
}: CartridgeCardProps) {
  return (
    <Link
      href={href}
      className="group block h-full rounded-md focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <article className="arcade-panel flex h-full flex-col overflow-hidden transition-[transform,box-shadow] duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-arcade-lg group-active:translate-x-0.5 group-active:translate-y-0.5 group-active:shadow-arcade-sm motion-reduce:transform-none">
        <div className="flex items-center justify-between gap-2 border-b-2 border-border bg-muted px-3 py-1.5">
          <span className="font-mono text-lg leading-none text-muted-foreground" aria-hidden="true">
            #{String(slot).padStart(2, "0")}
          </span>
          {tag && (
            <span className="font-pixel truncate text-[0.6rem] uppercase leading-none text-foreground">{tag}</span>
          )}
        </div>
        <div className={cn("relative w-full overflow-hidden border-b-2 border-border bg-muted", mediaClassName)}>
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes={sizes}
            priority={priority}
            className={cn(
              "transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
              imageClassName,
            )}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
          <h2 className="font-display text-lg font-semibold leading-tight text-balance">{title}</h2>
          {meta}
          <span className="font-pixel mt-auto pt-1 text-[0.6rem] uppercase text-primary group-hover:underline group-hover:underline-offset-4">
            {cta}
          </span>
        </div>
      </article>
    </Link>
  );
}

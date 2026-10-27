import Image from "next/image";
import { cn } from "@/lib/utils";

/** Camera-aperture `P` mark followed by pixel `BOX`, read together as PBOX. */
export function Logo({ size = "md", className }: { size?: "md" | "lg"; className?: string }) {
  const lg = size === "lg";
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <Image
        src="/images/pbox-icon.png"
        alt=""
        width={64}
        height={64}
        className={cn("object-contain [image-rendering:auto]", lg ? "size-11" : "size-9")}
        priority={!lg}
      />
      <span className={cn("font-pixel leading-none text-foreground", lg ? "text-xl" : "text-base")}>BOX</span>
    </span>
  );
}

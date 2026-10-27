"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/** Icons switch via the `dark` class, so the button renders identically on server and client. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="grid size-11 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label="Ganti tema siang atau malam"
    >
      <Sun className="hidden size-4 dark:block" aria-hidden />
      <Moon className="size-4 dark:hidden" aria-hidden />
    </button>
  );
}

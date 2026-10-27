"use client";

import { useState } from "react";
import { HoldActionButton } from "@/components/motion/hold-action-button";
import { cn } from "@/lib/utils";

interface HoldDeleteButtonProps {
  /** DELETE endpoint, e.g. `/api/images/abc`. */
  endpoint: string;
  /** Accessible name that says what gets deleted. */
  ariaLabel: string;
  label?: string;
  onDeleted?: () => void;
  /** Server messages per status that are safe to show as-is. */
  messages?: Partial<Record<number, string>>;
  disabled?: boolean;
  className?: string;
}

function fallbackMessage(status: number) {
  if (status === 401 || status === 403) return "Sesi berakhir atau kamu tidak punya akses. Masuk lagi lalu coba ulang.";
  if (status === 404) return "Data ini sudah tidak ada. Muat ulang halaman.";
  return "Gagal menghapus. Coba lagi sebentar lagi.";
}

/**
 * Destructive action that needs a deliberate press-and-hold (pointer, Enter, or Space),
 * so a stray tap cannot delete anything.
 */
export function HoldDeleteButton({
  endpoint,
  ariaLabel,
  label = "Tahan untuk hapus",
  onDeleted,
  messages,
  disabled,
  className,
}: HoldDeleteButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setPending(true);
    setError("");
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) {
        setError(messages?.[res.status] ?? fallbackMessage(res.status));
        return;
      }
      onDeleted?.();
    } catch {
      setError("Tidak bisa terhubung ke server. Periksa koneksi lalu coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start">
      <HoldActionButton
        type="horizontal"
        holdDuration={1100}
        onHoldComplete={run}
        disabled={disabled || pending}
        aria-label={`${ariaLabel}. Tekan dan tahan untuk menghapus.`}
        holdingLabel="Terus tahan..."
        completeLabel={pending ? "Menghapus..." : "Lepas"}
        fillClassName="bg-foreground/30"
        labelClassName="text-xs font-bold uppercase tracking-wide whitespace-nowrap"
        className={cn(
          "h-11 min-w-0 rounded-sm border-2 border-ink bg-destructive px-4 text-destructive-foreground shadow-arcade-sm [--hold-radius:2px] [&_svg]:text-foreground/30",
          "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring",
          className,
        )}
      >
        {label}
      </HoldActionButton>
      <p aria-live="polite" className="max-w-64 text-xs font-medium text-destructive [&:not(:empty)]:mt-1.5">
        {error}
      </p>
    </div>
  );
}

"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { label: "Ringkasan", href: "/admin/home" },
  { label: "Frame", href: "/admin/frame-catalog" },
  { label: "Stiker", href: "/admin/sticker-catalog" },
  { label: "Kategori", href: "/admin/categories" },
];

/** Operator bar for admins, shown only inside /admin so it never covers the studio. */
const SubHeader = () => {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (session?.user?.role !== "admin" || !pathname.startsWith("/admin")) return null;

  return (
    <nav aria-label="Admin" className="border-b-2 border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 scrollbar-none sm:px-6">
        <span className="font-pixel mr-3 shrink-0 text-[0.55rem] uppercase text-neon-cyan">Operator</span>
        {ADMIN_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "whitespace-nowrap border-b-4 px-4 py-3 text-sm font-semibold transition-colors",
                active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default SubHeader;

"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin/home" },
  { label: "Frame", href: "/admin/frame-catalog" },
  { label: "Sticker", href: "/admin/sticker-catalog" },
  { label: "Kategori", href: "/admin/categories" },
];

const SubHeader = () => {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (session?.user?.role !== "admin") return null;

  return (
    <div className="fixed top-16 inset-x-0 z-40 bg-zinc-950 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex overflow-x-auto scrollbar-none gap-1">
          {ADMIN_NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  active
                    ? "text-primary border-primary"
                    : "text-zinc-400 border-transparent hover:text-zinc-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubHeader;

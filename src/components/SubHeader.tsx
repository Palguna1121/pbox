"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const SubHeader = () => {
  const { data: session } = useSession();
  const pathname = usePathname();

  const submenuItems = [
    {
      title: "Home",
      href: "/admin/home",
    },
    {
      title: "Photobox",
      href: "/admin/frame-catalog",
    },
    {
      title: "Sticker Pic",
      href: "/admin/sticker-catalog",
    },
    {
      title: "Categories",
      href: "/admin/categories",
    },
  ];

  // Modified function to check if current path starts with any of the base paths
  const getActiveSubmenu = () => {
    // Check if pathname starts with any of the submenu item paths
    const activeItem = submenuItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

    return activeItem ? activeItem.title : "Home";
  };

  const [activeSubmenu, setActiveSubmenu] = useState(() => getActiveSubmenu());

  useEffect(() => {
    setActiveSubmenu(getActiveSubmenu());
  }, [pathname]);

  return (
    <>
      {session?.user?.role === "admin" && (
        <div className="w-full fixed top-20 left-0 border-b border-t border-gray-200 bg-gray-50 z-30">
          <div className="container mx-auto">
            <div className="flex overflow-x-auto">
              {submenuItems.map((item) => (
                <Link key={item.title} href={item.href} className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${activeSubmenu === item.title ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-900"}`}>
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add padding to account for the subheader when it's visible */}
      {/* {session?.user?.role === "admin" && <div className="h-12"></div>} */}
    </>
  );
};

export default SubHeader;

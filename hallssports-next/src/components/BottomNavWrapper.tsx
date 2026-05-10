"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";

export function BottomNavWrapper() {
  const pathname = usePathname();

  // Hide BottomNav on admin and developer pages
  const isAdminPage = pathname?.startsWith("/admin") || pathname?.startsWith("/developer");

  if (isAdminPage) {
    return null;
  }

  return <BottomNav />;
}
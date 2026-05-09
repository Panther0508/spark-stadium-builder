"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import FootballFieldScene with no SSR and a fallback
const FootballFieldScene = dynamic(
  () => import("@/components/FootballFieldScene").then(mod => mod.FootballFieldScene),
  {
    ssr: false,
    loading: () => <div className="fixed inset-0 bg-black" />,
  }
);

// Pages where the 3D scene should NOT be shown (static or admin pages)
const EXCLUDED_PATHS = [
  "/about",
  "/terms",
  "/privacy",
  "/referral",
  "/download",
  "/settings",
  "/admin",
  "/developer",
  "/404",
  "/500",
];

export default function SceneController() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!mounted) return null;

  // Exclude paths that start with any of the excluded prefixes
  const isExcluded = EXCLUDED_PATHS.some((path) => pathname?.startsWith(path));
  if (isExcluded) return null;

  return <FootballFieldScene />;
}

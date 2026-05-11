"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/")}
      aria-label="Back to Home"
      className="absolute top-4 left-4 z-30 w-11 h-11 rounded-full glass-strong flex items-center justify-center border border-glass-border hover:bg-white/20 transition-all active:scale-95"
    >
      <ArrowLeft className="h-5 w-5 text-foreground" />
    </button>
  );
}

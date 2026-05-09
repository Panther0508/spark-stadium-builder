"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Home, Trophy, BarChart3, Film, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { MoreDrawer } from "@/components/MoreDrawer";

const items = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/matches", icon: Trophy, label: "Matches" },
  { to: "/standings", icon: BarChart3, label: "Standings" },
  { to: "/highlights", icon: Film, label: "Highlights" },
] as const;

export function BottomNav() {
  const path = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-2">
        <div className="glass-strong mx-auto max-w-md rounded-2xl px-2 py-2 flex items-center justify-between">
          {items.map((it) => {
            const active = it.to === "/" ? path === "/" : path.startsWith(it.to);
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                href={it.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all",
                  active && "bg-primary/15 scale-105",
                )}
              >
                <Icon className={cn("h-5 w-5", active ? "text-primary text-glow" : "text-muted-foreground")} />
                <span className={cn("text-[10px]", active ? "text-primary" : "text-muted-foreground")}>{it.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all hover:bg-white/10"
          >
            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">More</span>
          </button>
        </div>
      </nav>
      <MoreDrawer open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
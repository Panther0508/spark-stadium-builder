"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Home, Trophy, BarChart3, Film, MoreHorizontal } from "lucide-react";

const items = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/matches", icon: Trophy, label: "Matches" },
  { to: "/standings", icon: BarChart3, label: "Standings" },
  { to: "/highlights", icon: Film, label: "Highlights" },
] as const;

export function BottomNav() {
   const path = usePathname();

   return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-2">
      <div className="glass-strong mx-auto max-w-md rounded-2xl px-2 py-2 flex items-center justify-between shadow-2xl shadow-black/50">
        {items.map((it) => {
          const active = it.to === "/" ? path === "/" : path.startsWith(it.to);
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              href={it.to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-h-[44px] min-w-[44px]",
                active && "bg-primary/10",
              )}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                animate={active ? { y: [-2, 0], scale: 1.1 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Icon className={cn("h-5 w-5", active ? "text-primary text-glow" : "text-muted-foreground")} />
              </motion.div>
              <span className={cn("text-[10px] font-medium", active ? "text-primary" : "text-muted-foreground")}>{it.label}</span>
            </Link>
          );
        })}
        <Link
          href="/more"
          className={cn(
            "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-h-[44px] min-w-[44px]",
            path.startsWith("/more") && "bg-primary/10"
          )}
        >
          <motion.div whileTap={{ scale: 0.9 }}>
            <MoreHorizontal className={cn("h-5 w-5", path.startsWith("/more") ? "text-primary text-glow" : "text-muted-foreground")} />
          </motion.div>
          <span className={cn("text-[10px]", path.startsWith("/more") ? "text-primary" : "text-muted-foreground")}>More</span>
        </Link>
      </div>
    </nav>
  );
}
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Trophy, BarChart3, Film, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/matches", icon: Trophy, label: "Matches" },
  { to: "/standings", icon: BarChart3, label: "Standings" },
  { to: "/highlights", icon: Film, label: "Highlights" },
  { to: "/more", icon: MoreHorizontal, label: "More" },
] as const;

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-2">
      <div className="glass-strong mx-auto max-w-md rounded-2xl px-2 py-2 flex items-center justify-between">
        {items.map((it) => {
          const active = it.to === "/" ? path === "/" : path.startsWith(it.to);
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
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
      </div>
    </nav>
  );
}

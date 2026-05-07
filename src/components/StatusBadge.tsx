import { cn } from "@/lib/utils";
import type { MatchStatus } from "@/lib/mock-data";

export function StatusBadge({ status, minute }: { status: MatchStatus; minute?: number }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-live animate-live-pulse" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
        </span>
        LIVE {minute ? `${minute}'` : ""}
      </span>
    );
  }
  if (status === "finished") {
    return <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">FT</span>;
  }
  return <span className={cn("rounded-full border border-primary/60 px-2.5 py-0.5 text-xs font-semibold text-primary")}>SCHEDULED</span>;
}

export function TeamLogo({ name, color }: { name: string; color: string }) {
  return (
    <div
      className="h-10 w-10 rounded-full grid place-items-center text-xs font-bold ring-1 ring-white/20"
      style={{ background: color, boxShadow: `0 0 16px ${color}66` }}
    >
      {name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")}
    </div>
  );
}

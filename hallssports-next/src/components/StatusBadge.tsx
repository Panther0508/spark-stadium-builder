"use client";

import { cn } from "@/lib/utils";

export type MatchStatus = "live" | "scheduled" | "finished" | "half-time";

export function StatusBadge({ status, minute, isPolling }: { status: MatchStatus; minute?: number; isPolling?: boolean }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-live animate-live-pulse" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
        </span>
        LIVE {minute ? `${minute}'` : ""}
        {isPolling && (
          <span
            className="ml-1 inline-block w-2 h-2 rounded-full bg-gray-400 align-middle"
            title="Updates delayed"
          />
        )}
      </span>
    );
  }
  if (status === "finished" || status === "half-time") {
    return <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
      {status === "finished" ? "FT" : "HT"}
    </span>;
  }
  return <span className={cn("rounded-full border border-primary/60 px-2.5 py-0.5 text-xs font-semibold text-primary")}>
    SCHEDULED
  </span>;
}

export function TeamLogo({ name, color, logoUrl, size = "md" }: { name: string; color: string; logoUrl?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover ring-1 ring-white/20`}
        style={{ boxShadow: `0 0 16px ${color}66` }}
      />
    );
  }

  return (
    <div
      className={cn(sizeClasses[size], "rounded-full grid place-items-center font-bold ring-1 ring-white/20")}
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
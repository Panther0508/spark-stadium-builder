"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type MatchStatusType = "live" | "scheduled" | "finished" | "half-time" | "postponed" | "cancelled";

interface MatchStatusBadgeProps {
  status: MatchStatusType;
  minute?: number;
  className?: string;
}

export function MatchStatusBadge({ status, minute, className }: MatchStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "live":
        return {
          label: `LIVE`,
          badge: (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <motion.span
                className="relative flex h-2 w-2"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary animate-live-pulse" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </motion.span>
              LIVE {minute ? `${minute}'` : ""}
            </span>
          ),
        };
      case "finished":
        return {
          label: "FT",
          badge: (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              FT
            </span>
          ),
        };
      case "half-time":
        return {
          label: "HT",
          badge: (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
              <motion.span
                className="relative flex h-2 w-2"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
              </motion.span>
              HT
            </span>
          ),
        };
      case "postponed":
        return {
          label: "POSTPONED",
          badge: (
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
              POSTPONED
            </span>
          ),
        };
      case "cancelled":
        return {
          label: "CANCELLED",
          badge: (
            <span className="rounded-full bg-destructive/20 px-2.5 py-0.5 text-xs font-semibold text-destructive line-through">
              CANCELLED
            </span>
          ),
        };
      case "scheduled":
      default:
        return {
          label: "SCHEDULED",
          badge: (
            <span className={cn("rounded-full border border-primary/60 px-2.5 py-0.5 text-xs font-semibold text-primary")}>
              SCHEDULED
            </span>
          ),
        };
    }
  };

  const { badge } = getStatusConfig();

  return (
    <div className={className}>
      {badge}
    </div>
  );
}
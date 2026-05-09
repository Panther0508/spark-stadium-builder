"use client";

import { cn } from "@/lib/utils";

interface PillProps {
  count?: number;
  className?: string;
}

export function YellowCardPill({ count = 1, className }: PillProps) {
  return (
    <div className={cn(
      "inline-flex items-center justify-center w-5 h-6 bg-yellow-400 rounded-sm",
      "text-black font-bold text-[10px]",
      className
    )}>
      {count > 1 && count}
    </div>
  );
}

export function RedCardPill({ className }: { className?: string }) {
  return (
    <div className={cn(
      "inline-flex items-center justify-center w-5 h-6 bg-red-500 rounded-sm",
      className
    )}>
      <span className="text-white font-bold text-[10px]">✕</span>
    </div>
  );
}

export function GoalScorerPill({ count = 1, className }: PillProps) {
  return (
    <div className={cn(
      "inline-flex items-center justify-center px-1.5 h-5 bg-primary rounded-full",
      "text-primary-foreground font-bold text-[10px]",
      className
    )}>
      ⚽ {count > 1 && count}
    </div>
  );
}

export function CaptainArmband({ className }: { className?: string }) {
  return (
    <div className={cn(
      "inline-flex items-center justify-center w-5 h-5 rounded-full",
      "bg-gradient-to-br from-yellow-400 to-amber-500",
      "text-black font-bold text-[10px]",
      className
    )}>
      C
    </div>
  );
}

export function MOTMBadge({ className }: { className?: string }) {
  return (
    <div className={cn(
      "inline-flex items-center justify-center px-2 h-5 rounded-full",
      "bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500",
      "text-black font-bold text-[10px]",
      className
    )}>
      ⭐ MOTM
    </div>
  );
}
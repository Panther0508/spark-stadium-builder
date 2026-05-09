"use client";

import { cn } from "@/lib/utils";

interface SectionDividerProps {
  title?: string;
  className?: string;
}

export function SectionDivider({ title, className }: SectionDividerProps) {
  if (title) {
    return (
      <div className={cn("flex items-center gap-4 my-8", className)}>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
          {title}
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center my-6", className)}>
      <div className="relative w-full max-w-xs">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-primary/30" />
        </div>
        <div className="relative flex justify-center">
          <div className="bg-primary w-2 h-2 rounded-full ring-2 ring-primary/50 ring-offset-2 ring-offset-background" />
        </div>
      </div>
    </div>
  );
}
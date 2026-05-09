"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  highlighted?: boolean;
};

export function AdminCard({ children, className, highlighted = false }: Props) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-6 shadow-[var(--shadow-card)]",
        highlighted && "border-t-2 border-t-primary",
        className,
      )}
    >
      {children}
    </div>
  );
}
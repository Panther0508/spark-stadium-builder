"use client";

import { cn } from "@/lib/utils";

type SkeletonVariant = "card" | "avatar" | "text" | "table-row" | "circle" | "square";

interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
  count?: number;
  height?: number | string;
  width?: number | string;
}

export function Skeleton({ variant = "text", className, count = 1, height, width }: SkeletonProps) {
  const baseClasses = "bg-white/10 rounded-2xl animate-pulse";

  const variantClasses = {
    text: "h-4 w-full",
    card: "h-48 w-full rounded-3xl",
    avatar: "h-12 w-12 rounded-full",
    circle: "rounded-full",
    square: "rounded-xl",
    "table-row": "h-12 w-full rounded-lg",
  };

  const style = {
    ...(height ? { height } : {}),
    ...(width ? { width } : {}),
  };

  const getClasses = () => {
    const v = variantClasses[variant];
    return typeof v === "string" ? cn(baseClasses, v, className) : cn(baseClasses, className);
  };

  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={getClasses()} style={style} />
        ))}
      </div>
    );
  }

  return <div className={getClasses()} style={style} />;
}
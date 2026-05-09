"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface PlayerAvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

export function PlayerAvatar({ src, name, size = "md", className }: PlayerAvatarProps) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden bg-primary/20 grid place-items-center font-bold text-primary",
        sizeClasses[size],
        !src && "border-2 border-primary/30",
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={64}
          height={64}
          className="h-full w-full object-cover"
        />
      ) : (
        initials || "?"
      )}
    </div>
  );
}

interface TeamCrestProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const crestSizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export function TeamCrest({ src, name, size = "md", className }: TeamCrestProps) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden bg-primary grid place-items-center font-bold text-primary-foreground",
        crestSizeClasses[size],
        className
      )}
      style={!src ? { backgroundColor: "#00A859" } : undefined}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={48}
          height={48}
          className="h-full w-full object-cover"
        />
      ) : (
        initials || "?"
      )}
    </div>
  );
}
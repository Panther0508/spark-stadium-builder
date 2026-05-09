"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  subtitle, 
  actionLabel, 
  onAction,
  className 
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col items-center justify-center text-center p-8", className)}
    >
      {icon && (
        <div className="mb-4 text-primary/50">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {subtitle && (
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">{subtitle}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
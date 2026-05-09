"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message = "Something went wrong", onRetry, className }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col items-center justify-center text-center p-8", className)}
    >
      <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{message}</h3>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors mt-2"
        >
          Try Again
        </button>
      )}
    </motion.div>
  );
}
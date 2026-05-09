"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatBarProps {
  label: string;
  value: number;
  color?: string;
  showValue?: boolean;
  className?: string;
}

export function StatBar({ label, value, color = "var(--primary)", showValue = true, className }: StatBarProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        {showValue && <span className="font-mono font-semibold">{value}%</span>}
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MatchTimerProps {
  startTime: string;
  status: "live" | "half-time" | "finished" | "scheduled";
  className?: string;
}

export function MatchTimer({ startTime, status, className }: MatchTimerProps) {
  const [minute, setMinute] = useState(0);

  useEffect(() => {
    if (status !== "live" && status !== "half-time") return;

    const start = new Date(startTime).getTime();
    
    const update = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - start) / 60000);
      const effectiveMinute = status === "half-time" ? (minute || 45) : elapsed;
      setMinute(Math.max(0, Math.min(effectiveMinute, 90)));
    };

    update();
    const interval = setInterval(update, 30000);
    
    return () => clearInterval(interval);
  }, [startTime, status, minute]);

  if (status === "scheduled" || status === "finished") return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <motion.span
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-primary font-mono font-bold"
      >
        {minute}&apos;
      </motion.span>
    </div>
  );
}
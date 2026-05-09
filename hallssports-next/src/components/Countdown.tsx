"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CountdownProps {
  targetDate: string;
  className?: string;
}

export function Countdown({ targetDate, className }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    
    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const countdownText = [
    timeLeft.days > 0 && `${timeLeft.days}d`,
    `${timeLeft.hours}h`,
    `${timeLeft.minutes}m`,
  ].filter(Boolean).join(" ");

  return (
    <div className={cn("font-mono text-sm", className)}>
      {timeLeft.days <= 0 ? (
        <motion.span
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {countdownText}
        </motion.span>
      ) : (
        countdownText
      )}
    </div>
  );
}
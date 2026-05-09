"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  format?: (val: number) => string;
}

export function AnimatedCounter({ 
  value, 
  duration = 1000, 
  className,
  format = (v) => Math.round(v).toString()
}: AnimatedCounterProps) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration });
  const display = useTransform(springValue, (latest) => format(latest));
  
  const prevValue = useRef(value);
  
  useEffect(() => {
    motionValue.set(prevValue.current);
    const timeout = setTimeout(() => motionValue.set(value), 0);
    prevValue.current = value;
    return () => clearTimeout(timeout);
  }, [value, motionValue]);

  return (
    <motion.span className={cn(className)}>
      {display}
    </motion.span>
  );
}
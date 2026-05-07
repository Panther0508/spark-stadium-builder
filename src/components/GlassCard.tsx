import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { type ReactNode, type MouseEvent, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  tilt?: boolean;
  strong?: boolean;
};

export const GlassCard = forwardRef<HTMLDivElement, Props>(function GlassCard(
  { children, className, onClick, tilt = true, strong = false },
  ref,
) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 200, damping: 20 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!tilt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={tilt ? { rotateX: rx, rotateY: ry, transformPerspective: 800 } : undefined}
      className={cn(
        strong ? "glass-strong" : "glass",
        "rounded-2xl shadow-[var(--shadow-card)] transition-shadow",
        onClick && "cursor-pointer hover:ring-1 hover:ring-primary/40",
        className,
      )}
    >
      {children}
    </motion.div>
  );
});

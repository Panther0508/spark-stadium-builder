import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function PageShell({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="px-4 pt-4 pb-28 max-w-3xl mx-auto"
    >
      {title && <h1 className="text-3xl font-bold mb-4 text-glow">{title}</h1>}
      {children}
    </motion.main>
  );
}

"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function PageShell({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <motion.main
      id="main-content"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="px-4 pt-4 pb-28 max-w-3xl mx-auto"
    >
      {title && <h1 className="text-3xl font-bold mb-4 text-glow">{title}</h1>}
      {children}
    </motion.main>
  );
}
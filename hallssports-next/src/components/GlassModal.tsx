"use client";

import { forwardRef, type ReactNode, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FocusTrap } from "@/components/FocusTrap";

interface GlassModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const GlassModal = forwardRef<HTMLDivElement, GlassModalProps>(
  function GlassModal({ open, onClose, title, children, className, maxWidth = "md" }, ref) {
    const lastFocusRef = useRef<HTMLElement | null>(null);

    const maxWidthClasses = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
    };

    // Save currently focused element when modal opens
    useEffect(() => {
      if (open) {
        lastFocusRef.current = document.activeElement as HTMLElement;
      }
    }, [open]);

    // Return focus to trigger on close
    useEffect(() => {
      if (!open && lastFocusRef.current) {
        // Use setTimeout to ensure DOM has updated
        setTimeout(() => {
          lastFocusRef.current?.focus();
          lastFocusRef.current = null;
        }, 0);
      }
    }, [open]);

    // Escape key closes modal
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      if (open) {
        document.addEventListener("keydown", handleEscape);
      }
      return () => document.removeEventListener("keydown", handleEscape);
    }, [open, onClose]);

    return (
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            />
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? "glass-modal-title" : undefined}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                "glass-strong fixed z-50 rounded-2xl p-6",
                maxWidthClasses[maxWidth],
                className
              )}
            >
              <div className="flex items-center justify-between mb-4">
                {title && <h2 id="glass-modal-title" className="text-xl font-bold">{title}</h2>}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FocusTrap enabled={open}>
                <div>{children}</div>
              </FocusTrap>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }
);
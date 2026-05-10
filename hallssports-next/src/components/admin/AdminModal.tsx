"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FocusTrap } from "@/components/FocusTrap";

type AdminModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function AdminModal({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = "md",
}: AdminModalProps) {
  const lastFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      lastFocusRef.current = document.activeElement as HTMLElement;
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && lastFocusRef.current) {
      setTimeout(() => {
        lastFocusRef.current?.focus();
        lastFocusRef.current = null;
      }, 0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className={cn(
              "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass rounded-2xl p-6 z-[100] max-h-[90vh] overflow-y-auto",
              size === "sm" && "w-full max-w-sm",
              size === "md" && "w-full max-w-md",
              size === "lg" && "w-full max-w-lg",
              className,
            )}
            onClick={e => e.stopPropagation()}
          >
            <FocusTrap enabled={isOpen}>
              <div>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 min-h-[44px] min-w-[44px] rounded-lg hover:bg-white/10 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none flex items-center justify-center"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
                {title && (
                  <h2 className="text-xl font-semibold text-foreground pr-8 mb-4">{title}</h2>
                )}
                {children}
              </div>
            </FocusTrap>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
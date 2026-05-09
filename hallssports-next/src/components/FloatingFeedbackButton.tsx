"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, X } from "lucide-react";
import { FeedbackModal } from "@/components/FeedbackModal";

export function FloatingFeedbackButton() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem("feedback_button_dismissed") === "true";
  });

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    sessionStorage.setItem("feedback_button_dismissed", "true");
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-20 right-4 z-45 md:bottom-24 md:right-6">
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(true)}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/90 hover:bg-primary text-white shadow-lg flex items-center justify-center transition-all group"
          aria-label="Send feedback"
        >
          <MessageSquare className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
        </motion.button>

        {/* Dismiss X */}
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 w-5 h-5 bg-muted-foreground/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs transition-colors"
          aria-label="Dismiss feedback button"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Modal */}
      <FeedbackModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

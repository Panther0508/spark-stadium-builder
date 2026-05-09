"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("hallssports_cookie_consent");
    if (consent !== "true") {
      // Use requestAnimationFrame to avoid cascading renders warning
      requestAnimationFrame(() => setVisible(true));
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("hallssports_cookie_consent", "true");
    setVisible(false);
  };

  const handleLearnMore = () => {
    window.open("/privacy", "_blank");
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-20 left-0 right-0 z-50 px-3"
      >
        <div className="glass-strong mx-auto max-w-md rounded-2xl px-4 py-4 flex flex-col sm:flex-row items-center gap-3">
          <p className="text-sm text-white/80 flex-1">
            We use cookies to ensure you get the best live match experience. By continuing, you agree to our Privacy Policy.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleLearnMore}
              className="px-3 py-1.5 text-sm border border-primary/40 text-primary rounded-lg hover:bg-primary/10 transition-colors"
            >
              Learn More
            </button>
            <button
              onClick={handleAccept}
              className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
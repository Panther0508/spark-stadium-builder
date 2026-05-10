"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { Home } from "lucide-react";

const DEFAULT_FEEDBACK_URL = process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL || "https://forms.gle/yourfeedbackform";

export default function NotFound() {
  const [feedbackUrl, setFeedbackUrl] = useState(DEFAULT_FEEDBACK_URL);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.feedback_url) setFeedbackUrl(json.feedback_url);
      })
      .catch(() => {
        /* keep default */
      });
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-10 text-center">
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="mb-6"
          >
            <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full grid place-items-center">
              <span className="text-4xl">⚽</span>
            </div>
          </motion.div>

          <h1 className="text-4xl font-black mb-2 text-glow">404 – Lost Ball</h1>
          <p className="text-lg text-muted-foreground mb-8">
            This page has gone out of play. Let&apos;s get you back to the action.
          </p>

          <div className="flex gap-3 justify-center">
            <Link href="/">
              <button className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center gap-2">
                <Home className="h-5 w-5" />
                Back to Home
              </button>
            </Link>
            <a
              href={feedbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/10 transition-all flex items-center"
            >
              Report broken link
            </a>
          </div>

          <div className="mt-8 text-sm text-muted-foreground">
            HallsSports © 2025
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
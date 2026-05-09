"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { GlassModal } from "@/components/GlassModal";
import { cn } from "@/lib/utils";

// Placeholder entry IDs – user must replace these with actual IDs from their Google Form
const ENTRY_IDS = {
  feedbackType: "entry.1234567890",
  subject: "entry.0987654321",
  description: "entry.1122334455",
  pageUrl: "entry.5544332211",
  userContact: "entry.6677889900",
} as const;

type FeedbackType = "Bug Report" | "Feature Request" | "General Feedback" | "Other";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("Bug Report");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [userContact, setUserContact] = useState("");
  const [pageUrl] = useState(typeof window !== "undefined" ? window.location.href : "");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const formUrl = process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL || "https://forms.gle/yourfeedbackform";

  // Reset form when modal opens
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (open) {
      setStatus("idle");
      setSubject("");
      setDescription("");
      setUserContact("");
      setFeedbackType("Bug Report");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      // Extract form ID from URL (between /d/e/ and /viewform)
      const formIdMatch = formUrl.match(/\/d\/e\/([^/]+)/);
      if (!formIdMatch) {
        throw new Error("Invalid Google Forms URL format");
      }
      const formId = formIdMatch[1];
      const submitUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;

      const formData = new FormData();
      formData.append(ENTRY_IDS.feedbackType, feedbackType);
      formData.append(ENTRY_IDS.subject, subject.trim());
      formData.append(ENTRY_IDS.description, description.trim());
      formData.append(ENTRY_IDS.pageUrl, pageUrl);
      if (userContact.trim()) {
        formData.append(ENTRY_IDS.userContact, userContact.trim());
      }

      await fetch(submitUrl, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });

      // no-cors means response is always "opaque" – treat any fetch success as OK
      setStatus("success");
    } catch (err) {
      console.error("Feedback submission error:", err);
      setStatus("error");
    }
  };

  const isFormValid = subject.trim().length > 0 && description.trim().length > 0;

  return (
    <GlassModal open={open} onClose={onClose} title="Send Feedback or Report a Bug" maxWidth="md">
      <div className="space-y-6">
        {/* Title with green underline */}
        <div className="relative">
          <h2 className="text-2xl font-bold text-foreground">Send Feedback or Report a Bug</h2>
          <div className="absolute -bottom-2 left-0 h-1 w-16 bg-primary rounded-full" />
        </div>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <CheckCircle className="w-16 h-16 text-primary mb-4" />
              <p className="text-lg font-medium text-foreground">Thanks for your feedback!</p>
              <p className="text-sm text-muted-foreground mt-2">We&apos;ll look into it.</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Desktop: Custom Form */}
              {status === "error" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-sm text-red-400">
                      The direct form submission failed. Please use the embedded form below.
                    </p>
                  </div>

                  {/* Google Forms Iframe Fallback */}
                  <div className="glass rounded-xl p-1 border border-white/10">
                    <iframe
                      src={formUrl}
                      width="100%"
                      height="600"
                      className="rounded-lg"
                      style={{ border: "none" }}
                      title="Feedback Form"
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    If the form doesn&apos;t load,{" "}
                    <a
                      href={formUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      open it in a new tab <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Feedback Type */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Feedback Type
                    </label>
                    <select
                      value={feedbackType}
                      onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
                      className="w-full px-3 py-2.5 rounded-lg glass border border-white/20 text-foreground focus:border-primary focus:outline-none transition-colors bg-white/5"
                    >
                      <option value="Bug Report">Bug Report</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="General Feedback">General Feedback</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Subject <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief summary of your feedback"
                      required
                      className="w-full px-3 py-2.5 rounded-lg glass border border-white/20 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-colors bg-white/5"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell us more details..."
                      rows={4}
                      required
                      className="w-full px-3 py-2.5 rounded-lg glass border border-white/20 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-colors resize-none bg-white/5"
                    />
                  </div>

                  {/* User Contact (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Contact (Optional)
                    </label>
                    <input
                      type="text"
                      value={userContact}
                      onChange={(e) => setUserContact(e.target.value)}
                      placeholder="Email or WhatsApp for follow-up"
                      className="w-full px-3 py-2.5 rounded-lg glass border border-white/20 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-colors bg-white/5"
                    />
                  </div>

                  {/* Hidden Page URL field (displayed as info only) */}
                  <div className="text-xs text-muted-foreground bg-white/5 rounded p-2 border border-white/10">
                    Page URL will be included automatically: {pageUrl}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!isFormValid || status === "loading"}
                    className={cn(
                      "w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold transition-opacity flex items-center justify-center gap-2",
                      (!isFormValid || status === "loading") && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {status === "loading" ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Sending...
                      </>
                    ) : (
                      "Submit Feedback"
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassModal>
  );
}

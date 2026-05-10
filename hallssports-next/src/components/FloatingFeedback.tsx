"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";

const DEFAULT_FEEDBACK_URL = process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL || "https://forms.gle/yourfeedbackform";

export function FloatingFeedback() {
  const [show, setShow] = useState(() => {
    if (typeof window === 'undefined') return true;
    return sessionStorage.getItem("hallsports_feedback_dismissed") !== "true";
  });
  const [feedbackUrl, setFeedbackUrl] = useState(DEFAULT_FEEDBACK_URL);

  useEffect(() => {
    // Fetch the feedback URL from settings
    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.feedback_url) setFeedbackUrl(json.feedback_url);
      })
      .catch(() => {
        // keep default
      });
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("hallsports_feedback_dismissed", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <a
        href={feedbackUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        aria-label="Send feedback"
      >
        <MessageSquare className="h-6 w-6" />
      </a>
      <button
        onClick={handleDismiss}
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white text-black text-xs flex items-center justify-center shadow hover:bg-gray-200 transition-colors"
        aria-label="Dismiss feedback button"
      >
        ×
      </button>
    </div>
  );
}

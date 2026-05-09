"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, X, Send, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { cn } from "@/lib/utils";

type ShareButtonProps = {
  title: string;
  text: string;
  url: string;
  className?: string;
};

export function ShareButton({ title, text, url, className }: ShareButtonProps) {
  const [showPopover, setShowPopover] = useState(false);
  const { addToast } = useToast();

   const handleNativeShare = async () => {
     if (navigator.share) {
       try {
         await navigator.share({ title, text, url });
       } catch (err) {
         console.error("Share failed:", err);
         // User cancelled or error
       }
     } else {
       setShowPopover(true);
     }
   };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(url);
    addToast({ type: "success", title: "Link copied!", description: "You can now paste it anywhere." });
    setShowPopover(false);
  };

  const shareToTwitter = () => {
    const tweetText = encodeURIComponent(`${text} ${url}`);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, "_blank");
  };

  const shareToFacebook = () => {
    const fbUrl = encodeURIComponent(url);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${fbUrl}`, "_blank");
  };

  const shareToWhatsApp = () => {
    const waText = encodeURIComponent(`${text} ${url}`);
    window.open(`https://wa.me/?text=${waText}`, "_blank");
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        onClick={handleNativeShare}
        className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
        aria-label="Share"
      >
        <Share2 className="w-5 h-5 text-primary" />
      </button>

      <AnimatePresence>
        {showPopover && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowPopover(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 glass-strong rounded-xl p-3 z-50 w-56"
            >
              <div className="space-y-2">
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Copy link</span>
                </button>
                <button
                  onClick={shareToTwitter}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span className="text-sm">Twitter</span>
                </button>
                <button
                  onClick={shareToFacebook}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm">Facebook</span>
                </button>
                <button
                  onClick={shareToWhatsApp}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">WhatsApp</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
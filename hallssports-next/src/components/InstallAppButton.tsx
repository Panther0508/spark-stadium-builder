"use client";

import { useState } from "react";
import { Download, Plus, Apple, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { GlassModal } from "@/components/GlassModal";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "primary" | "outline";
  className?: string;
};

function PWAInstructionsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const isIOS = typeof navigator !== "undefined" && (navigator.platform.includes("iPhone") || navigator.platform.includes("iPad"));

  return (
    <GlassModal open={open} onClose={onClose} title="Install HallsSports">
      <div className="space-y-4">
        {isIOS ? (
          <div className="flex items-center gap-3 p-3 glass rounded-lg">
            <Apple className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold">iOS Safari</p>
                 <ol className="text-sm text-muted-foreground mt-1 space-y-1">
                 <li>1. Tap the Share button</li>
                 <li>2. Select &quot;Add to Home Screen&quot;</li>
                 <li>3. Tap &quot;Add&quot; to confirm</li>
               </ol>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 glass rounded-lg">
            <Monitor className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold">Desktop Chrome/Edge</p>
               <ol className="text-sm text-muted-foreground mt-1 space-y-1">
                 <li>1. Click the install icon in the address bar</li>
                 <li>2. Click &quot;Install&quot; in the popup</li>
               </ol>
            </div>
          </div>
        )}
      </div>
    </GlassModal>
  );
}

export function InstallAppButton({ variant = "primary", className }: Props) {
  const { isInstallable, promptInstall } = useInstallPrompt();
  const [showInstructions, setShowInstructions] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleInstall = async () => {
    if (isInstallable) {
      const accepted = await promptInstall();
      if (accepted) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } else {
      setShowInstructions(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstall}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
          variant === "primary" && "bg-primary text-white hover:bg-primary/90",
          variant === "outline" && "glass hover:bg-white/20",
          className
        )}
      >
        {isInstallable ? <Plus className="h-4 w-4" /> : <Download className="h-4 w-4" />}
        <span>{isInstallable ? "Install HallsSports" : "Install App"}</span>
      </button>
      <PWAInstructionsModal open={showInstructions} onClose={() => setShowInstructions(false)} />
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-lg z-50"
          >
            App installed successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
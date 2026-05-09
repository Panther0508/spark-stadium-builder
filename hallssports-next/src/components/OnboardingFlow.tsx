"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { ChevronRight, Trophy, Users, BarChart3, Share2 } from "lucide-react";

interface OnboardingFlowProps {
  onComplete: () => void;
}

const steps = [
  {
    icon: Trophy,
    title: "Track Live Matches",
    description: "Follow your favorite teams with real-time scores and stats.",
  },
  {
    icon: Users,
    title: "Join the Community",
    description: "Chat with fans during live matches and share your predictions.",
  },
  {
    icon: BarChart3,
    title: "View Detailed Stats",
    description: "See player performance, match events, and league standings.",
  },
  {
    icon: Share2,
    title: "Share Highlights",
    description: "Export match data and share moments with friends.",
  },
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const onboarded = localStorage.getItem("hallssports_onboarded") === "true";
    if (onboarded) {
      onComplete();
    }
  }, [onComplete]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem("hallssports_onboarded", "true");
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem("hallssports_onboarded", "true");
    onComplete();
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25 }}
        >
          <GlassCard className="p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full grid place-items-center">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
            <p className="text-muted-foreground mb-6">{step.description}</p>

            <div className="flex justify-center gap-2 mb-6">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i === currentStep ? "bg-primary" : "bg-white/20"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 py-2 text-sm border border-white/20 rounded-lg hover:bg-white/10"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center gap-1"
              >
                {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
"use client";

import { GlassCard } from "@/components/GlassCard";
import { PageShell } from "@/components/PageShell";
import { motion } from "framer-motion";
import { BackButton } from "@/components/BackButton";

export default function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy">
      <BackButton />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <GlassCard className="p-6">
          <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              Your privacy is important to us. This policy explains what data we collect and how we use it.
            </p>
            <h2 className="font-bold text-lg">1. Information We Collect</h2>
            <p>We collect basic account information and usage data to improve our service.</p>
            <h2 className="font-bold text-lg">2. Cookies</h2>
            <p>We use cookies to remember your preferences and for analytics.</p>
            <h2 className="font-bold text-lg">3. Data Sharing</h2>
            <p>We do not sell or share your personal data with third parties.</p>
            <h2 className="font-bold text-lg">4. Your Rights</h2>
            <p>You may request deletion of your data at any time.</p>
          </div>
        </GlassCard>
      </motion.div>
    </PageShell>
  );
}
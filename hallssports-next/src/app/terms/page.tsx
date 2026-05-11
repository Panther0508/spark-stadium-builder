"use client";

import { GlassCard } from "@/components/GlassCard";
import { PageShell } from "@/components/PageShell";
import { motion } from "framer-motion";
import { BackButton } from "@/components/BackButton";

export default function TermsPage() {
  return (
    <PageShell title="Terms of Service">
      <BackButton />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <GlassCard className="p-6">
          <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              By accessing or using HallsSports, you agree to be bound by these Terms of Service.
            </p>
            <h2 className="font-bold text-lg">1. Use of Service</h2>
            <p>You may use our service for personal, non-commercial purposes only.</p>
            <h2 className="font-bold text-lg">2. Account Registration</h2>
            <p>You must be at least 13 years old to create an account.</p>
            <h2 className="font-bold text-lg">3. Content</h2>
            <p>We reserve the right to remove any content that violates our guidelines.</p>
            <h2 className="font-bold text-lg">4. Disclaimer</h2>
            <p>Live scores are for informational purposes only.</p>
          </div>
        </GlassCard>
      </motion.div>
    </PageShell>
  );
}
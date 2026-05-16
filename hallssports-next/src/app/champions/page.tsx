"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { PageShell } from "@/components/PageShell";
import { BackButton } from "@/components/BackButton";
import { Trophy, Award as AwardIcon } from "lucide-react";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

interface Award {
  id: string;
  category: string;
  winner_name: string;
  value: string;
  entity_image_url: string | null;
  winner?: string;
  image?: string;
}

export default function ChampionsPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAwards = async () => {
    try {
      const res = await fetch("/api/champions");
      if (!res.ok) throw new Error("Failed to load champions");
      const data = await res.json();
      setAwards(data.awards || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load champions");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
     // eslint-disable-next-line react-hooks/set-state-in-effect
     fetchAwards();
   }, []);

  if (loading) {
    return (
      <PageShell title="Champions">
        <BackButton />
        <div className="space-y-4">
          <ShimmerLoader height={200} width="100%" />
          <ShimmerLoader height={200} width="100%" />
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Champions">
        <BackButton />
        <ErrorState message={error} onRetry={fetchAwards} />
      </PageShell>
    );
  }

  if (awards.length === 0) {
    return (
      <PageShell title="Champions">
        <BackButton />
        <EmptyState 
          icon={<Trophy className="h-12 w-12 text-primary" />} 
          title="Champions will be announced soon!" 
        />
      </PageShell>
    );
  }

  return (
    <PageShell title="Champions">
      <BackButton />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {awards.map((award) => (
          <GlassCard key={award.id} className="p-4 flex flex-col items-center text-center">
            <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4 ring-2 ring-primary/30 bg-muted">
              {(award.entity_image_url || award.image) ? (
                <Image src={award.entity_image_url || award.image || ""} alt={award.winner_name || award.winner || "Winner"} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <AwardIcon className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <h3 className="font-bold text-lg mb-1">{award.category}</h3>
            <p className="text-primary font-bold text-xl">{award.winner_name || award.winner}</p>
            <p className="text-sm font-semibold text-green-500 mt-2">{award.value}</p>
          </GlassCard>
        ))}
      </motion.div>
    </PageShell>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { PageShell } from "@/components/PageShell";
import { BackButton } from "@/components/BackButton";
import { Trophy, Award, Calendar, ChevronDown } from "lucide-react";

type Award = {
  id: string;
  category: string;
  winner: string;
  value: string;
  image: string;
};

type HistoricalWinner = {
  year: string;
  awards: {
    category: string;
    winner: string;
    value: string;
  }[];
};

type ChampionsData = {
  awards: Award[];
  historical: HistoricalWinner[];
};

export default function ChampionsPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [historicalWinners, setHistoricalWinners] = useState<HistoricalWinner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistorical, setShowHistorical] = useState(false);

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const res = await fetch("/api/champions");
        if (!res.ok) throw new Error("Failed to fetch champions");
        const data: ChampionsData = await res.json();
        setAwards(data.awards);
        setHistoricalWinners(data.historical);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load champions");
      } finally {
        setLoading(false);
      }
    };
    fetchAwards();
  }, []);

  if (loading) {
    return (
      <PageShell title="Champions">
        <ShimmerLoader height={300} width="100%" />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Champions">
        <GlassCard className="p-6 text-center">
          <p className="text-red-400 mb-2">Error: {error}</p>
          <button onClick={() => window.location.reload()} className="text-primary underline">
            Retry
          </button>
        </GlassCard>
      </PageShell>
    );
  }

  return (
    <PageShell title="Champions">
      <BackButton />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Current Season Awards */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Current Season Awards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {awards.map((award) => (
              <GlassCard key={award.id} className="p-4 flex flex-col items-center text-center">
                <div className="relative w-16 h-16 rounded-full overflow-hidden mb-3 ring-2 ring-primary/30">
                  {award.image ? (
                    <Image src={award.image} alt={award.winner} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Trophy className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg">{award.category}</h3>
                <p className="text-primary font-medium">{award.winner}</p>
                <p className="text-sm text-muted-foreground">{award.value}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Historical Winners */}
        <section>
          <button
            onClick={() => setShowHistorical(!showHistorical)}
            className="flex items-center gap-2 text-xl font-bold mb-4 hover:text-primary transition-colors"
          >
            <Calendar className="h-5 w-5" />
            Historical Winners
            <ChevronDown
              className={`h-5 w-5 transition-transform ${showHistorical ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {showHistorical && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-6">
                  {historicalWinners.map((yearData) => (
                    <GlassCard key={yearData.year} className="p-4">
                      <h3 className="text-lg font-bold mb-3">{yearData.year} Season</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {yearData.awards.map((aw, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                            <Award className="h-8 w-8 text-primary flex-shrink-0" />
                            <div>
                              <div className="font-medium">{aw.category}</div>
                              <div className="text-sm text-muted-foreground">
                                {aw.winner} {aw.value && `• ${aw.value}`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </motion.div>
    </PageShell>
  );
}
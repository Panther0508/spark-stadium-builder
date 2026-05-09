"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { PageShell } from "@/components/PageShell";
import { Film } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { supabase } from "@/lib/supabase";
import { extractYouTubeID } from "@/lib/extractYouTubeID";

type Highlight = {
  id: string;
  title?: string;
  media_url: string;
  media_type: "image" | "video";
  created_at: string;
};

export default function HighlightsPage() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<"all" | "goals" | "saves" | "skills">("all");

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        if (!supabase) {
          setError("Supabase client not initialized");
          setLoading(false);
          return;
        }
        const { data } = await supabase
          .from("highlights")
          .select("*");
        setHighlights((data || []) as Highlight[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load highlights");
      } finally {
        setLoading(false);
      }
    };
    fetchHighlights();
  }, []);

  const filteredHighlights = category === "all" ? highlights : highlights;

  if (loading) {
    return (
      <PageShell title="Highlights">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-white/10 rounded animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <ShimmerLoader key={i} height={200} width="100%" />
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Highlights">
        <GlassCard className="p-6 text-center">
          <p className="text-red-400 mb-2">Error: {error}</p>
          <button onClick={() => window.location.reload()} className="text-primary underline">Retry</button>
        </GlassCard>
      </PageShell>
    );
  }

  return (
    <PageShell title="Highlights">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {(["all", "goals", "saves", "skills"] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                category === cat ? "bg-primary text-white" : "glass hover:bg-white/20"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Highlights Grid */}
        {filteredHighlights.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <Film className="h-12 w-12 text-primary/30 mx-auto mb-2" />
            <p className="text-muted-foreground">No highlights available yet</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHighlights.map((highlight, index) => {
              const isVideo = highlight.media_type === "video";
              const videoId = isVideo ? extractYouTubeID(highlight.media_url) : null;

              return (
                <motion.div
                  key={highlight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="p-0 overflow-hidden tilt">
                    <div className="relative aspect-video bg-black/20">
                       {isVideo && videoId ? (
                         <LiteYouTubeEmbed
                           id={videoId}
                           title={highlight.title || "Highlight"}
                           wrapperClass="yt-lite relative w-full h-full"
                           poster="maxresdefault"
                           webp
                         />
                      ) : (
                        <>
                          <Image
                            src={highlight.media_url}
                            alt={highlight.title || "Highlight"}
                            fill
                            className="object-cover"
                          />
                        </>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="font-bold text-white mb-2 line-clamp-2">{highlight.title}</h3>
                        <div className="flex items-center justify-between text-xs text-white/70" />
                      </div>
                      <div className="absolute top-2 right-2">
                        <ShareButton
                          title={highlight.title || ""}
                          text={`Check out this highlight: ${highlight.title}`}
                          url={`${typeof window !== "undefined" ? window.location.origin : ""}/highlights#${highlight.id}`}
                          className="glass bg-black/30"
                        />
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </PageShell>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { Skeleton } from "@/components/Skeleton";
import { PageShell } from "@/components/PageShell";
import { StatusBadge, TeamLogo } from "@/components/StatusBadge";
import { ErrorState } from "@/components/ErrorState";
import { MessageCircle, ChevronRight, Users, Trophy, BarChart3, Sparkles } from "lucide-react";
import { InstallAppButton } from "@/components/InstallAppButton";
import { format, formatDistanceToNow } from "date-fns";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import type { Match } from "@/lib/queries";

type FeaturedMatch = {
  id: string;
  home_team: string;
  away_team: string;
  home_score?: number;
  away_score?: number;
  status: "scheduled" | "live" | "finished" | "half-time";
  match_date: string;
  venue?: string;
  featured?: boolean;
};

type UpcomingMatch = {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  venue?: string;
  status: string;
};

type LiveMatch = {
  id: string;
  home_team: string;
  away_team: string;
  home_score?: number;
  away_score?: number;
  minute?: number;
  status: string;
};

type ChatMessage = {
  id: string;
  user_name: string;
  message: string;
  created_at: string;
};

export default function HomePage() {
  const [featuredMatch, setFeaturedMatch] = useState<FeaturedMatch | null>(null);
  const [upcomingMatches, setUpcomingMatches] = useState<UpcomingMatch[]>([]);
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [tournamentLogo, setTournamentLogo] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tournament logo from settings
        const settingsRes = await fetch("/api/settings");
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          setTournamentLogo(settings.tournament_logo);
        }

        // Fetch AI Insight (simulated or real)
        const insights = [
          "Expect a high-scoring match between Team A and Team B based on recent form.",
          "Player X is on a scoring streak! Watch out for them in the next match.",
          "The championship race is tightening up after the latest results."
        ];
        setAiInsight(insights[Math.floor(Math.random() * insights.length)]);

        // Fetch all matches in parallel
        const matchesRes = await fetch("/api/matches");
        if (!matchesRes.ok) throw new Error("Failed to load matches");
        const matches: Match[] = await matchesRes.json();

        // Determine featured, upcoming, live
        const featured = matches.find((m) => m.featured && m.status === "live") ||
                         matches.find((m) => m.status === "live") ||
                         matches.find((m) => m.status === "scheduled") ||
                         matches[0] || null;

        const now = new Date();
        const upcoming = matches
          .filter((m) => m.status === "scheduled" && new Date(m.match_date) > now)
          .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())
          .slice(0, 8);

        const live = matches.filter((m) => m.status === "live");

        setFeaturedMatch(featured);
        setUpcomingMatches(upcoming);
        setLiveMatches(live);

        // Fetch chat messages for the first live match (if any)
        const chatMatchId = live[0]?.id || featured?.id;
        if (chatMatchId) {
          const chatRes = await fetch(`/api/chat?matchId=${chatMatchId}`);
          if (chatRes.ok) {
            const chatData: ChatMessage[] = await chatRes.json();
            // API returns newest first; reverse to chronological
            setChatMessages(chatData.reverse().slice(0, 3));
          }
        }

        const onboarded = localStorage.getItem("hallssports_onboarded") === "true";
        if (!onboarded) {
          setTimeout(() => setShowOnboarding(true), 500);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load data";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem("hallssports_onboarded", "true");
  };

  if (loading) {
    return (
      <PageShell>
        <div className="space-y-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" height={200} />
          <Skeleton variant="card" height={120} />
          <Skeleton variant="card" height={100} />
        </div>
      </PageShell>
    );
  }

   return (
     <PageShell>
       {showOnboarding && (
         <OnboardingFlow onComplete={handleOnboardingComplete} />
       )}

       {/* Hero Section */}
      <section className="text-center py-12 md:py-16 space-y-6">
        {tournamentLogo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-4"
          >
            <div className="relative w-24 h-24 md:w-32 md:h-32">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tournamentLogo as string}
                alt="Tournament Logo"
                className="w-32 h-32 object-contain"
              />            </div>
          </motion.div>
        )}
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold"
          >
            Live Football,{" "}
            <span className="text-primary">Proudly Futoite</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Real-time scores, stats, and community chat for FUTO hostel competitions.
            Never miss a moment.
          </motion.p>
        </div>
      </section>

      {/* AI Insight Card */}
      {aiInsight && (
        <section className="mb-8">
          <GlassCard className="p-6 border-primary/30 bg-primary/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles className="h-24 w-24 text-primary" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg">AI Match Insight</h3>
            </div>
            <p className="text-muted-foreground relative z-10">{aiInsight}</p>
          </GlassCard>
        </section>
      )}

      {/* Featured Match */}
      {featuredMatch && (
        <section className="mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold">Featured Match</h2>
              {featuredMatch.status === "live" && (
                <span className="text-sm text-primary flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-live animate-live-pulse" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
                  </span>
                  LIVE
                </span>
              )}
            </div>
            <div className="flex items-center justify-center gap-6 py-4">
              <div className="text-center">
                <TeamLogo name={(featuredMatch.home_team || "UNK").substring(0,3)} color="#00A859" />
                <div className="mt-2 text-lg font-bold">{featuredMatch.home_team || "Unknown"}</div>
              </div>
              <div className="text-4xl font-black">
                {featuredMatch.status === "scheduled" ? "—" : `${featuredMatch.home_score ?? 0} : ${featuredMatch.away_score ?? 0}`}
              </div>
              <div className="text-center">
                <TeamLogo name={(featuredMatch.away_team || "UNK").substring(0,3)} color="#CC0000" />
                <div className="mt-2 text-lg font-bold">{featuredMatch.away_team || "Unknown"}</div>
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {featuredMatch.venue && <div>{featuredMatch.venue}</div>}
              {featuredMatch.match_date && (
                <div>{format(new Date(featuredMatch.match_date), "MMM d, h:mm a")}</div>
              )}
            </div>
            {featuredMatch.status === "live" && (
              <div className="text-center mt-4">
                <Link href={`/match/${featuredMatch.id}`} className="text-primary underline text-sm">
                  View live details &rarr;
                </Link>
              </div>
            )}
          </GlassCard>
        </section>
      )}

      {/* Live Matches Grid */}
      {liveMatches.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Live Now</h2>
            <Link href="/matches" className="text-primary text-sm flex items-center gap-1">
              All matches <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveMatches.map((match) => (
              <GlassCard key={match.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-primary flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-live animate-live-pulse" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
                    </span>
                    LIVE
                  </span>
                  {match.minute && <span className="text-xs text-muted-foreground">{match.minute}&apos;</span>}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="font-bold">{match.home_team}</div>
                  </div>
                  <div className="text-2xl font-black">
                    {match.home_score ?? 0} : {match.away_score ?? 0}
                  </div>
                  <div className="text-center flex-1">
                    <div className="font-bold">{match.away_team}</div>
                  </div>
                </div>
                <Link href={`/match/${match.id}`} className="block mt-3 text-center text-xs text-primary">
                  View details &rarr;
                </Link>
              </GlassCard>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Matches */}
      {upcomingMatches.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Upcoming</h2>
            <Link href="/matches" className="text-primary text-sm flex items-center gap-1">
              All matches <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingMatches.map((match) => (
              <GlassCard key={match.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">{match.home_team} vs {match.away_team}</div>
                    <div className="text-xs text-muted-foreground">
                      {match.venue} • {format(new Date(match.match_date), "MMM d, h:mm a")}
                    </div>
                  </div>
                  <StatusBadge status="scheduled" />
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      )}

      {/* Quick Links & Community */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Quick Stats */}
        <GlassCard className="p-6">
          <h3 className="font-bold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <div>
                <div className="text-lg font-bold">2.4K</div>
                <div className="text-xs text-muted-foreground">Fans Online</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-primary" />
              <div>
                <div className="text-lg font-bold">12</div>
                <div className="text-xs text-muted-foreground">Matches Today</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-primary" />
              <div>
                <div className="text-lg font-bold">45</div>
                <div className="text-xs text-muted-foreground">Goals Scored</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-primary" />
              <div>
                <div className="text-lg font-bold">1.2K</div>
                <div className="text-xs text-muted-foreground">Chat Messages</div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Recent Chat */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Community Chat</h3>
            <Link href="/community" className="text-primary text-sm flex items-center gap-1">
              Join <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {chatMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent messages. Be the first!
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="text-sm border-b border-white/5 pb-2 last:border-0">
                  <span className="font-bold text-primary">{msg.user_name}</span>
                  <span className="text-muted-foreground text-xs ml-2">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </span>
                  <p className="truncate">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </section>

      {/* CTA Section */}
      <section className="mb-8">
        <GlassCard className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Download the App</h3>
          <p className="text-muted-foreground mb-4">
            Get real-time notifications, offline access, and more.
          </p>
          <InstallAppButton />
        </GlassCard>
      </section>

      {error && (
        <div className="mb-4">
          <ErrorState
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      )}
    </PageShell>
  );
}
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { PageShell } from "@/components/PageShell";
import { StatusBadge, TeamLogo } from "@/components/StatusBadge";
import { BackButton } from "@/components/BackButton";
import { Search } from "lucide-react";
import { format } from "date-fns";

type Match = {
  id: string;
  home_team: string;
  away_team: string;
  home_score?: number | null;
  away_score?: number | null;
  status: "scheduled" | "live" | "finished" | "half-time";
  match_date: string;
  venue?: string;
  image_url?: string;
  featured?: boolean;
  community_visible?: boolean;
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "scheduled" | "finished">("all");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch("/api/matches");
        if (!res.ok) throw new Error("Failed to load matches");
        const data: Match[] = await res.json();
        setMatches(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load matches");
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const filteredMatches = useMemo(() => {
    let result = matches;
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.home_team.toLowerCase().includes(lower) ||
          m.away_team.toLowerCase().includes(lower) ||
          (m.venue?.toLowerCase() || "").includes(lower)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((m) => m.status === statusFilter);
    }
    return result;
  }, [matches, search, statusFilter]);

  const groupedMatches = useMemo(() => {
    const groups: Record<string, Match[]> = {};
    filteredMatches.forEach((match) => {
      const dateKey = format(new Date(match.match_date), "yyyy-MM-dd");
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(match);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredMatches]);

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) return "Today";
    if (format(date, "yyyy-MM-dd") === format(tomorrow, "yyyy-MM-dd")) return "Tomorrow";
    if (format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")) return "Yesterday";
    return format(date, "EEEE, MMM d");
  };

  if (loading) {
    return (
      <PageShell title="Matches">
        <ShimmerLoader height={400} width="100%" />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Matches">
        <GlassCard className="p-6 text-center">
          <p className="text-red-400 mb-2">Error: {error}</p>
          <button onClick={() => window.location.reload()} className="text-primary underline">Retry</button>
        </GlassCard>
      </PageShell>
    );
  }

  return (
    <PageShell title="Matches">
      <BackButton />
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by team or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/10 focus:border-primary outline-none"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "live", "scheduled", "finished"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "bg-primary text-white"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-8">
        {groupedMatches.map(([dateKey, dayMatches]) => (
          <div key={dateKey}>
            <h3 className="font-bold text-lg mb-4 text-primary">{getDateLabel(dateKey)}</h3>
            <div className="space-y-3">
              {dayMatches.map((match) => (
                <GlassCard key={match.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <TeamLogo
                        name={match.home_team.substring(0, 3)}
                        color="#00A859"
                      />
                      <div>
                        <div className="font-bold">{match.home_team} vs {match.away_team}</div>
                        <div className="text-xs text-muted-foreground">
                          {match.venue} • {format(new Date(match.match_date), "h:mm a")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-black">
                        {match.status === "scheduled" ? "—" : `${match.home_score ?? 0} : ${match.away_score ?? 0}`}
                      </div>
                      <StatusBadge status={match.status} />
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <Link href={`/match/${match.id}`} className="text-primary text-sm underline">
                      View match details
                    </Link>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        ))}
      </div>

      {groupedMatches.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          No matches found matching your criteria.
        </div>
      )}
    </PageShell>
  );
}
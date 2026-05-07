import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { GlassCard } from "@/components/GlassCard";
import { StatusBadge, TeamLogo } from "@/components/StatusBadge";
import { matches, type MatchStatus } from "@/lib/mock-data";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/matches")({
  head: () => ({ meta: [{ title: "Matches — HallsSports" }, { name: "description", content: "All fixtures: live, scheduled and finished matches." }] }),
  component: Matches,
});

const tabs: { key: "all" | MatchStatus; label: string }[] = [
  { key: "all", label: "All" }, { key: "live", label: "Live" }, { key: "scheduled", label: "Scheduled" }, { key: "finished", label: "Finished" },
];

function Matches() {
  const [tab, setTab] = useState<"all" | MatchStatus>("all");
  const [q, setQ] = useState("");
  const filtered = matches.filter((m) => (tab === "all" || m.status === tab) && (q === "" || (m.home.name + m.away.name).toLowerCase().includes(q.toLowerCase())));

  return (
    <PageShell title="Matches">
      <div className="glass rounded-2xl p-1 flex mb-3 relative">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn("flex-1 text-xs font-semibold py-2 rounded-xl transition-all", tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl px-3 py-2 flex items-center gap-2 mb-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search teams" className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground" />
      </div>

      <div className="space-y-2">
        {filtered.map((m) => (
          <Link key={m.id} to="/match/$id" params={{ id: m.id }}>
            <GlassCard className="p-3">
              <div className="flex items-center justify-between mb-2">
                <StatusBadge status={m.status} minute={m.minute} />
                <span className="text-xs text-muted-foreground">{new Date(m.date).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <TeamLogo name={m.home.short} color={m.home.color} />
                  <span className="text-sm">{m.home.name}</span>
                </div>
                <div className="text-2xl font-bold tabular-nums px-3">
                  {m.status === "scheduled" ? "—" : `${m.homeScore} : ${m.awayScore}`}
                </div>
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <span className="text-sm">{m.away.name}</span>
                  <TeamLogo name={m.away.short} color={m.away.color} />
                </div>
              </div>
            </GlassCard>
          </Link>
        ))}
        {filtered.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No matches found.</p>}
      </div>
    </PageShell>
  );
}

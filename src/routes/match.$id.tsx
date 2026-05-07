import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { GlassCard } from "@/components/GlassCard";
import { StatusBadge, TeamLogo } from "@/components/StatusBadge";
import { matches, matchEvents } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/match/$id")({
  head: () => ({ meta: [{ title: "Match — HallsSports" }] }),
  component: MatchDetail,
});

const eventIcon = { goal: "⚽", yellow: "🟨", red: "🟥", sub: "🔄" } as const;

function MatchDetail() {
  const { id } = Route.useParams();
  const m = matches.find((x) => x.id === id);
  if (!m) return <PageShell><p>Match not found.</p></PageShell>;
  const events = matchEvents.filter((e) => e.matchId === id).sort((a, b) => b.minute - a.minute);

  return (
    <PageShell>
      <Link to="/matches" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-3">
        <ArrowLeft className="h-4 w-4" /> All matches
      </Link>

      <GlassCard
        className={`p-6 mb-4 ${m.status === "live" ? "ring-2 ring-primary ring-glow" : ""}`}
        strong
      >
        <div className="flex justify-center mb-3"><StatusBadge status={m.status} minute={m.minute} /></div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamLogo name={m.home.short} color={m.home.color} />
            <span className="text-sm font-semibold">{m.home.name}</span>
          </div>
          <div className="text-5xl font-bold tabular-nums px-2">
            {m.homeScore}<span className="text-muted-foreground mx-2">–</span>{m.awayScore}
          </div>
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamLogo name={m.away.short} color={m.away.color} />
            <span className="text-sm font-semibold">{m.away.name}</span>
          </div>
        </div>
        <div className="text-center text-xs text-muted-foreground mt-3">{m.venue} · {new Date(m.date).toLocaleString()}</div>
      </GlassCard>

      <h2 className="text-lg font-semibold mb-2">Match events</h2>
      <div className="space-y-2">
        {events.map((e, i) => (
          <motion.div key={e.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
            <GlassCard className="p-3 flex items-center gap-3" tilt={false}>
              <div className="text-xs font-mono w-10 text-primary">{e.minute}'</div>
              <div className="text-xl">{eventIcon[e.type]}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{e.player}</div>
                {e.detail && <div className="text-xs text-muted-foreground">{e.detail}</div>}
              </div>
            </GlassCard>
          </motion.div>
        ))}
        {events.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No events yet.</p>}
      </div>
    </PageShell>
  );
}

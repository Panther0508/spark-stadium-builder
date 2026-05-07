import { createFileRoute, Link } from "@tanstack/react-router";
import { GlassCard } from "@/components/GlassCard";
import { PageShell } from "@/components/PageShell";
import { StatusBadge, TeamLogo } from "@/components/StatusBadge";
import { matches, announcements } from "@/lib/mock-data";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HallsSports — Live scores & stats" },
      { name: "description", content: "Live football scores, fixtures, standings and highlights from the Halls tournament." },
    ],
  }),
  component: Home,
});

function Home() {
  const live = matches.filter((m) => m.status === "live");
  const upcoming = matches.filter((m) => m.status === "scheduled").slice(0, 5);

  return (
    <PageShell>
      <div className="mb-6 mt-2">
        <h1 className="text-4xl font-bold text-glow">
          <span className="text-primary">Halls</span>Sports
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Live football, every angle.</p>
      </div>

      {/* Live carousel */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Live now</h2>
          <span className="text-xs text-muted-foreground">{live.length} match{live.length !== 1 && "es"}</span>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 snap-x">
          {live.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="snap-start shrink-0 w-72"
            >
              <Link to="/match/$id" params={{ id: m.id }}>
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <StatusBadge status={m.status} minute={m.minute} />
                    <span className="text-xs text-muted-foreground">{m.venue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <TeamLogo name={m.home.short} color={m.home.color} />
                      <span className="text-xs">{m.home.short}</span>
                    </div>
                    <div className="text-3xl font-bold tabular-nums px-3">
                      {m.homeScore}<span className="text-muted-foreground mx-1">–</span>{m.awayScore}
                    </div>
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <TeamLogo name={m.away.short} color={m.away.color} />
                      <span className="text-xs">{m.away.short}</span>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Insight */}
      <GlassCard className="p-4 mb-6 bg-gradient-ai">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/30 p-2"><Sparkles className="h-5 w-5 text-primary" /></div>
          <div className="flex-1">
            <h3 className="font-semibold">AI Match Summary</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Crimson Lions dominate possession 63%. Carter on track for hat-trick.
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground self-center" />
        </div>
      </GlassCard>

      {/* Upcoming */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Upcoming</h2>
        <div className="space-y-2">
          {upcoming.map((m) => (
            <Link key={m.id} to="/match/$id" params={{ id: m.id }}>
              <GlassCard className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TeamLogo name={m.home.short} color={m.home.color} />
                  <span className="text-xs text-muted-foreground">vs</span>
                  <TeamLogo name={m.away.short} color={m.away.color} />
                </div>
                <div className="text-right">
                  <div className="text-xs">{new Date(m.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div>
                  <div className="text-xs text-muted-foreground">{new Date(m.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>

      {/* Announcements */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Announcements</h2>
        <div className="grid grid-cols-1 gap-2">
          {announcements.slice(0, 3).map((a) => (
            <GlassCard key={a.id} className="p-3">
              <div className="text-sm font-semibold">{a.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{a.body}</div>
            </GlassCard>
          ))}
        </div>
      </section>

      <Link to="/standings" className="block">
        <button className="w-full rounded-2xl bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">
          View full standings
        </button>
      </Link>
    </PageShell>
  );
}

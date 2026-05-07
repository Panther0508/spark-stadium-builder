import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { GlassCard } from "@/components/GlassCard";
import { champions } from "@/lib/mock-data";
import { Trophy, Target, Shield, Handshake, Award } from "lucide-react";

export const Route = createFileRoute("/champions")({
  head: () => ({ meta: [{ title: "Champions — HallsSports" }, { name: "description", content: "Tournament champions and award winners." }] }),
  component: Champions,
});

function Champions() {
  const cards = [
    { icon: Trophy, label: "Champions", primary: champions.championTeam.name, sub: "Tournament winners", color: champions.championTeam.color },
    { icon: Target, label: "Top scorer", primary: champions.topScorer.name, sub: `${champions.topScorer.value} goals · ${champions.topScorer.team}` },
    { icon: Shield, label: "Best keeper", primary: champions.bestKeeper.name, sub: `${champions.bestKeeper.value} · ${champions.bestKeeper.team}` },
    { icon: Award, label: "Most assists", primary: champions.mostAssists.name, sub: `${champions.mostAssists.value} assists · ${champions.mostAssists.team}` },
    { icon: Handshake, label: "Fair play", primary: champions.fairPlay.name, sub: "Cleanest record", color: champions.fairPlay.color },
  ];
  return (
    <PageShell title="Champions">
      <div className="grid grid-cols-1 gap-3">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <GlassCard key={i} className="p-4 flex items-center gap-3" strong>
              <div className="rounded-2xl p-3 bg-gradient-primary ring-glow">
                <Icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</div>
                <div className="text-lg font-bold">{c.primary}</div>
                <div className="text-xs text-muted-foreground">{c.sub}</div>
              </div>
              {c.color && <div className="h-10 w-10 rounded-full" style={{ background: c.color, boxShadow: `0 0 16px ${c.color}` }} />}
            </GlassCard>
          );
        })}
      </div>
    </PageShell>
  );
}

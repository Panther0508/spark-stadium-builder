import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { GlassCard } from "@/components/GlassCard";
import { TeamLogo } from "@/components/StatusBadge";
import { standings } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/standings")({
  head: () => ({ meta: [{ title: "Standings — HallsSports" }, { name: "description", content: "Tournament league table and team standings." }] }),
  component: Standings,
});

function Standings() {
  return (
    <PageShell title="Standings">
      <GlassCard className="p-2 overflow-x-auto" tilt={false}>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th className="px-2 py-2 text-left">#</th>
              <th className="px-2 py-2 text-left sticky left-0">Team</th>
              {["GP","W","D","L","GF","GA","Pts"].map((h) => <th key={h} className="px-2 py-2 text-center">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {standings.map((r) => (
              <tr key={r.team.id} className={cn("border-t border-white/5", r.pos <= 3 && "bg-primary/10")}>
                <td className="px-2 py-2 font-bold text-primary">{r.pos}</td>
                <td className="px-2 py-2 sticky left-0">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full" style={{ background: r.team.color }} />
                    <span className="whitespace-nowrap">{r.team.name}</span>
                  </div>
                </td>
                <td className="px-2 py-2 text-center tabular-nums">{r.gp}</td>
                <td className="px-2 py-2 text-center tabular-nums">{r.w}</td>
                <td className="px-2 py-2 text-center tabular-nums">{r.d}</td>
                <td className="px-2 py-2 text-center tabular-nums">{r.l}</td>
                <td className="px-2 py-2 text-center tabular-nums">{r.gf}</td>
                <td className="px-2 py-2 text-center tabular-nums">{r.ga}</td>
                <td className="px-2 py-2 text-center tabular-nums font-bold">{r.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="hidden"><TeamLogo name="X" color="#000" /></div>
      </GlassCard>
    </PageShell>
  );
}

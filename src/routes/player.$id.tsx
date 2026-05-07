import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { GlassCard } from "@/components/GlassCard";
import { players } from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/player/$id")({
  component: PlayerProfile,
});

function Counter({ value }: { value: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 800);
      setN(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className="tabular-nums">{n}</span>;
}

function PlayerProfile() {
  const { id } = Route.useParams();
  const p = players.find((x) => x.id === id);
  if (!p) return <PageShell><p>Player not found.</p></PageShell>;

  const stats = [
    { label: "Apps", value: p.appearances },
    { label: "Goals", value: p.goals },
    { label: "Assists", value: p.assists },
    { label: "Yellow", value: p.yellow },
    { label: "Red", value: p.red },
  ];

  return (
    <PageShell>
      <Link to="/players" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-3">
        <ArrowLeft className="h-4 w-4" /> All players
      </Link>
      <GlassCard className="p-6 mb-4 text-center" strong>
        <div className="mx-auto h-24 w-24 rounded-full bg-gradient-primary grid place-items-center text-3xl font-bold text-primary-foreground ring-glow">
          {p.number}
        </div>
        <h2 className="text-2xl font-bold mt-3">{p.name}</h2>
        <p className="text-sm text-muted-foreground">{p.team} · {p.position}</p>
      </GlassCard>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {stats.map((s) => (
          <GlassCard key={s.label} className="p-3 text-center" tilt={false}>
            <div className="text-xl font-bold text-primary"><Counter value={s.value} /></div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">{s.label}</div>
          </GlassCard>
        ))}
      </div>

      <h3 className="text-lg font-semibold mb-2">Recent form</h3>
      <div className="flex gap-2">
        {["W","W","D","L","W"].map((r, i) => (
          <div key={i} className={`h-8 w-8 rounded-lg grid place-items-center text-xs font-bold ${r === "W" ? "bg-primary text-primary-foreground" : r === "D" ? "bg-muted" : "bg-destructive/80"}`}>{r}</div>
        ))}
      </div>
    </PageShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { GlassCard } from "@/components/GlassCard";
import { players } from "@/lib/mock-data";
import { Search } from "lucide-react";

export const Route = createFileRoute("/players")({
  head: () => ({ meta: [{ title: "Players — HallsSports" }, { name: "description", content: "Player roster, profiles and stats." }] }),
  component: Players,
});

function Players() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"name" | "team" | "number">("name");
  const list = useMemo(() => {
    return players
      .filter((p) => (p.name + p.team + p.position).toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => {
        if (sort === "number") return a.number - b.number;
        return (a[sort] as string).localeCompare(b[sort] as string);
      });
  }, [q, sort]);

  return (
    <PageShell title="Players">
      <div className="glass rounded-2xl px-3 py-2 flex items-center gap-2 mb-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search players, teams, positions" className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground" />
      </div>
      <div className="flex gap-2 mb-3 text-xs">
        {(["name","team","number"] as const).map((s) => (
          <button key={s} onClick={() => setSort(s)} className={`glass rounded-full px-3 py-1 ${sort === s ? "ring-1 ring-primary text-primary" : "text-muted-foreground"}`}>
            Sort: {s}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {list.map((p) => (
          <Link key={p.id} to="/player/$id" params={{ id: p.id }}>
            <GlassCard className="p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-primary grid place-items-center text-sm font-bold text-primary-foreground">
                {p.number}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground truncate">{p.team} · {p.position}</div>
              </div>
              <div className="text-xs text-right">
                <div className="text-primary font-bold">{p.goals}G</div>
                <div className="text-muted-foreground">{p.assists}A</div>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}

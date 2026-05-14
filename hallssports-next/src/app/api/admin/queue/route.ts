import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST() {
  try {
    const supabase = getSupabaseAdminClient();

    // Fetch unverified items from multiple tables
    // Using select('*') first to be safe, then we can refine if needed.
    // Joining only what is absolutely necessary.
    const [matchesRes, eventsRes, playersRes, announcementsRes, highlightsRes] = await Promise.all([
      supabase.from("matches").select("id, status, match_date, created_at, home_team:home_team_id(name), away_team:away_team_id(name)").eq("is_verified", false),
      supabase.from("match_events").select("id, event_type, type, minute, player_name, created_at").eq("is_verified", false),
      supabase.from("players").select("id, name, number, created_at, team:team_id(name)").eq("is_verified", false),
      supabase.from("announcements").select("id, title, body, created_at").eq("is_verified", false),
      supabase.from("highlights").select("id, title, match_id, created_at").eq("is_verified", false),
    ]);

    // Check for errors individually to help debugging
    if (matchesRes.error) console.error("Queue fetch error (matches):", matchesRes.error);
    if (eventsRes.error) console.error("Queue fetch error (events):", eventsRes.error);
    if (playersRes.error) console.error("Queue fetch error (players):", playersRes.error);
    if (announcementsRes.error) console.error("Queue fetch error (announcements):", announcementsRes.error);
    if (highlightsRes.error) console.error("Queue fetch error (highlights):", highlightsRes.error);

    const queueItems: { id: string; type: string; summary: string; created_at: string }[] = [];

    // Matches
    matchesRes.data?.forEach((match: { id: string; status: string; created_at: string; home_team: { name: string } | null; away_team: { name: string } | null }) => {
      const homeName = match.home_team?.name || "TBD";
      const awayName = match.away_team?.name || "TBD";
      queueItems.push({
        id: match.id,
        type: "match",
        summary: `Match: ${homeName} vs ${awayName} (${match.status || "Scheduled"})`,
        created_at: match.created_at,
      });
    });

    // Events
    eventsRes.data?.forEach((event: { id: string; event_type: string; type: string; minute: number; player_name: string; created_at: string }) => {
      queueItems.push({
        id: event.id,
        type: "event",
        summary: `${event.event_type || event.type || "Event"}: ${event.player_name || "Unknown"} at ${event.minute}'`,
        created_at: event.created_at,
      });
    });

    // Players
    playersRes.data?.forEach((player: { id: string; name: string; number: string; created_at: string; team: { name: string } | null }) => {
      const teamName = player.team?.name || "Free Agent";
      queueItems.push({
        id: player.id,
        type: "player",
        summary: `Player: ${player.name} (${teamName}, #${player.number || "?"})`,
        created_at: player.created_at,
      });
    });

    // Announcements
    announcementsRes.data?.forEach((ann: { id: string; title: string; body: string; created_at: string }) => {
      queueItems.push({
        id: ann.id,
        type: "announcement",
        summary: `Announcement: ${ann.title || ann.body?.slice(0, 50)}...`,
        created_at: ann.created_at,
      });
    });

    // Highlights
    highlightsRes.data?.forEach((h: { id: string; title: string; created_at: string }) => {
      queueItems.push({
        id: h.id,
        type: "highlight",
        summary: `Highlight: ${h.title || "Match highlight"}`,
        created_at: h.created_at,
      });
    });

    // Sort by created_at desc
    queueItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(queueItems);
  } catch (error) {
    console.error("Error fetching verifier queue:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch queue";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST() {
  try {
    const supabase = getSupabaseAdminClient();

    // Fetch unverified items from multiple tables
    const [matchesRes, eventsRes, playersRes, announcementsRes, highlightsRes] = await Promise.all([
      supabase.from("matches").select("id, status, match_date, created_at, home_team:home_team_id(name), away_team:away_team_id(name)").eq("is_verified", false),
      supabase.from("match_events").select("id, type, minute, player_name, created_at, matches(home_team:home_team_id(name), away_team:away_team_id(name))").eq("is_verified", false),
      supabase.from("players").select("id, name, number, position, created_at, teams:team_id(name)").eq("is_verified", false),
      supabase.from("announcements").select("id, title, created_at").eq("is_verified", false),
      supabase.from("highlights").select("id, title, created_at, media_type").eq("is_verified", false),
    ]);

    const queueItems: { id: string; type: string; summary: string; created_at: string }[] = [];

    // Matches
    matchesRes.data?.forEach((match: { id: string; status: string; match_date: string; created_at: string; home_team: { name: string } | null; away_team: { name: string } | null }) => {
      queueItems.push({
        id: match.id,
        type: "match",
        summary: `New Match: ${match.home_team?.name || 'TBD'} vs ${match.away_team?.name || 'TBD'} on ${new Date(match.match_date).toLocaleDateString()}`,
        created_at: match.created_at,
      });
    });

    // Events
    eventsRes.data?.forEach((event: { id: string; type: string; minute: number; player_name: string; created_at: string; matches: { home_team: { name: string } | null; away_team: { name: string } | null } | null }) => {
      const match = event.matches;
      const matchLabel = match ? ` (${match.home_team?.name} vs ${match.away_team?.name})` : '';
      queueItems.push({
        id: event.id,
        type: "event",
        summary: `Event: ${event.type.toUpperCase()} by ${event.player_name} at ${event.minute}'${matchLabel}`,
        created_at: event.created_at,
      });
    });

    // Players
    playersRes.data?.forEach((player: { id: string; name: string; number: number; position: string; created_at: string; teams: { name: string } | null }) => {
      queueItems.push({
        id: player.id,
        type: "player",
        summary: `Player: ${player.name} (#${player.number}, ${player.position}) for ${player.teams?.name || 'Unknown'}`,
        created_at: player.created_at,
      });
    });

    // Announcements
    announcementsRes.data?.forEach((ann: { id: string; title: string; created_at: string }) => {
      queueItems.push({
        id: ann.id,
        type: "announcement",
        summary: `Announcement: ${ann.title}`,
        created_at: ann.created_at,
      });
    });

    // Highlights
    highlightsRes.data?.forEach((h: { id: string; title: string; created_at: string; media_type: string }) => {
      queueItems.push({
        id: h.id,
        type: "highlight",
        summary: `Highlight (${h.media_type}): ${h.title || 'Untitled'}`,
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

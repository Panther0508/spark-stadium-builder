import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

interface SupabaseTeam {
  name: string;
}

interface SupabaseMatch {
  id: string;
  home_team: SupabaseTeam | null;
  away_team: SupabaseTeam | null;
  status: string;
  created_at: string;
}

interface SupabasePlayer {
  id: string;
  name: string;
  team: SupabaseTeam | null;
  jersey_number: string | number;
  created_at: string;
}

interface SupabaseEvent {
  id: string;
  event_type: string;
  minute: number;
  player: { name: string } | null;
  assist_player_id: string | null;
  created_at: string;
}

interface SupabaseAnnouncement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface SupabaseHighlight {
  id: string;
  title: string;
  match_id: string;
  created_at: string;
}

export async function POST() {
  try {
    const supabase = createAdminClient();

    // Fetch unverified items from multiple tables
    const [matches, events, players, announcements, highlights] = await Promise.all([
      supabase.from("matches").select("*, home_team:home_team_id(name), away_team:away_team_id(name)").eq("is_verified", false),
      supabase.from("match_events").select("*, match:match_id(id, home_team_id, away_team_id), player:player_id(id, name, team_id)").eq("is_verified", false),
      supabase.from("players").select("*, team:team_id(name)").eq("is_verified", false),
      supabase.from("announcements").select("*").eq("is_verified", false),
      supabase.from("highlights").select("*").eq("is_verified", false),
    ]);

    // Check for errors
    if (matches.error) throw matches.error;
    if (events.error) throw events.error;
    if (players.error) throw players.error;
    if (announcements.error) throw announcements.error;
    if (highlights.error) throw highlights.error;

    // Transform the data into a unified format
    const queueItems: { id: string; type: string; summary: string; created_at: string }[] = [];

    // Matches
    (matches.data as unknown as SupabaseMatch[])?.forEach((match) => {
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
    (events.data as unknown as SupabaseEvent[])?.forEach((event) => {
      const playerName = event.player?.name || "Unknown Player";
      queueItems.push({
        id: event.id,
        type: "event",
        summary: `${event.event_type || "Event"}: ${playerName} at ${event.minute}'${event.event_type === "goal" && event.assist_player_id ? ` (assist by ${event.assist_player_id})` : ""}`,
        created_at: event.created_at,
      });
    });

    // Players
    (players.data as unknown as SupabasePlayer[])?.forEach((player) => {
      const teamName = player.team?.name || "TBD";
      queueItems.push({
        id: player.id,
        type: "player",
        summary: `Player: ${player.name} (${teamName}, #${player.jersey_number || "?"})`,
        created_at: player.created_at,
      });
    });

    // Announcements
    (announcements.data as unknown as SupabaseAnnouncement[])?.forEach((announcement) => {
      queueItems.push({
        id: announcement.id,
        type: "announcement",
        summary: `Announcement: ${announcement.title || announcement.content?.slice(0, 50)}...`,
        created_at: announcement.created_at,
      });
    });

    // Highlights
    (highlights.data as unknown as SupabaseHighlight[])?.forEach((highlight) => {
      queueItems.push({
        id: highlight.id,
        type: "highlight",
        summary: `Highlight: ${highlight.title || "Match highlight"} - ${highlight.match_id ? `Match ${highlight.match_id}` : ""}`,
        created_at: highlight.created_at,
      });
    });

    return NextResponse.json(queueItems);
  } catch (error) {
    console.error("Error fetching verifier queue:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch queue";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET(_request: Request) {
  try {
    const supabase = getSupabaseAdminClient();

    // Initialize all counts to 0
    let matches_today = 0;
    let live_matches = 0;
    let players_registered = 0;
    let pending_announcements = 0;
    let unverified_items = 0;
    let highlights_published = 0;
    let pending_matches = 0;
    let pending_events = 0;
    let approved_today = 0;

    // matches_today: count of matches where match_date is today
    try {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const { count } = await (supabase as any).from("matches")
        .select("id", { count: "exact", head: true })
        .gte("match_date", today)
        .lt("match_date", tomorrow);
      matches_today = count ?? 0;
    } catch (e) {
      console.error("Error fetching matches_today:", e);
    }

    // live_matches: count of matches with status = 'live'
    try {
      const { count } = await (supabase as any).from("matches")
        .select("id", { count: "exact", head: true })
        .eq("status", "live");
      live_matches = count ?? 0;
    } catch (e) {
      console.error("Error fetching live_matches:", e);
    }

    // players_registered: count of all players
    try {
      const { count } = await (supabase as any).from("players")
        .select("id", { count: "exact", head: true });
      players_registered = count ?? 0;
    } catch (e) {
      console.error("Error fetching players_registered:", e);
    }

    // highlights_published: count of highlights where is_verified = true
    try {
      const { count } = await (supabase as any).from("highlights")
        .select("id", { count: "exact", head: true })
        .eq("is_verified", true);
      highlights_published = count ?? 0;
    } catch (e) {
      console.error("Error fetching highlights_published:", e);
    }

    // approved_today: count of logs where action like 'APPROVE%' and created_at is today
    try {
      const today = new Date().toISOString().split('T')[0];
      const { count } = await (supabase as any).from("admin_logs")
        .select("id", { count: "exact", head: true })
        .ilike("action", "APPROVE%")
        .gte("created_at", today);
      approved_today = count ?? 0;
    } catch (e) {
      // Fallback if admin_logs doesn't exist or is empty
      approved_today = 0;
    }

    // unverified counts
    try {
      // matches
      try {
        const { count } = await (supabase as any).from("matches")
          .select("id", { count: "exact", head: true })
          .eq("is_verified", false);
        pending_matches = count ?? 0;
      } catch (e) {
        pending_matches = 0;
      }

      // match_events
      try {
        const { count } = await (supabase as any).from("match_events")
          .select("id", { count: "exact", head: true })
          .eq("is_verified", false);
        pending_events = count ?? 0;
      } catch (e) {
        pending_events = 0;
      }

      // announcements
      try {
        const { count } = await (supabase as any).from("announcements")
          .select("id", { count: "exact", head: true })
          .eq("is_verified", false);
        pending_announcements = count ?? 0;
      } catch (e) {
        pending_announcements = 0;
      }

      // players
      let pending_players = 0;
      try {
        const { count } = await (supabase as any).from("players")
          .select("id", { count: "exact", head: true })
          .eq("is_verified", false);
        pending_players = count ?? 0;
      } catch (e) {
        pending_players = 0;
      }

      // highlights
      let pending_highlights = 0;
      try {
        const { count } = await (supabase as any).from("highlights")
          .select("id", { count: "exact", head: true })
          .eq("is_verified", false);
        pending_highlights = count ?? 0;
      } catch (e) {
        pending_highlights = 0;
      }

      unverified_items = pending_matches + pending_events + pending_announcements + pending_players + pending_highlights;
    } catch (e) {
      console.error("Error calculating unverified_items:", e);
    }

    return NextResponse.json({
      matches_today,
      live_matches,
      players_registered,
      pending_announcements,
      unverified_items,
      highlights_published,
      pending_matches,
      pending_events,
      approved_today,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
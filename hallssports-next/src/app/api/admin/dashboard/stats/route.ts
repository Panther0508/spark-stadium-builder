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

    // matches_today: count of matches where match_date is today
    try {
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from("matches")
        .select("id", { count: "exact", head: true })
        .gte("match_date", today)
        .lt("match_date", new Date(Date.now() + 86400000).toISOString().split('T')[0]); // tomorrow
      matches_today = count ?? 0;
    } catch (e) {
      console.error("Error fetching matches_today:", e);
    }

    // live_matches: count of matches with status = 'live'
    try {
      const { count } = await supabase
        .from("matches")
        .select("id", { count: "exact", head: true })
        .eq("status", "live");
      live_matches = count ?? 0;
    } catch (e) {
      console.error("Error fetching live_matches:", e);
    }

    // players_registered: count of all players
    try {
      const { count } = await supabase
        .from("players")
        .select("id", { count: "exact", head: true });
      players_registered = count ?? 0;
    } catch (e) {
      console.error("Error fetching players_registered:", e);
    }

    // pending_announcements: count of announcements where is_verified = false
    try {
      const { count } = await supabase
        .from("announcements")
        .select("id", { count: "exact", head: true })
        .eq("is_verified", false);
      pending_announcements = count ?? 0;
    } catch (e) {
      console.error("Error fetching pending_announcements:", e);
    }

    // highlights_published: count of highlights where is_verified = true
    try {
      const { count } = await supabase
        .from("highlights")
        .select("id", { count: "exact", head: true })
        .eq("is_verified", true);
      highlights_published = count ?? 0;
    } catch (e) {
      console.error("Error fetching highlights_published:", e);
    }

    // unverified_items: total rows where is_verified = false across matches, match_events, players, announcements, highlights
    try {
      // We'll fetch each table's unverified count and sum them
      let totalUnverified = 0;

      // matches: where is_verified = false (if column exists) or we can use a different condition?
      // The prompt says "unverified_items – total rows where is_verified = false across matches, match_events, players, announcements, highlights"
      // We assume each of these tables has an is_verified column.
      // If a table doesn't have is_verified, we skip it or use an alternative? We'll try and catch.

      // matches
      try {
        const { count } = await supabase
          .from("matches")
          .select("id", { count: "exact", head: true })
          .eq("is_verified", false);
        totalUnverified += count ?? 0;
      } catch (e) {
        // If the column doesn't exist, we ignore this table for unverified count
        if (e instanceof Error) {
          console.warn("matches table does not have is_verified column or error:", e.message);
        } else {
          console.warn("matches table does not have is_verified column or error:", e);
        }
      }

      // match_events
      try {
        const { count } = await supabase
          .from("match_events")
          .select("id", { count: "exact", head: true })
          .eq("is_verified", false);
        totalUnverified += count ?? 0;
      } catch (e) {
        if (e instanceof Error) {
          console.warn("match_events table does not have is_verified column or error:", e.message);
        } else {
          console.warn("match_events table does not have is_verified column or error:", e);
        }
      }

      // players
      try {
        const { count } = await supabase
          .from("players")
          .select("id", { count: "exact", head: true })
          .eq("is_verified", false);
        totalUnverified += count ?? 0;
      } catch (e) {
        if (e instanceof Error) {
          console.warn("players table does not have is_verified column or error:", e.message);
        } else {
          console.warn("players table does not have is_verified column or error:", e);
        }
      }

      // announcements (we already have pending_announcements, but we'll add to total)
      try {
        const { count } = await supabase
          .from("announcements")
          .select("id", { count: "exact", head: true })
          .eq("is_verified", false);
        totalUnverified += count ?? 0;
      } catch (e) {
        if (e instanceof Error) {
          console.warn("announcements table does not have is_verified column or error:", e.message);
        } else {
          console.warn("announcements table does not have is_verified column or error:", e);
        }
      }

      // highlights
      try {
        const { count } = await supabase
          .from("highlights")
          .select("id", { count: "exact", head: true })
          .eq("is_verified", false);
        totalUnverified += count ?? 0;
      } catch (e) {
        if (e instanceof Error) {
          console.warn("highlights table does not have is_verified column or error:", e.message);
        } else {
          console.warn("highlights table does not have is_verified column or error:", e);
        }
      }

      unverified_items = totalUnverified;
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
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
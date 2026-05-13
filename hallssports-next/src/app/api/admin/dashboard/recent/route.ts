import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET(_request: Request) {
  try {
    const supabase = getSupabaseAdminClient();

    // Fetch recent announcements (last 5)
    const { data: announcements, error: annError } = await supabase
      .from("announcements")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    if (annError) throw annError;

    // Fetch recent highlights (last 5)
    const { data: highlights, error: highError } = await supabase
      .from("highlights")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    if (highError) throw highError;

    // Fetch recent matches (last 5)
    const { data: matches, error: matchError } = await supabase
      .from("matches")
      .select("id, match_date")
      .order("match_date", { ascending: false })
      .limit(5);
    if (matchError) throw matchError;

    // Combine and format as recent activity
    const recentActivity: Array<{id: string; type: string; summary: string; timestamp: string}> = [];

    if (announcements) {
      (announcements as { id: string; title: string; created_at: string }[]).forEach((ann) => {
        recentActivity.push({
          id: ann.id,
          type: "announcement",
          summary: ann.title || "Announcement update",
          timestamp: ann.created_at,
        });
      });
    }

    if (highlights) {
      (highlights as { id: string; title: string; created_at: string }[]).forEach((high) => {
        recentActivity.push({
          id: high.id,
          type: "highlight",
          summary: high.title || "Highlight added",
          timestamp: high.created_at,
        });
      });
    }

    if (matches) {
      (matches as { id: string; match_date: string }[]).forEach((match) => {
        recentActivity.push({
          id: match.id,
          type: "match",
          summary: `Match scheduled for ${new Date(match.match_date).toLocaleDateString()}`,
          timestamp: match.match_date,
        });
      });
    }

    // Sort by timestamp descending
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Take only the 10 most recent
    const limitedActivity = recentActivity.slice(0, 10);

    return NextResponse.json(limitedActivity);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent activity" },
      { status: 500 }
    );
  }
}
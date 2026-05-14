import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

interface Announcement { id: string; title: string; created_at: string; }
interface Highlight { id: string; title: string; created_at: string; }
interface Match { id: string; match_date: string; }
interface AdminLog {
  id: string;
  action: string;
  table_name: string;
  details: unknown; // details is JSONB, so any or record is fine, but we'll use unknown or Record
  created_at: string;
}

export async function GET(_request: Request) {
  try {
    const supabase = getSupabaseAdminClient();

    // Fetch recent admin logs (last 10)
    const { data: logs, error: logError } = await supabase
      .from("admin_logs")
      .select("id, action, table_name, details, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    
    if (logError) {
      console.warn("Failed to fetch admin_logs, falling back to basic activity:", logError.message);
      
      // Fallback: Combine and format basic activity from other tables
      const [announcements, highlights, matches] = await Promise.all([
        supabase.from("announcements").select("id, title, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("highlights").select("id, title, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("matches").select("id, match_date").order("match_date", { ascending: false }).limit(5),
      ]);

      const fallbackActivity: Array<{id: string; type: string; summary: string; timestamp: string}> = [];

      (announcements.data as Announcement[] | null)?.forEach((ann) => {
        fallbackActivity.push({
          id: ann.id,
          type: "announcement",
          summary: `Announcement: ${ann.title || "Untitled"}`,
          timestamp: ann.created_at,
        });
      });

      (highlights.data as Highlight[] | null)?.forEach((high) => {
        fallbackActivity.push({
          id: high.id,
          type: "highlight",
          summary: `Highlight: ${high.title || "Added"}`,
          timestamp: high.created_at,
        });
      });

      (matches.data as Match[] | null)?.forEach((match) => {
        fallbackActivity.push({
          id: match.id,
          type: "match",
          summary: `Match scheduled for ${new Date(match.match_date).toLocaleDateString()}`,
          timestamp: match.match_date,
        });
      });

      fallbackActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return NextResponse.json(fallbackActivity.slice(0, 10));
    }

    // Format logs into recent activity format
    const recentActivity = (logs as AdminLog[]).map((log) => {
      let summary = `${log.action} on ${log.table_name}`;
      
      // Try to provide more detail from the 'new' record in details
      if (log.details && typeof log.details === 'object') {
        const details = log.details as { new?: { title?: string; name?: string; home_team?: string; away_team?: string } };
        const newRecord = details.new;
        if (newRecord) {
          if (newRecord.title) summary = `${log.action} ${log.table_name}: ${newRecord.title}`;
          else if (newRecord.name) summary = `${log.action} ${log.table_name}: ${newRecord.name}`;
          else if (newRecord.home_team && newRecord.away_team) summary = `${log.action} match: ${newRecord.home_team} vs ${newRecord.away_team}`;
        }
      }

      return {
        id: log.id,
        type: log.table_name,
        summary: summary,
        timestamp: log.created_at,
      };
    });

    return NextResponse.json(recentActivity);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent activity" },
      { status: 500 }
    );
  }
}
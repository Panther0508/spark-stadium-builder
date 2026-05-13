import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { withRetry } from '@/lib/retry';
import type { Match } from '@/lib/queries';

// In-memory cache: { data: Match[], timestamp: number }
let cache: { data: Match[]; timestamp: number } | null = null;

const CACHE_TTL = 60 * 1000; // 60 seconds

// Helper to format match data from joined response
function formatMatch(m: { 
  home_team?: { name: string } | string; 
  away_team?: { name: string } | string; 
  [key: string]: unknown 
}): Match {
  return {
    ...m,
    home_team: (m.home_team as { name: string })?.name || (typeof m.home_team === 'string' ? m.home_team : 'Unknown'),
    away_team: (m.away_team as { name: string })?.name || (typeof m.away_team === 'string' ? m.away_team : 'Unknown'),
  } as Match;
}

export async function GET() {
  // Check cache
  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

   try {
     const supabase = getSupabaseAdminClient();
     const { data } = await withRetry(async () => {
       const result = await supabase
         .from('matches')
         .select('*, home_team:home_team_id(name), away_team:away_team_id(name)')
         .eq('is_verified', true)
         .order('match_date', { ascending: false });
       return result;
     }, { data: [] });

    const formatted = (data || []).map(formatMatch);
    cache = { data: formatted, timestamp: now };

     return NextResponse.json(formatted);
   } catch (error) {
     console.error('Error fetching matches:', error);
     return NextResponse.json(
       { error: 'Failed to fetch matches' },
       { status: 500 }
     );
   }
}

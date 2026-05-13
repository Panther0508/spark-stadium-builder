import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { withRetry } from '@/lib/retry';
import type { Match, MatchEvent } from '@/lib/queries';

// In-memory cache: Map<matchId, { data: Match, timestamp: number }>
const matchCache = new Map<string, { data: Match; timestamp: number }>();
// In-memory cache: Map<matchId, { data: MatchEvent[], timestamp: number }>
const eventsCache = new Map<string, { data: MatchEvent[]; timestamp: number }>();

const CACHE_TTL = 10 * 1000; // 10 seconds

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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const matchId = searchParams.get('matchId');
  const includeEvents = searchParams.get('includeEvents') === 'true';

  if (!matchId) {
    return NextResponse.json({ error: 'matchId is required' }, { status: 400 });
  }

  // Check match cache
  const cachedMatch = matchCache.get(matchId);
  const now = Date.now();

  let matchData: Match | null = null;
  if (cachedMatch && now - cachedMatch.timestamp < CACHE_TTL) {
    matchData = cachedMatch.data;
  }

  let eventsData: MatchEvent[] = [];
  const cachedEvents = eventsCache.get(matchId);
  const eventsRequested = includeEvents;

  if (eventsRequested && cachedEvents && now - cachedEvents.timestamp < CACHE_TTL) {
    eventsData = cachedEvents.data;
  }

  try {
    const supabase = getSupabaseAdminClient();

    // Fetch match data if not cached
    if (!matchData) {
      const { data } = await withRetry(async () => {
        const result = await supabase
          .from('matches')
          .select('*, home_team:home_team_id(name), away_team:away_team_id(name)')
          .eq('id', matchId)
          .single();
        return result;
      }, { data: null });

      if (!data) {
        return NextResponse.json({ error: 'Match not found' }, { status: 404 });
      }

      matchData = formatMatch(data);
      matchCache.set(matchId, { data: matchData, timestamp: now });
    }

    // Fetch events if requested and not cached
    if (eventsRequested && !eventsData) {
      const { data: evts } = await withRetry(async () => {
        const result = await supabase
          .from('match_events')
          .select('*')
          .eq('match_id', matchId)
          .order('minute', { ascending: true });
        return result;
      }, { data: [] });

      eventsData = evts || [];
      eventsCache.set(matchId, { data: eventsData, timestamp: now });
    }

    if (eventsRequested) {
      return NextResponse.json({ match: matchData, events: eventsData });
    }

    return NextResponse.json(matchData);
  } catch (error) {
    console.error('Error fetching live score:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live score' },
      { status: 500 }
    );
  }
}
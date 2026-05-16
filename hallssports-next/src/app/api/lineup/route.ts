import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { withRetry } from '@/lib/retry';

interface LineupPlayer {
  id: string;
  name: string;
  number: number;
  position: string;
  x: number;
  y: number;
}

interface Formation {
  name: string;
  players: LineupPlayer[];
}

interface LineupResponse {
  match: {
    id: string;
    home_team: string;
    away_team: string;
    home_score?: number;
    away_score?: number;
    status: string;
    minute?: number;
    venue?: string;
  };
  formations: {
    home: Formation;
    away: Formation;
  };
  adminPost?: string;
  aiSummary?: string;
  keyMoments: Array<{
    id: string;
    type: string;
    minute: number;
    player: string;
    team: string;
  }>;
}

interface LineupRecord {
  team_id: string;
  formation: string;
  positions: LineupPlayer[] | string;
}

interface MatchWithTeams {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_team: string | { name: string };
  away_team: string | { name: string };
  home_score?: number;
  away_score?: number;
  status: 'scheduled' | 'live' | 'finished' | 'half-time';
  minute?: number;
  venue?: string;
  admin_post?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get('match_id');

  if (!matchId) {
    return NextResponse.json({ error: 'match_id required' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();

    // Fetch match details
    const { data: match } = await withRetry(async () => {
      const result = await supabase
        .from('matches')
        .select('*, home_team:home_team_id(name), away_team:away_team_id(name)')
        .eq('id', matchId)
        .single();
      return result;
    }, { data: null } as { data: MatchWithTeams | null });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Fetch lineups for both teams
    const { data: lineupData } = await withRetry(async () => {
      const result = await supabase
        .from('lineups')
        .select('team_id, formation, positions')
        .eq('match_id', matchId);
      return result;
    }, { data: [] } as { data: LineupRecord[] | null });

    // Fetch match events for key moments
    const { data: events } = await withRetry(async () => {
      const result = await supabase
        .from('match_events')
        .select('*')
        .eq('match_id', matchId)
        .in('type', ['goal', 'yellow', 'red'])
        .order('minute', { ascending: true });
      return result;
    }, { data: [] } as { data: Array<{ id: string; type: string; minute: number; player_name: string; team: string }> | null });

    // Transform data
    const homeLineup = lineupData?.find(l => l.team_id === match.home_team_id);
    const awayLineup = lineupData?.find(l => l.team_id === match.away_team_id);

    const formatFormation = (lineup?: LineupRecord): Formation => {
      if (!lineup?.positions) {
        return {
          name: '4-4-2',
          players: []
        };
      }

      const positions = typeof lineup.positions === 'string' 
        ? JSON.parse(lineup.positions) 
        : lineup.positions;

      return {
        name: lineup.formation || '4-4-2',
        players: positions.map((p: { id: string; name: string; number: number; position: string; x: number; y: number }) => ({
          id: p.id,
          name: p.name,
          number: p.number,
          position: p.position,
          x: p.x,
          y: p.y,
        }))
      };
    };

    const response: LineupResponse = {
      match: {
        id: match.id,
        home_team: typeof match.home_team === 'string' ? match.home_team : (match.home_team as { name: string })?.name || 'Home',
        away_team: typeof match.away_team === 'string' ? match.away_team : (match.away_team as { name: string })?.name || 'Away',
        home_score: match.home_score,
        away_score: match.away_score,
        status: match.status,
        minute: match.minute,
        venue: match.venue,
      },
      formations: {
        home: formatFormation(homeLineup),
        away: formatFormation(awayLineup),
      },
      adminPost: match.admin_post,
      keyMoments: (events || []).map((e) => ({
        id: e.id,
        type: e.type,
        minute: e.minute,
        player: e.player_name,
        team: e.team || 'home',
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching lineup:', error);
    return NextResponse.json({ error: 'Failed to fetch lineup' }, { status: 500 });
  }
}
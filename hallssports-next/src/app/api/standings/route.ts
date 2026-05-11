import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { withRetry } from '@/lib/retry';
/* eslint-disable @typescript-eslint/no-explicit-any */

interface Standing {
  id: string;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  trend: 'up' | 'down' | 'same';
  logo?: string;
}

interface LeaderItem {
  id: string;
  name?: string;
  team: string;
  photoUrl?: string;
  teamLogo?: string;
  value?: number;
  yellow?: number;
  red?: number;
  total?: number;
}

interface StandingsResponse {
  standings: Standing[];
  leaders: {
    goals: LeaderItem[];
    assists: LeaderItem[];
    cleanSheets: LeaderItem[];
    corners: LeaderItem[];
    cards: LeaderItem[];
  };
}

// In-memory cache
let cache: { data: StandingsResponse; timestamp: number } | null = null;

const CACHE_TTL = 60 * 1000; // 60 seconds

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const supabase = getSupabaseAdminClient();

    // Fetch standings and leader data in parallel
    const [
      standingsResult,
      goalsResult,
      assistsResult,
      cleanSheetsResult,
      cornersResult,
      cardsResult,
    ] = await Promise.all([
      withRetry(async () => {
        const result = await supabase
          .from('standings_with_teams')
          .select('*')
          .order('points', { ascending: false });
        return result;
      }, { data: [] }),
      withRetry(async () => {
        const { data } = await (supabase as any).rpc('get_top_goals_scorers', { limit: 10 });
        return data || [];
      }, []),
      withRetry(async () => {
        const { data } = await (supabase as any).rpc('get_top_assists', { limit: 10 });
        return data || [];
      }, []),
      withRetry(async () => {
        const { data } = await (supabase as any).rpc('get_top_clean_sheets', { limit: 10 });
        return data || [];
      }, []),
      withRetry(async () => {
        const { data } = await (supabase as any).rpc('get_top_corners', { limit: 10 });
        return data || [];
      }, []),
      withRetry(async () => {
        const { data } = await (supabase as any).rpc('get_top_cards', { limit: 10 });
        return data || [];
      }, []),
    ]);

    // Transform standings
    const standingsData = standingsResult?.data || [];
    const standings = (standingsData as Record<string, unknown>[]).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      team: (row.team_name as string) || (row.team as string) || '',
      played: (row.played as number) || (row.matches_played as number) || 0,
      won: (row.won as number) || (row.wins as number) || 0,
      drawn: (row.drawn as number) || (row.draws as number) || 0,
      lost: (row.lost as number) || (row.losses as number) || 0,
      gf: (row.gf as number) || (row.goals_for as number) || 0,
      ga: (row.ga as number) || (row.goals_against as number) || 0,
      gd: (row.gd as number) || (row.goal_diff as number) || 0,
      points: (row.points as number) || 0,
      trend: (row.trend as 'up' | 'down' | 'same') || 'same',
      logo: row.logo as string | undefined,
    }));

    const transformGoal = (item: Record<string, unknown>): LeaderItem => ({
      id: item.id as string,
      name: item.player_name as string || item.name as string,
      team: item.team as string,
      photoUrl: item.photo_url as string | undefined,
      value: item.goals as number || item.value as number,
    });

    const transformAssist = (item: Record<string, unknown>): LeaderItem => ({
      id: item.id as string,
      name: item.player_name as string || item.name as string,
      team: item.team as string,
      photoUrl: item.photo_url as string | undefined,
      value: item.assists as number || item.value as number,
    });

    const transformCleanSheet = (item: Record<string, unknown>): LeaderItem => ({
      id: item.id as string,
      team: item.team as string,
      teamLogo: item.team_logo as string | undefined,
      value: item.clean_sheets as number || item.value as number,
    });

    const transformCorners = (item: Record<string, unknown>): LeaderItem => ({
      id: item.id as string,
      team: item.team as string,
      teamLogo: item.team_logo as string | undefined,
      value: item.corners as number || item.value as number,
    });

    const transformCards = (item: Record<string, unknown>): LeaderItem => ({
      id: item.id as string,
      name: item.player_name as string || item.name as string,
      team: item.team as string,
      photoUrl: item.photo_url as string | undefined,
      yellow: item.yellow_cards as number,
      red: item.red_cards as number,
      total: item.total_cards as number || (item.yellow_cards as number) + (item.red_cards as number),
    });

    const leaders = {
      goals: (goalsResult || []).map(transformGoal),
      assists: (assistsResult || []).map(transformAssist),
      cleanSheets: (cleanSheetsResult || []).map(transformCleanSheet),
      corners: (cornersResult || []).map(transformCorners),
      cards: (cardsResult || []).map(transformCards),
    };

    const result: StandingsResponse = { standings, leaders };
    cache = { data: result, timestamp: now };
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching standings/leaders:', error);
    const fallback: StandingsResponse = {
      standings: [],
      leaders: { goals: [], assists: [], cleanSheets: [], corners: [], cards: [] },
    };
    return NextResponse.json(fallback, { status: 200 });
  }
}
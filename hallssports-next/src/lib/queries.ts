// Supabase queries for HallsSports

import { supabase } from "./supabase";

// Match types
export interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_score?: number;
  away_score?: number;
  status: 'scheduled' | 'live' | 'finished' | 'half-time';
  match_date: string;
  featured: boolean;
  is_verified: boolean;
  community_visible: boolean;
  image_url?: string;
  venue?: string;
  admin_post?: string;
  duration_minutes?: number;
}

// Chat message types
export interface MatchChat {
  id: string;
  match_id: string;
  user_name: string;
  message: string;
  created_at: string;
}

// Match event types
export interface MatchEvent {
  id: string;
  match_id: string;
  minute: number;
  type: 'goal' | 'yellow' | 'red' | 'sub';
  player_name: string;
  assist?: string;
  created_at: string;
}

// Player types
export interface Player {
  id: string;
  name: string;
  team: string;
  team_id?: string;
  position: string;
  number: number;
  photo?: string;
  bio?: string;
  goals?: number;
  assists?: number;
  yellow_cards?: number;
  red_cards?: number;
  is_verified: boolean;
  updated_at?: string;
}

const getSupabaseSafe = () => supabase;

// Mock data for development
const mockMatches: Match[] = [
  {
    id: '1',
    home_team: 'Manchester City',
    away_team: 'Liverpool',
    home_score: 2,
    away_score: 1,
    status: 'finished',
    match_date: new Date().toISOString(),
    featured: true,
    is_verified: true,
    community_visible: true,
    venue: 'Etihad Stadium',
  },
  {
    id: '2',
    home_team: 'Arsenal',
    away_team: 'Chelsea',
    home_score: 1,
    away_score: 1,
    status: 'live',
    match_date: new Date().toISOString(),
    featured: false,
    is_verified: true,
    community_visible: true,
    venue: 'Emirates Stadium',
  },
  {
    id: '3',
    home_team: 'Manchester United',
    away_team: 'Tottenham',
    status: 'scheduled',
    match_date: new Date(Date.now() + 86400000).toISOString(),
    featured: false,
    is_verified: true,
    community_visible: true,
    venue: 'Old Trafford',
  },
];

// Helper to format match data from joined response
const formatMatch = (m: Record<string, unknown>): Match => ({
  ...(m as unknown as Match),
  home_team: (m.home_team as { name: string })?.name || (typeof m.home_team === 'string' ? m.home_team : 'Unknown'),
  away_team: (m.away_team as { name: string })?.name || (typeof m.away_team === 'string' ? m.away_team : 'Unknown'),
});

// Fetch a featured match with fallback logic
export async function getFeaturedMatch(): Promise<Match | null> {
  const client = getSupabaseSafe();
  if (!client) return mockMatches[0];

  try {
    const { data } = await client
      .from('matches')
      .select('*, home_team:home_team_id(name), away_team:away_team_id(name)')
      .eq('is_verified', true)
      .eq('featured', true)
      .single();

    if (data) return formatMatch(data);
  } catch {}

  // Fallback to live match
  try {
    const { data: liveData } = await client
      .from('matches')
      .select('*, home_team:home_team_id(name), away_team:away_team_id(name)')
      .eq('is_verified', true)
      .eq('status', 'live')
      .order('match_date', { ascending: false })
      .limit(1)
      .single();

    if (liveData) return formatMatch(liveData);
  } catch {}

  // Fallback to scheduled match
  try {
    const { data: scheduledData } = await client
      .from('matches')
      .select('*, home_team:home_team_id(name), away_team:away_team_id(name)')
      .eq('is_verified', true)
      .eq('status', 'scheduled')
      .order('match_date', { ascending: true })
      .limit(1)
      .single();

    if (scheduledData) return formatMatch(scheduledData);
  } catch {}

  return mockMatches[0];
}

// Get upcoming matches
export async function getUpcomingMatches(limit = 10): Promise<Match[]> {
  const client = getSupabaseSafe();
  if (!client) return mockMatches.filter(m => m.status === 'scheduled').slice(0, limit);

  const now = new Date().toISOString();
  try {
    const { data, error } = await client
      .from('matches')
      .select('*, home_team:home_team_id(name), away_team:away_team_id(name)')
      .eq('is_verified', true)
      .eq('status', 'scheduled')
      .gt('match_date', now)
      .order('match_date', { ascending: true })
      .limit(limit);

    if (!error && data) return data.map(formatMatch);
  } catch {}

  return mockMatches.filter(m => m.status === 'scheduled').slice(0, limit);
}

// Get live matches count
export async function getLiveMatchesCount(): Promise<number> {
  const client = getSupabaseSafe();
  if (!client) return mockMatches.filter(m => m.status === 'live').length;

  try {
    const { count } = await client
      .from('matches')
      .select('id', { count: 'exact' })
      .eq('is_verified', true)
      .eq('status', 'live');

    if (count !== null) return count;
  } catch {}

  return mockMatches.filter(m => m.status === 'live').length;
}

// Get community messages for a match (last 24 hours)
export async function getMatchMessages(matchId: string, limit = 3): Promise<MatchChat[]> {
  const client = getSupabaseSafe();
  if (!client) return [];

  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data } = await client
      .from('match_chats')
      .select('*')
      .eq('match_id', matchId)
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  } catch {
    return [];
  }
}

// Get all matches for MatchesPage
export async function getAllMatches(limit = 100): Promise<Match[]> {
  const client = getSupabaseSafe();
  if (!client) return mockMatches;

  try {
    const { data } = await client
      .from('matches')
      .select('*, home_team:home_team_id(name), away_team:away_team_id(name)')
      .eq('is_verified', true)
      .order('match_date', { ascending: false })
      .limit(limit);

    if (data) return data.map(formatMatch);
  } catch {}

  return mockMatches;
}

// Get live matches for LiveStatsPage
export async function getLiveMatches(): Promise<Match[]> {
  const client = getSupabaseSafe();
  if (!client) return mockMatches.filter(m => m.status === 'live');

  try {
    const { data } = await client
      .from('matches')
      .select('*, home_team:home_team_id(name), away_team:away_team_id(name)')
      .eq('is_verified', true)
      .eq('status', 'live')
      .order('match_date', { ascending: true });

    if (data) return data.map(formatMatch);
  } catch {}

  return mockMatches.filter(m => m.status === 'live');
}

// Get match details by ID
export async function getMatchById(matchId: string): Promise<Match> {
  const client = getSupabaseSafe();
  if (!client) {
    const mock = mockMatches.find(m => m.id === matchId);
    if (!mock) throw new Error('Match not found');
    return mock;
  }

  try {
    const { data } = await client
      .from('matches')
      .select('*, home_team:home_team_id(name), away_team:away_team_id(name)')
      .eq('id', matchId)
      .single();

    if (data) return formatMatch(data);
  } catch {}

  const mock = mockMatches.find(m => m.id === matchId);
  if (!mock) throw new Error('Match not found');
  return mock;
}

// Get match events by match ID
export async function getMatchEvents(matchId: string): Promise<MatchEvent[]> {
  const client = getSupabaseSafe();
  if (!client) return [];

  try {
    const { data } = await client
      .from('match_events')
      .select('*')
      .eq('match_id', matchId)
      .order('minute', { ascending: true });

    return data || [];
  } catch {
    return [];
  }
}

// Get messages for community page (last 50, 24-hour filter)
export async function getMatchMessagesHistory(matchId: string, limit = 50): Promise<MatchChat[]> {
  const client = getSupabaseSafe();
  if (!client) return [];

  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data } = await client
      .from('match_chats')
      .select('*')
      .eq('match_id', matchId)
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  } catch {
    return [];
  }
}

// Insert a chat message
export async function insertChatMessage(message: {
  match_id: string;
  user_name: string;
  message: string;
  created_at: string;
}): Promise<MatchChat> {
  const client = getSupabaseSafe();
  if (!client) {
    const mockMsg: MatchChat = { ...message, id: `local-${Date.now()}` };
    return mockMsg;
  }

  const { data, error } = await client
    .from('match_chats')
    .insert([message])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get player details by ID
export async function getPlayerById(playerId: string): Promise<Player | null> {
  const client = getSupabaseSafe();
  if (!client) return null;

  try {
    const { data } = await client
      .from('players')
      .select('*, teams:team_id(*)')
      .eq('id', playerId)
      .maybeSingle();

    if (data) {
      const d = data as { 
        id: string; 
        name: string; 
        number: number; 
        position: string; 
        photo_url?: string; 
        bio?: string;
        goals?: number;
        assists?: number;
        yellow_cards?: number;
        red_cards?: number;
        appearances?: number;
        is_verified: boolean;
        teams?: { name: string };
      };
      return { 
        ...d, 
        team: d.teams?.name || 'Unknown',
        photo: d.photo_url // Map photo_url to photo for compatibility
      };
    }
    return null;
  } catch {
    return null;
  }
}

// Get player recent match events with match details
export async function getPlayerRecentMatches(playerId: string, limit = 5) {
  const client = getSupabaseSafe();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('match_events')
      .select('*, matches(*, home_team:home_team_id(name, logo_url), away_team:away_team_id(name, logo_url))')
      .eq('player_id', playerId)
      .eq('is_verified', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching player recent matches:', err);
    return [];
  }
}

// Get all verified players
export async function getPlayers(): Promise<Player[]> {
  const client = getSupabaseSafe();
  if (!client) return [];

  try {
    const { data } = await client
      .from('players')
      .select('*, team:team_id(name)')
      .eq('is_verified', true)
      .order('name', { ascending: true });

    if (data) {
      return (data as Record<string, unknown>[]).map(p => {
        const team = (p.team as { name: string })?.name || (p.team as string) || 'Unknown';
        return { ...(p as unknown as Player), team };
      });
    }
    return [];
  } catch {
    return [];
  }
}

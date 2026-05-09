import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { withRetry } from '@/lib/retry';

// Define Player type matching frontend MOCK_PLAYERS shape
interface Player {
  id: string;
  name: string;
  team: string;
  position: string;
  number: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  photo?: string;
}

// In-memory cache
let cache: { data: Player[]; timestamp: number } | null = null;

const CACHE_TTL = 60 * 1000; // 60 seconds

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

   try {
     const supabase = getSupabaseAdminClient();
     const { data } = await withRetry(async () => {
       const result = await supabase
         .from('players')
         .select('*')
         .eq('is_verified', true)
         .order('name');
       return result;
     }, { data: [] });

    // Transform data to match frontend shape (fill defaults if missing)
    const transformed = (data || []).map((p: Record<string, unknown>) => ({
      id: p.id as string,
      name: p.name as string,
      team: p.team as string,
      position: p.position as string,
      number: p.number as number,
      goals: (p.goals as number) ?? 0,
      assists: (p.assists as number) ?? 0,
      yellow_cards: (p.yellow_cards as number) ?? 0,
      red_cards: (p.red_cards as number) ?? 0,
      photo: p.photo as string | undefined,
    }));

    cache = { data: transformed, timestamp: now };
    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

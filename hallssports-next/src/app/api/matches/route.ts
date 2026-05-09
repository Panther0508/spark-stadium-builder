import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { withRetry } from '@/lib/retry';
import type { Match } from '@/lib/queries';

// In-memory cache: { data: Match[], timestamp: number }
let cache: { data: Match[]; timestamp: number } | null = null;

const CACHE_TTL = 60 * 1000; // 60 seconds

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
         .select('*')
         .eq('is_verified', true)
         .order('match_date', { ascending: false });
       return result;
     }, { data: [] });

    cache = { data: data || [], timestamp: now };

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

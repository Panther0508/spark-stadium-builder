import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { withRetry } from '@/lib/retry';

interface Award {
  id: string;
  category: string;
  winner: string;
  value: string;
  image: string;
}

interface HistoricalWinner {
  year: string;
  awards: {
    category: string;
    winner: string;
    value: string;
  }[];
}

interface ChampionsResponse {
  awards: Award[];
  historical: HistoricalWinner[];
}

// In-memory cache
let cache: { data: ChampionsResponse; timestamp: number } | null = null;

const CACHE_TTL = 60 * 1000; // 60 seconds

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const supabase = getSupabaseAdminClient();

    // Fetch current season awards and historical in parallel
    const [currentResult, historicalResult] = await Promise.all([
      withRetry(async () => {
        const { data } = await supabase
          .from('champions')
          .select('*')
          .eq('season', '2024')
          .order('category');
        return { data };
      }, { data: [] }),
      withRetry(async () => {
        const { data } = await supabase
          .from('champions_history')
          .select('*')
          .order('year', { ascending: false })
          .limit(10);
        return { data };
      }, { data: [] }),
    ]);

    // Transform current awards
    const awards: Award[] = (currentResult?.data || []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      category: row.category as string,
      winner: row.winner as string,
      value: row.value as string,
      image: row.image as string,
    }));

    // Group historical by year
    const historicalMap = new Map<string, Record<string, unknown>[]>();
    (historicalResult?.data || []).forEach((row: Record<string, unknown>) => {
      const year = row.year as string;
      if (!historicalMap.has(year)) {
        historicalMap.set(year, []);
      }
      historicalMap.get(year)!.push({
        category: row.category as string,
        winner: row.winner as string,
        value: row.value as string,
      });
    });

    const historical: HistoricalWinner[] = Array.from(historicalMap.entries()).map(
      ([year, awardsList]) => ({
        year,
        awards: awardsList as { category: string; winner: string; value: string }[],
      })
    );

    const result: ChampionsResponse = { awards, historical };
    cache = { data: result, timestamp: now };
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching champions:', error);
    const fallback: ChampionsResponse = { awards: [], historical: [] };
    return NextResponse.json(fallback, { status: 200 });
  }
}

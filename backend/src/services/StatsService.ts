// Stats Service - Business logic for platform statistics
import { supabaseAdmin } from '../config/supabase';
import redis from '../config/redis';

export interface LiveStats {
  playersOnline: number;
  gamesActive: number;
  tournamentsLive: number;
  totalPrizePool: number;
  arenasActive: number;
}

export class StatsService {
  /**
   * Get live platform statistics
   * Cached for 30 seconds for performance
   */
  async getLiveStats(): Promise<LiveStats> {
    const cacheKey = 'stats:live';
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Get stats in parallel for better performance
    const [
      playersOnlineResult,
      gamesActiveResult,
      tournamentsLiveResult,
      prizepoolResult,
      arenasActiveResult,
    ] = await Promise.all([
      // Count unique players in active or waiting sessions
      supabaseAdmin
        .from('game_sessions')
        .select('player_id', { count: 'exact', head: false })
        .in('status', ['active', 'waiting']),

      // Count active game sessions
      supabaseAdmin
        .from('game_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),

      // Count active tournaments
      supabaseAdmin
        .from('tournaments')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),

      // Sum all tournament prize pools
      supabaseAdmin
        .from('tournaments')
        .select('prize_pool')
        .in('status', ['upcoming', 'active']),

      // Count active arenas
      supabaseAdmin
        .from('arenas')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
    ]);

    // Count unique players (remove duplicates)
    const uniquePlayers = new Set(
      playersOnlineResult.data?.map((session) => session.player_id) || []
    );

    // Calculate total prize pool
    const totalPrizePool = prizepoolResult.data?.reduce(
      (sum, tournament) => sum + parseFloat(tournament.prize_pool || '0'),
      0
    ) || 0;

    const stats: LiveStats = {
      playersOnline: uniquePlayers.size,
      gamesActive: gamesActiveResult.count || 0,
      tournamentsLive: tournamentsLiveResult.count || 0,
      totalPrizePool: Math.round(totalPrizePool),
      arenasActive: arenasActiveResult.count || 0,
    };

    // Cache for 30 seconds
    await redis.setex(cacheKey, 30, JSON.stringify(stats));

    return stats;
  }

  /**
   * Get platform statistics for a specific time period
   */
  async getPlatformStats(period: 'today' | 'week' | 'month' | 'all_time') {
    let startDate: string | null = null;

    switch (period) {
      case 'today':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'all_time':
        startDate = null;
        break;
    }

    let sessionsQuery = supabaseAdmin
      .from('game_sessions')
      .select('id, player_id, score, duration_seconds', { count: 'exact', head: false })
      .eq('status', 'completed');

    if (startDate) {
      sessionsQuery = sessionsQuery.gte('created_at', startDate);
    }

    const { data: sessions, count: totalGames } = await sessionsQuery;

    // Count unique players
    const uniquePlayers = new Set(sessions?.map((s) => s.player_id) || []);

    // Calculate average score
    const avgScore = sessions?.length
      ? sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length
      : 0;

    // Calculate average duration
    const avgDuration = sessions?.length
      ? sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessions.length
      : 0;

    return {
      totalGames: totalGames || 0,
      uniquePlayers: uniquePlayers.size,
      averageScore: Math.round(avgScore),
      averageDuration: Math.round(avgDuration),
      period,
    };
  }
}

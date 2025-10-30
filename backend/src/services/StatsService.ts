// Stats Service - Business logic for platform statistics
import { pool } from '../config/database';
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

    // Get all stats in a single optimized query
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(DISTINCT player_id)
         FROM giperarena.game_sessions
         WHERE status IN ('active', 'waiting')) as players_online,

        (SELECT COUNT(*)
         FROM giperarena.game_sessions
         WHERE status = 'active') as games_active,

        (SELECT COUNT(*)
         FROM giperarena.tournaments
         WHERE status = 'active') as tournaments_live,

        (SELECT COALESCE(SUM(prize_pool), 0)
         FROM giperarena.tournaments
         WHERE status IN ('upcoming', 'active')) as total_prize_pool,

        (SELECT COUNT(*)
         FROM giperarena.arenas
         WHERE status = 'active') as arenas_active
    `);

    const row = result.rows[0];

    const stats: LiveStats = {
      playersOnline: parseInt(row.players_online) || 0,
      gamesActive: parseInt(row.games_active) || 0,
      tournamentsLive: parseInt(row.tournaments_live) || 0,
      totalPrizePool: Math.round(parseFloat(row.total_prize_pool) || 0),
      arenasActive: parseInt(row.arenas_active) || 0,
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

    let sql = `
      SELECT
        COUNT(*) as total_games,
        COUNT(DISTINCT player_id) as unique_players,
        COALESCE(AVG(score), 0) as avg_score,
        COALESCE(AVG(duration_seconds), 0) as avg_duration
      FROM giperarena.game_sessions
      WHERE status = 'completed'
    `;

    const params: any[] = [];
    if (startDate) {
      sql += ` AND created_at >= $1`;
      params.push(startDate);
    }

    const result = await pool.query(sql, params);
    const row = result.rows[0];

    return {
      totalGames: parseInt(row.total_games) || 0,
      uniquePlayers: parseInt(row.unique_players) || 0,
      averageScore: Math.round(parseFloat(row.avg_score) || 0),
      averageDuration: Math.round(parseFloat(row.avg_duration) || 0),
      period,
    };
  }
}

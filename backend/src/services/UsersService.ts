// Users Service - Business logic for user operations
import { pool } from '../config/database';
import { supabaseAdmin } from '../config/supabase';
import redis from '../config/redis';

export class UsersService {
  // Get user by ID
  async getUserById(userId: string) {
    // Try cache first
    const cacheKey = `user:${userId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, username, email, wallet_address, avatar_url, reputation_score, created_at')
      .eq('id', userId)
      .eq('is_active', true)
      .single();

    if (error) throw error;

    // Cache for 5 minutes
    if (data) {
      await redis.setex(cacheKey, 300, JSON.stringify(data));
    }

    return data;
  }

  // Update user
  async updateUser(userId: string, updates: any) {
    // Remove fields that shouldn't be updated
    const allowedFields = [
      'username',
      'avatar_url',
      'bio',
      'country',
      'preferred_language',
      'notification_preferences',
    ];

    const filteredUpdates: any = {};
    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(filteredUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    await redis.del(`user:${userId}`);

    return data;
  }

  // Get user statistics
  async getUserStats(userId: string) {
    const cacheKey = `user:stats:${userId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const client = await pool.connect();

    try {
      const result = await client.query(
        `
        SELECT
          COUNT(DISTINCT gs.id) FILTER (WHERE gs.status = 'completed') as total_games,
          COUNT(DISTINCT t.id) as tournaments_participated,
          COALESCE(SUM(gs.score), 0) as total_score,
          COALESCE(AVG(gs.score), 0) as average_score,
          COUNT(DISTINCT a.id) as achievements_earned,
          w.gac_balance,
          w.pac_balance,
          w.staked_amount,
          w.staking_tier
        FROM giperarena.users u
        LEFT JOIN giperarena.game_sessions gs ON gs.player_id = u.id
        LEFT JOIN giperarena.tournament_participants tp ON tp.user_id = u.id
        LEFT JOIN giperarena.tournaments t ON t.id = tp.tournament_id
        LEFT JOIN giperarena.user_achievements ua ON ua.user_id = u.id
        LEFT JOIN giperarena.achievements a ON a.id = ua.achievement_id
        LEFT JOIN giperarena.wallets w ON w.user_id = u.id
        WHERE u.id = $1
        GROUP BY u.id, w.gac_balance, w.pac_balance, w.staked_amount, w.staking_tier
      `,
        [userId]
      );

      const stats = result.rows[0] || {
        total_games: 0,
        tournaments_participated: 0,
        total_score: 0,
        average_score: 0,
        achievements_earned: 0,
        gac_balance: 0,
        pac_balance: 0,
        staked_amount: 0,
        staking_tier: null,
      };

      // Cache for 2 minutes
      await redis.setex(cacheKey, 120, JSON.stringify(stats));

      return stats;
    } finally {
      client.release();
    }
  }

  // Search users by username or email
  async searchUsers(query: string, limit: number, offset: number) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, username, email, avatar_url, reputation_score')
      .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
      .eq('is_active', true)
      .order('reputation_score', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return data;
  }

  // Deactivate user
  async deactivateUser(userId: string) {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ is_active: false })
      .eq('id', userId);

    if (error) throw error;

    // Invalidate cache
    await redis.del(`user:${userId}`);
  }
}

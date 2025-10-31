// Game Sessions Service - Business logic for game session operations
import { supabaseAdmin } from '../config/supabase';
import { pool } from '../config/database';
import redis from '../config/redis';

export class GameSessionsService {
  // Get game sessions with filters
  async getGameSessions(filters: any, limit: number, offset: number) {
    let sql = `
      SELECT
        gs.id,
        gs.arena_id,
        gs.player_id,
        gs.status,
        gs.score,
        gs.duration_seconds,
        gs.replay_url,
        gs.started_at,
        gs.ended_at,
        gs.created_at,
        jsonb_build_object(
          'id', a.id,
          'name', a.name,
          'game_type', a.game_type,
          'location_address', a.location_address
        ) as arenas
      FROM giperarena.game_sessions gs
      LEFT JOIN giperarena.arenas a ON gs.arena_id = a.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (filters.arena_id) {
      sql += ` AND gs.arena_id = $${paramIndex}`;
      params.push(filters.arena_id);
      paramIndex++;
    }
    if (filters.player_id) {
      sql += ` AND gs.player_id = $${paramIndex}`;
      params.push(filters.player_id);
      paramIndex++;
    }
    if (filters.status) {
      sql += ` AND gs.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    sql += ` ORDER BY gs.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(sql, params);
    return result.rows;
  }

  // Get game session by ID
  async getGameSessionById(sessionId: string) {
    const cacheKey = `session:${sessionId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const { data, error } = await supabaseAdmin
      .from('game_sessions')
      .select(
        `
        *,
        arenas(id, name, game_type, operator_id),
        users(id, username, avatar_url)
      `
      )
      .eq('id', sessionId)
      .single();

    if (error) throw error;

    // Cache for 1 minute
    if (data) {
      await redis.setex(cacheKey, 60, JSON.stringify(data));
    }

    return data;
  }

  // Create game session
  async createGameSession(sessionData: any) {
    const { data, error } = await supabaseAdmin
      .from('game_sessions')
      .insert({
        arena_id: sessionData.arena_id,
        player_id: sessionData.player_id,
        status: 'waiting',
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  // Start game session
  async startGameSession(sessionId: string) {
    const { data, error } = await supabaseAdmin
      .from('game_sessions')
      .update({
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    await redis.del(`session:${sessionId}`);

    return data;
  }

  // End game session
  async endGameSession(sessionId: string, score?: number, replayUrl?: string) {
    const session = await this.getGameSessionById(sessionId);
    const startedAt = new Date(session.started_at);
    const endedAt = new Date();
    const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);

    const updateData: any = {
      status: 'completed',
      ended_at: endedAt.toISOString(),
      duration_seconds: durationSeconds,
    };

    if (score !== undefined) {
      updateData.score = score;
    }

    if (replayUrl) {
      updateData.replay_url = replayUrl;
    }

    const { data, error } = await supabaseAdmin
      .from('game_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;

    // Update arena total_sessions count
    await supabaseAdmin.rpc('increment_arena_sessions', {
      arena_id: session.arena_id,
    });

    // Invalidate cache
    await redis.del(`session:${sessionId}`);

    return data;
  }

  // Cancel game session
  async cancelGameSession(sessionId: string) {
    const { data, error } = await supabaseAdmin
      .from('game_sessions')
      .update({
        status: 'cancelled',
        ended_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    await redis.del(`session:${sessionId}`);

    return data;
  }

  // Get user's game history
  async getUserGameHistory(userId: string, limit: number, offset: number) {
    const cacheKey = `user:history:${userId}:${limit}:${offset}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const { data, error } = await supabaseAdmin
      .from('game_sessions')
      .select(
        `
        id,
        arena_id,
        status,
        score,
        duration_seconds,
        started_at,
        ended_at,
        created_at,
        arenas(id, name, game_type, location_address)
      `
      )
      .eq('player_id', userId)
      .in('status', ['completed', 'cancelled'])
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Cache for 2 minutes
    await redis.setex(cacheKey, 120, JSON.stringify(data));

    return data;
  }
}

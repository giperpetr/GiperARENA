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

    const sql = `
      SELECT
        gs.*,
        jsonb_build_object(
          'id', a.id,
          'name', a.name,
          'game_type', a.game_type,
          'operator_id', a.operator_id
        ) as arenas
      FROM giperarena.game_sessions gs
      LEFT JOIN giperarena.arenas a ON gs.arena_id = a.id
      WHERE gs.id = $1
    `;

    const result = await pool.query(sql, [sessionId]);

    if (result.rows.length === 0) {
      return null;
    }

    const data = result.rows[0];

    // Cache for 1 minute
    await redis.setex(cacheKey, 60, JSON.stringify(data));

    return data;
  }

  // Create game session
  async createGameSession(sessionData: any) {
    const sql = `
      INSERT INTO giperarena.game_sessions (arena_id, player_id, status)
      VALUES ($1, $2, 'waiting')
      RETURNING *
    `;

    const result = await pool.query(sql, [sessionData.arena_id, sessionData.player_id]);
    return result.rows[0];
  }

  // Start game session
  async startGameSession(sessionId: string) {
    const sql = `
      UPDATE giperarena.game_sessions
      SET status = 'active', started_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(sql, [sessionId]);

    // Invalidate cache
    await redis.del(`session:${sessionId}`);

    return result.rows[0];
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

    const sql = `
      UPDATE giperarena.game_sessions
      SET status = $1, ended_at = $2, duration_seconds = $3, score = $4, replay_url = $5
      WHERE id = $6
      RETURNING *
    `;

    const result = await pool.query(sql, [
      updateData.status,
      updateData.ended_at,
      updateData.duration_seconds,
      updateData.score || null,
      updateData.replay_url || null,
      sessionId,
    ]);

    // Update arena total_sessions count
    await pool.query(
      `UPDATE giperarena.arenas SET total_sessions = total_sessions + 1 WHERE id = $1`,
      [session.arena_id]
    );

    const data = result.rows[0];

    // Invalidate cache
    await redis.del(`session:${sessionId}`);

    return data;
  }

  // Cancel game session
  async cancelGameSession(sessionId: string) {
    const sql = `
      UPDATE giperarena.game_sessions
      SET status = 'cancelled', ended_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(sql, [sessionId]);

    // Invalidate cache
    await redis.del(`session:${sessionId}`);

    return result.rows[0];
  }

  // Get user's game history
  async getUserGameHistory(userId: string, limit: number, offset: number) {
    const cacheKey = `user:history:${userId}:${limit}:${offset}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const sql = `
      SELECT
        gs.id,
        gs.arena_id,
        gs.status,
        gs.score,
        gs.duration_seconds,
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
      WHERE gs.player_id = $1
        AND gs.status IN ('completed', 'cancelled')
      ORDER BY gs.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(sql, [userId, limit, offset]);
    const data = result.rows;

    // Cache for 2 minutes
    await redis.setex(cacheKey, 120, JSON.stringify(data));

    return data;
  }
}

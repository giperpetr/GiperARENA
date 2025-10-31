// Game Sessions Service - Business logic for game session operations
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
        gs.start_time as started_at,
        gs.end_time as ended_at,
        gs.created_at,
        jsonb_build_object(
          'id', a.id,
          'name', a.name,
          'arena_type', a.arena_type,
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
        gs.id,
        gs.arena_id,
        gs.player_id,
        gs.status,
        gs.score,
        gs.duration_seconds,
        gs.replay_url,
        gs.start_time as started_at,
        gs.end_time as ended_at,
        gs.created_at,
        gs.updated_at,
        jsonb_build_object(
          'id', a.id,
          'name', a.name,
          'arena_type', a.arena_type,
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
      SET status = 'in_progress', start_time = NOW()
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
    const startTime = session.started_at ? new Date(session.started_at) : new Date();
    const endTime = new Date();
    const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    const sql = `
      UPDATE giperarena.game_sessions
      SET status = 'completed', end_time = $1, duration_seconds = $2, score = $3, replay_url = $4
      WHERE id = $5
      RETURNING *
    `;

    const result = await pool.query(sql, [
      endTime.toISOString(),
      durationSeconds,
      score || null,
      replayUrl || null,
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
      SET status = 'cancelled', end_time = NOW()
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
        gs.start_time as started_at,
        gs.end_time as ended_at,
        gs.created_at,
        jsonb_build_object(
          'id', a.id,
          'name', a.name,
          'arena_type', a.arena_type,
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

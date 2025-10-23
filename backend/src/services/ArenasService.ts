// Arenas Service - Business logic for arena operations
import { pool } from '../config/database';
import { supabaseAdmin } from '../config/supabase';
import redis from '../config/redis';

export class ArenasService {
  // Get arenas with filters
  async getArenas(filters: any, limit: number, offset: number) {
    const cacheKey = `arenas:${JSON.stringify(filters)}:${limit}:${offset}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    let query = supabaseAdmin
      .from('arenas')
      .select(
        `
        id,
        name,
        description,
        game_type,
        location_address,
        location_coordinates,
        country,
        city,
        status,
        pricing_model,
        hourly_rate,
        total_sessions,
        rating,
        operator_id,
        created_at
      `
      );

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.game_type) {
      query = query.eq('game_type', filters.game_type);
    }
    if (filters.country) {
      query = query.eq('country', filters.country);
    }
    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    // Location-based filtering (PostGIS)
    if (filters.location) {
      const { lat, lng, radius } = filters.location;
      const client = await pool.connect();
      try {
        const result = await client.query(
          `
          SELECT
            id, name, description, game_type, location_address,
            ST_AsGeoJSON(location_coordinates)::json as location_coordinates,
            country, city, status, pricing_model, hourly_rate,
            total_sessions, rating, operator_id, created_at,
            ST_Distance(
              location_coordinates::geography,
              ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
            ) as distance
          FROM giperarena.arenas
          WHERE ST_DWithin(
            location_coordinates::geography,
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
            $3
          )
          ORDER BY distance
          LIMIT $4 OFFSET $5
        `,
          [lng, lat, radius * 1000, limit, offset]
        );

        const arenas = result.rows;
        await redis.setex(cacheKey, 300, JSON.stringify(arenas));
        return arenas;
      } finally {
        client.release();
      }
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(data));

    return data;
  }

  // Get arena by ID
  async getArenaById(arenaId: string) {
    const cacheKey = `arena:${arenaId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const { data, error } = await supabaseAdmin
      .from('arenas')
      .select('*')
      .eq('id', arenaId)
      .single();

    if (error) throw error;

    // Cache for 5 minutes
    if (data) {
      await redis.setex(cacheKey, 300, JSON.stringify(data));
    }

    return data;
  }

  // Create arena
  async createArena(arenaData: any) {
    // Convert location to PostGIS point if lat/lng provided
    if (arenaData.latitude && arenaData.longitude) {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `
          INSERT INTO giperarena.arenas (
            name, description, game_type, location_address, location_coordinates,
            country, city, operator_id, status, pricing_model, hourly_rate
          )
          VALUES (
            $1, $2, $3, $4,
            ST_SetSRID(ST_MakePoint($5, $6), 4326),
            $7, $8, $9, $10, $11, $12
          )
          RETURNING *
        `,
          [
            arenaData.name,
            arenaData.description,
            arenaData.game_type,
            arenaData.location_address,
            arenaData.longitude,
            arenaData.latitude,
            arenaData.country,
            arenaData.city,
            arenaData.operator_id,
            arenaData.status || 'pending',
            arenaData.pricing_model || 'hourly',
            arenaData.hourly_rate || 0,
          ]
        );

        return result.rows[0];
      } finally {
        client.release();
      }
    }

    const { data, error } = await supabaseAdmin
      .from('arenas')
      .insert({
        name: arenaData.name,
        description: arenaData.description,
        game_type: arenaData.game_type,
        location_address: arenaData.location_address,
        country: arenaData.country,
        city: arenaData.city,
        operator_id: arenaData.operator_id,
        status: arenaData.status || 'pending',
        pricing_model: arenaData.pricing_model || 'hourly',
        hourly_rate: arenaData.hourly_rate || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  // Update arena
  async updateArena(arenaId: string, updates: any) {
    const { data, error } = await supabaseAdmin
      .from('arenas')
      .update(updates)
      .eq('id', arenaId)
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    await redis.del(`arena:${arenaId}`);

    return data;
  }

  // Delete arena
  async deleteArena(arenaId: string) {
    const { error } = await supabaseAdmin.from('arenas').delete().eq('id', arenaId);

    if (error) throw error;

    // Invalidate cache
    await redis.del(`arena:${arenaId}`);
  }

  // Search arenas by name (full-text search)
  async searchArenas(query: string, limit: number, offset: number) {
    const client = await pool.connect();

    try {
      const result = await client.query(
        `
        SELECT
          id, name, description, game_type, location_address,
          country, city, status, pricing_model, hourly_rate,
          total_sessions, rating, operator_id, created_at,
          ts_rank(
            to_tsvector('english', name || ' ' || COALESCE(description, '')),
            plainto_tsquery('english', $1)
          ) as rank
        FROM giperarena.arenas
        WHERE to_tsvector('english', name || ' ' || COALESCE(description, ''))
          @@ plainto_tsquery('english', $1)
        ORDER BY rank DESC, rating DESC
        LIMIT $2 OFFSET $3
      `,
        [query, limit, offset]
      );

      return result.rows;
    } finally {
      client.release();
    }
  }

  // Get arena statistics
  async getArenaStats(arenaId: string) {
    const cacheKey = `arena:stats:${arenaId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const client = await pool.connect();

    try {
      const result = await client.query(
        `
        SELECT
          a.total_sessions,
          a.rating,
          COUNT(DISTINCT gs.id) FILTER (WHERE gs.status = 'completed') as completed_sessions,
          COUNT(DISTINCT gs.id) FILTER (WHERE gs.status = 'active') as active_sessions,
          COALESCE(AVG(gs.score), 0) as average_score,
          COUNT(DISTINCT t.id) as tournaments_hosted
        FROM giperarena.arenas a
        LEFT JOIN giperarena.game_sessions gs ON gs.arena_id = a.id
        LEFT JOIN giperarena.tournaments t ON t.arena_id = a.id
        WHERE a.id = $1
        GROUP BY a.id, a.total_sessions, a.rating
      `,
        [arenaId]
      );

      const stats = result.rows[0] || {
        total_sessions: 0,
        rating: 0,
        completed_sessions: 0,
        active_sessions: 0,
        average_score: 0,
        tournaments_hosted: 0,
      };

      // Cache for 2 minutes
      await redis.setex(cacheKey, 120, JSON.stringify(stats));

      return stats;
    } finally {
      client.release();
    }
  }
}

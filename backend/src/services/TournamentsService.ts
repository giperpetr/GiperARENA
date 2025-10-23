// Tournaments Service - Business logic for tournament operations
import { pool } from '../config/database';
import { supabaseAdmin } from '../config/supabase';
import redis from '../config/redis';

export class TournamentsService {
  // Get tournaments with filters
  async getTournaments(filters: any, limit: number, offset: number) {
    let query = supabaseAdmin
      .from('tournaments')
      .select(
        `
        id,
        name,
        description,
        arena_id,
        organizer_id,
        tournament_type,
        status,
        start_date,
        end_date,
        max_participants,
        current_participants,
        prize_pool,
        entry_fee,
        created_at,
        arenas(id, name, location_address)
      `
      );

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.arena_id) {
      query = query.eq('arena_id', filters.arena_id);
    }
    if (filters.tournament_type) {
      query = query.eq('tournament_type', filters.tournament_type);
    }

    const { data, error } = await query
      .order('start_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return data;
  }

  // Get tournament by ID
  async getTournamentById(tournamentId: string) {
    const cacheKey = `tournament:${tournamentId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const { data, error } = await supabaseAdmin
      .from('tournaments')
      .select(
        `
        *,
        arenas(id, name, game_type, location_address),
        users(id, username, avatar_url)
      `
      )
      .eq('id', tournamentId)
      .single();

    if (error) throw error;

    // Cache for 2 minutes
    if (data) {
      await redis.setex(cacheKey, 120, JSON.stringify(data));
    }

    return data;
  }

  // Create tournament
  async createTournament(tournamentData: any) {
    const { data, error } = await supabaseAdmin
      .from('tournaments')
      .insert({
        name: tournamentData.name,
        description: tournamentData.description,
        arena_id: tournamentData.arena_id,
        organizer_id: tournamentData.organizer_id,
        tournament_type: tournamentData.tournament_type,
        status: 'upcoming',
        start_date: tournamentData.start_date,
        end_date: tournamentData.end_date,
        max_participants: tournamentData.max_participants || 16,
        current_participants: 0,
        prize_pool: tournamentData.prize_pool || 0,
        entry_fee: tournamentData.entry_fee || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  // Register participant
  async registerParticipant(tournamentId: string, userId: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get tournament
      const tournamentResult = await client.query(
        'SELECT * FROM giperarena.tournaments WHERE id = $1',
        [tournamentId]
      );

      const tournament = tournamentResult.rows[0];

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Check if tournament is full
      if (tournament.current_participants >= tournament.max_participants) {
        throw new Error('Tournament is full');
      }

      // Check if user is already registered
      const existingResult = await client.query(
        'SELECT * FROM giperarena.tournament_participants WHERE tournament_id = $1 AND user_id = $2',
        [tournamentId, userId]
      );

      if (existingResult.rows.length > 0) {
        throw new Error('Already registered');
      }

      // Register participant
      const registrationResult = await client.query(
        `
        INSERT INTO giperarena.tournament_participants (tournament_id, user_id, registration_date)
        VALUES ($1, $2, NOW())
        RETURNING *
      `,
        [tournamentId, userId]
      );

      // Update current_participants count
      await client.query(
        'UPDATE giperarena.tournaments SET current_participants = current_participants + 1 WHERE id = $1',
        [tournamentId]
      );

      await client.query('COMMIT');

      // Invalidate cache
      await redis.del(`tournament:${tournamentId}`);

      return registrationResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Unregister participant
  async unregisterParticipant(tournamentId: string, userId: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get tournament
      const tournamentResult = await client.query(
        'SELECT * FROM giperarena.tournaments WHERE id = $1',
        [tournamentId]
      );

      const tournament = tournamentResult.rows[0];

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Check if tournament has started
      if (tournament.status !== 'upcoming') {
        throw new Error('Tournament has already started');
      }

      // Delete registration
      await client.query(
        'DELETE FROM giperarena.tournament_participants WHERE tournament_id = $1 AND user_id = $2',
        [tournamentId, userId]
      );

      // Update current_participants count
      await client.query(
        'UPDATE giperarena.tournaments SET current_participants = current_participants - 1 WHERE id = $1',
        [tournamentId]
      );

      await client.query('COMMIT');

      // Invalidate cache
      await redis.del(`tournament:${tournamentId}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get tournament participants
  async getTournamentParticipants(tournamentId: string) {
    const { data, error } = await supabaseAdmin
      .from('tournament_participants')
      .select(
        `
        id,
        user_id,
        registration_date,
        seed,
        current_round,
        users(id, username, avatar_url, reputation_score)
      `
      )
      .eq('tournament_id', tournamentId)
      .order('seed', { ascending: true });

    if (error) throw error;

    return data;
  }

  // Get tournament bracket
  async getTournamentBracket(tournamentId: string) {
    const cacheKey = `tournament:bracket:${tournamentId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const { data, error } = await supabaseAdmin
      .from('tournaments')
      .select('bracket_data')
      .eq('id', tournamentId)
      .single();

    if (error) throw error;

    const bracket = data?.bracket_data || null;

    // Cache for 1 minute
    if (bracket) {
      await redis.setex(cacheKey, 60, JSON.stringify(bracket));
    }

    return bracket;
  }

  // Start tournament
  async startTournament(tournamentId: string) {
    const { data, error } = await supabaseAdmin
      .from('tournaments')
      .update({
        status: 'active',
        actual_start_date: new Date().toISOString(),
      })
      .eq('id', tournamentId)
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    await redis.del(`tournament:${tournamentId}`);

    // TODO: Generate bracket based on tournament_type

    return data;
  }

  // Complete tournament
  async completeTournament(tournamentId: string, winnerId?: string) {
    const updateData: any = {
      status: 'completed',
      actual_end_date: new Date().toISOString(),
    };

    if (winnerId) {
      updateData.winner_id = winnerId;
    }

    const { data, error } = await supabaseAdmin
      .from('tournaments')
      .update(updateData)
      .eq('id', tournamentId)
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    await redis.del(`tournament:${tournamentId}`);

    // TODO: Distribute prize pool to winner

    return data;
  }
}

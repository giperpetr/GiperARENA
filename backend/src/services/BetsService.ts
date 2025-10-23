// Bets Service - Business logic for betting operations
import { pool } from '../config/database';
import { supabaseAdmin } from '../config/supabase';
import redis from '../config/redis';

export class BetsService {
  // Get betting markets
  async getBettingMarkets(filters: any, limit: number, offset: number) {
    let query = supabaseAdmin
      .from('betting_markets')
      .select(
        `
        id,
        event_type,
        event_id,
        market_type,
        description,
        status,
        closing_date,
        outcome_a,
        outcome_b,
        outcome_c,
        odds_a,
        odds_b,
        odds_c,
        total_volume,
        created_at
      `
      );

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.event_type) {
      query = query.eq('event_type', filters.event_type);
    }
    if (filters.event_id) {
      query = query.eq('event_id', filters.event_id);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return data;
  }

  // Get betting market by ID
  async getBettingMarketById(marketId: string) {
    const cacheKey = `market:${marketId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const { data, error } = await supabaseAdmin
      .from('betting_markets')
      .select('*')
      .eq('id', marketId)
      .single();

    if (error) throw error;

    // Cache for 1 minute
    if (data) {
      await redis.setex(cacheKey, 60, JSON.stringify(data));
    }

    return data;
  }

  // Place bet
  async placeBet(userId: string, marketId: string, outcome: string, amount: number) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get market
      const marketResult = await client.query(
        'SELECT * FROM giperarena.betting_markets WHERE id = $1',
        [marketId]
      );

      const market = marketResult.rows[0];

      if (!market) {
        throw new Error('Market not found');
      }

      // Check if market is open
      if (market.status !== 'open') {
        throw new Error('Market is closed');
      }

      // Check if closing date has passed
      if (new Date(market.closing_date) < new Date()) {
        throw new Error('Market is closed');
      }

      // Get user wallet
      const walletResult = await client.query(
        'SELECT * FROM giperarena.wallets WHERE user_id = $1',
        [userId]
      );

      const wallet = walletResult.rows[0];

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Check balance
      if (parseFloat(wallet.pac_balance) < amount) {
        throw new Error('Insufficient balance');
      }

      // Get odds for the chosen outcome
      let odds = 0;
      if (outcome === 'A') odds = parseFloat(market.odds_a);
      else if (outcome === 'B') odds = parseFloat(market.odds_b);
      else if (outcome === 'C') odds = parseFloat(market.odds_c);
      else throw new Error('Invalid outcome');

      const potentialPayout = amount * odds;

      // Deduct amount from wallet
      await client.query(
        'UPDATE giperarena.wallets SET pac_balance = pac_balance - $1 WHERE user_id = $2',
        [amount, userId]
      );

      // Create bet
      const betResult = await client.query(
        `
        INSERT INTO giperarena.bets (
          user_id, market_id, outcome, amount, odds, potential_payout, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `,
        [userId, marketId, outcome, amount, odds, potentialPayout, 'pending']
      );

      // Update market total volume
      await client.query(
        'UPDATE giperarena.betting_markets SET total_volume = total_volume + $1 WHERE id = $2',
        [amount, marketId]
      );

      // Create transaction record
      await client.query(
        `
        INSERT INTO giperarena.transactions (
          user_id, type, amount, token_type, status, reference_id
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
        [userId, 'bet', amount, 'PAC', 'completed', betResult.rows[0].id]
      );

      await client.query('COMMIT');

      // Invalidate caches
      await redis.del(`wallet:${userId}`);
      await redis.del(`market:${marketId}`);

      return betResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get user bets
  async getUserBets(userId: string, status?: string, limit?: number, offset?: number) {
    let query = supabaseAdmin
      .from('bets')
      .select(
        `
        id,
        market_id,
        outcome,
        amount,
        odds,
        potential_payout,
        status,
        payout,
        created_at,
        betting_markets(id, event_type, event_id, description, status)
      `
      )
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset || 0, (offset || 0) + (limit || 20) - 1);

    if (error) throw error;

    return data;
  }

  // Get bet by ID
  async getBetById(betId: string) {
    const { data, error } = await supabaseAdmin
      .from('bets')
      .select(
        `
        *,
        betting_markets(id, event_type, event_id, description, status)
      `
      )
      .eq('id', betId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data;
  }

  // Cancel bet
  async cancelBet(betId: string, userId: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get bet
      const betResult = await client.query(
        'SELECT * FROM giperarena.bets WHERE id = $1',
        [betId]
      );

      const bet = betResult.rows[0];

      if (!bet) {
        throw new Error('Bet not found');
      }

      // Get market
      const marketResult = await client.query(
        'SELECT * FROM giperarena.betting_markets WHERE id = $1',
        [bet.market_id]
      );

      const market = marketResult.rows[0];

      // Check if event has started
      if (new Date(market.closing_date) < new Date()) {
        throw new Error('Event has started');
      }

      // Refund amount to wallet
      await client.query(
        'UPDATE giperarena.wallets SET pac_balance = pac_balance + $1 WHERE user_id = $2',
        [bet.amount, userId]
      );

      // Update bet status
      await client.query(
        'UPDATE giperarena.bets SET status = $1 WHERE id = $2',
        ['cancelled', betId]
      );

      // Update market total volume
      await client.query(
        'UPDATE giperarena.betting_markets SET total_volume = total_volume - $1 WHERE id = $2',
        [bet.amount, bet.market_id]
      );

      // Create refund transaction
      await client.query(
        `
        INSERT INTO giperarena.transactions (
          user_id, type, amount, token_type, status, reference_id
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
        [userId, 'refund', bet.amount, 'PAC', 'completed', betId]
      );

      await client.query('COMMIT');

      // Invalidate caches
      await redis.del(`wallet:${userId}`);
      await redis.del(`market:${bet.market_id}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get user betting statistics
  async getUserBettingStats(userId: string) {
    const cacheKey = `user:betting:stats:${userId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const client = await pool.connect();

    try {
      const result = await client.query(
        `
        SELECT
          COUNT(*) FILTER (WHERE status = 'won') as total_wins,
          COUNT(*) FILTER (WHERE status = 'lost') as total_losses,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_bets,
          COALESCE(SUM(amount), 0) as total_wagered,
          COALESCE(SUM(payout), 0) as total_winnings,
          COALESCE(SUM(payout) - SUM(amount), 0) as net_profit
        FROM giperarena.bets
        WHERE user_id = $1
      `,
        [userId]
      );

      const stats = result.rows[0] || {
        total_wins: 0,
        total_losses: 0,
        pending_bets: 0,
        total_wagered: 0,
        total_winnings: 0,
        net_profit: 0,
      };

      // Calculate win rate
      const totalSettled = parseInt(stats.total_wins) + parseInt(stats.total_losses);
      stats.win_rate = totalSettled > 0 ? (parseInt(stats.total_wins) / totalSettled) * 100 : 0;

      // Cache for 2 minutes
      await redis.setex(cacheKey, 120, JSON.stringify(stats));

      return stats;
    } finally {
      client.release();
    }
  }
}

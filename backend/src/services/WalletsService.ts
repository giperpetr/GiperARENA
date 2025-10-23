// Wallets Service - Business logic for wallet and transaction operations
import { pool } from '../config/database';
import { supabaseAdmin } from '../config/supabase';
import redis from '../config/redis';

export class WalletsService {
  // Get wallet by user ID
  async getWalletByUserId(userId: string) {
    const cacheKey = `wallet:${userId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const { data, error } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // Cache for 1 minute
    if (data) {
      await redis.setex(cacheKey, 60, JSON.stringify(data));
    }

    return data;
  }

  // Create wallet
  async createWallet(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('wallets')
      .insert({
        user_id: userId,
        gac_balance: 0,
        pac_balance: 0,
        staked_amount: 0,
        staking_tier: null,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  // Get transactions
  async getTransactions(
    userId: string,
    type?: string,
    limit?: number,
    offset?: number
  ) {
    let query = supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', userId);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset || 0, (offset || 0) + (limit || 20) - 1);

    if (error) throw error;

    return data;
  }

  // Deposit tokens
  async deposit(
    userId: string,
    amount: number,
    tokenType: 'GAC' | 'PAC',
    transactionHash: string
  ) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get or create wallet
      let wallet = await this.getWalletByUserId(userId);
      if (!wallet) {
        wallet = await this.createWallet(userId);
      }

      // Update wallet balance
      const balanceField = tokenType === 'GAC' ? 'gac_balance' : 'pac_balance';
      const newBalance = parseFloat(wallet[balanceField]) + amount;

      await client.query(
        `UPDATE giperarena.wallets SET ${balanceField} = $1 WHERE user_id = $2`,
        [newBalance, userId]
      );

      // Create transaction record
      const result = await client.query(
        `
        INSERT INTO giperarena.transactions (
          user_id, type, amount, token_type, status, transaction_hash
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
        [userId, 'deposit', amount, tokenType, 'completed', transactionHash]
      );

      await client.query('COMMIT');

      // Invalidate cache
      await redis.del(`wallet:${userId}`);

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Withdraw tokens
  async withdraw(
    userId: string,
    amount: number,
    tokenType: 'GAC' | 'PAC',
    recipientAddress: string
  ) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get wallet
      const wallet = await this.getWalletByUserId(userId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Check balance
      const balanceField = tokenType === 'GAC' ? 'gac_balance' : 'pac_balance';
      const currentBalance = parseFloat(wallet[balanceField]);

      if (currentBalance < amount) {
        throw new Error('Insufficient balance');
      }

      // Update wallet balance
      const newBalance = currentBalance - amount;
      await client.query(
        `UPDATE giperarena.wallets SET ${balanceField} = $1 WHERE user_id = $2`,
        [newBalance, userId]
      );

      // Create transaction record
      const result = await client.query(
        `
        INSERT INTO giperarena.transactions (
          user_id, type, amount, token_type, status, recipient_address
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
        [userId, 'withdrawal', amount, tokenType, 'pending', recipientAddress]
      );

      await client.query('COMMIT');

      // Invalidate cache
      await redis.del(`wallet:${userId}`);

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Stake tokens
  async stake(userId: string, amount: number, durationDays: number) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get wallet
      const wallet = await this.getWalletByUserId(userId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Check PAC balance
      const currentBalance = parseFloat(wallet.pac_balance);
      if (currentBalance < amount) {
        throw new Error('Insufficient balance');
      }

      // Calculate staking tier based on amount
      let stakingTier = 'bronze';
      if (amount >= 100000) stakingTier = 'platinum';
      else if (amount >= 50000) stakingTier = 'gold';
      else if (amount >= 10000) stakingTier = 'silver';

      // Calculate unlock date
      const unlockDate = new Date();
      unlockDate.setDate(unlockDate.getDate() + durationDays);

      // Update wallet
      await client.query(
        `
        UPDATE giperarena.wallets
        SET pac_balance = $1,
            staked_amount = staked_amount + $2,
            staking_tier = $3,
            stake_unlock_date = $4
        WHERE user_id = $5
      `,
        [currentBalance - amount, amount, stakingTier, unlockDate, userId]
      );

      // Create transaction record
      const result = await client.query(
        `
        INSERT INTO giperarena.transactions (
          user_id, type, amount, token_type, status
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
        [userId, 'stake', amount, 'PAC', 'completed']
      );

      await client.query('COMMIT');

      // Invalidate cache
      await redis.del(`wallet:${userId}`);

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Unstake tokens
  async unstake(userId: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get wallet
      const wallet = await this.getWalletByUserId(userId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const stakedAmount = parseFloat(wallet.staked_amount);
      if (stakedAmount === 0) {
        throw new Error('No active stake found');
      }

      // Check if unlock date has passed
      const unlockDate = new Date(wallet.stake_unlock_date);
      const now = new Date();

      if (now < unlockDate) {
        throw new Error('Stake period not completed');
      }

      // Calculate rewards (example: 10% APY)
      const durationDays = Math.floor(
        (now.getTime() - new Date(wallet.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      const rewards = stakedAmount * 0.1 * (durationDays / 365);

      // Update wallet
      await client.query(
        `
        UPDATE giperarena.wallets
        SET pac_balance = pac_balance + $1 + $2,
            staked_amount = 0,
            staking_tier = NULL,
            stake_unlock_date = NULL
        WHERE user_id = $3
      `,
        [stakedAmount, rewards, userId]
      );

      // Create transaction record
      const result = await client.query(
        `
        INSERT INTO giperarena.transactions (
          user_id, type, amount, token_type, status
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
        [userId, 'unstake', stakedAmount + rewards, 'PAC', 'completed']
      );

      await client.query('COMMIT');

      // Invalidate cache
      await redis.del(`wallet:${userId}`);

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get staking info
  async getStakingInfo(userId: string) {
    const wallet = await this.getWalletByUserId(userId);

    if (!wallet || parseFloat(wallet.staked_amount) === 0) {
      return {
        is_staking: false,
        staked_amount: 0,
        staking_tier: null,
        unlock_date: null,
        days_remaining: 0,
      };
    }

    const unlockDate = new Date(wallet.stake_unlock_date);
    const now = new Date();
    const daysRemaining = Math.max(
      0,
      Math.ceil((unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    return {
      is_staking: true,
      staked_amount: parseFloat(wallet.staked_amount),
      staking_tier: wallet.staking_tier,
      unlock_date: wallet.stake_unlock_date,
      days_remaining: daysRemaining,
    };
  }
}

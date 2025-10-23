// Bets Controller - Handle betting operations
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { BetsService } from '../services/BetsService';

export class BetsController {
  private betsService: BetsService;

  constructor() {
    this.betsService = new BetsService();
  }

  // Get all betting markets
  async getBettingMarkets(req: AuthRequest, res: Response) {
    try {
      const { status, event_type, event_id, limit = 20, offset = 0 } = req.query;

      const filters: any = {};

      if (status) filters.status = status;
      if (event_type) filters.event_type = event_type;
      if (event_id) filters.event_id = event_id;

      const markets = await this.betsService.getBettingMarkets(
        filters,
        Number(limit),
        Number(offset)
      );

      return res.json({
        success: true,
        data: markets,
      });
    } catch (error) {
      console.error('Get betting markets error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch betting markets',
      });
    }
  }

  // Get betting market by ID
  async getBettingMarketById(req: AuthRequest, res: Response) {
    try {
      const { marketId } = req.params;

      const market = await this.betsService.getBettingMarketById(marketId);

      if (!market) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Betting market not found',
        });
      }

      return res.json({
        success: true,
        data: market,
      });
    } catch (error) {
      console.error('Get betting market error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch betting market',
      });
    }
  }

  // Place bet
  async placeBet(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { market_id, outcome, amount } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      // Validate input
      if (!market_id || !outcome || !amount) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Missing required fields: market_id, outcome, amount',
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Bet amount must be greater than 0',
        });
      }

      const bet = await this.betsService.placeBet(userId, market_id, outcome, amount);

      return res.status(201).json({
        success: true,
        data: bet,
      });
    } catch (error: any) {
      console.error('Place bet error:', error);

      if (error.message === 'Market is closed') {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Betting market is closed',
        });
      }

      if (error.message === 'Insufficient balance') {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Insufficient PAC balance to place bet',
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to place bet',
      });
    }
  }

  // Get user's bets
  async getUserBets(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { status, limit = 20, offset = 0 } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      const bets = await this.betsService.getUserBets(
        userId,
        status as string | undefined,
        Number(limit),
        Number(offset)
      );

      return res.json({
        success: true,
        data: bets,
      });
    } catch (error) {
      console.error('Get user bets error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch user bets',
      });
    }
  }

  // Get bet by ID
  async getBetById(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { betId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      const bet = await this.betsService.getBetById(betId);

      if (!bet) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Bet not found',
        });
      }

      // Check ownership
      if (bet.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only view your own bets',
        });
      }

      return res.json({
        success: true,
        data: bet,
      });
    } catch (error) {
      console.error('Get bet error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch bet',
      });
    }
  }

  // Cancel bet (if allowed)
  async cancelBet(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { betId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      // Get bet
      const bet = await this.betsService.getBetById(betId);

      if (!bet) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Bet not found',
        });
      }

      // Check ownership
      if (bet.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only cancel your own bets',
        });
      }

      // Check if bet can be cancelled
      if (bet.status !== 'pending') {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Only pending bets can be cancelled',
        });
      }

      await this.betsService.cancelBet(betId, userId);

      return res.json({
        success: true,
        message: 'Bet cancelled successfully',
      });
    } catch (error: any) {
      console.error('Cancel bet error:', error);

      if (error.message === 'Event has started') {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Cannot cancel bet after event has started',
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to cancel bet',
      });
    }
  }

  // Get betting statistics
  async getBettingStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      const stats = await this.betsService.getUserBettingStats(userId);

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Get betting stats error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch betting statistics',
      });
    }
  }
}

// Wallets Controller - Handle wallet and transaction operations
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { WalletsService } from '../services/WalletsService';

export class WalletsController {
  private walletsService: WalletsService;

  constructor() {
    this.walletsService = new WalletsService();
  }

  // Get user's wallet
  async getWallet(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      const wallet = await this.walletsService.getWalletByUserId(userId);

      if (!wallet) {
        // Create wallet if it doesn't exist
        const newWallet = await this.walletsService.createWallet(userId);
        return res.json({
          success: true,
          data: newWallet,
        });
      }

      return res.json({
        success: true,
        data: wallet,
      });
    } catch (error) {
      console.error('Get wallet error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch wallet',
      });
    }
  }

  // Get transaction history
  async getTransactions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { type, limit = 20, offset = 0 } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      const transactions = await this.walletsService.getTransactions(
        userId,
        type as string | undefined,
        Number(limit),
        Number(offset)
      );

      return res.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch transactions',
      });
    }
  }

  // Deposit tokens
  async deposit(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { amount, token_type, transaction_hash } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      // Validate input
      if (!amount || !token_type || !transaction_hash) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Missing required fields: amount, token_type, transaction_hash',
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Amount must be greater than 0',
        });
      }

      if (!['GAC', 'PAC'].includes(token_type)) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Invalid token_type. Must be GAC or PAC',
        });
      }

      const transaction = await this.walletsService.deposit(
        userId,
        amount,
        token_type,
        transaction_hash
      );

      return res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      console.error('Deposit error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to process deposit',
      });
    }
  }

  // Withdraw tokens
  async withdraw(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { amount, token_type, recipient_address } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      // Validate input
      if (!amount || !token_type || !recipient_address) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Missing required fields: amount, token_type, recipient_address',
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Amount must be greater than 0',
        });
      }

      if (!['GAC', 'PAC'].includes(token_type)) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Invalid token_type. Must be GAC or PAC',
        });
      }

      const transaction = await this.walletsService.withdraw(
        userId,
        amount,
        token_type,
        recipient_address
      );

      return res.json({
        success: true,
        data: transaction,
      });
    } catch (error: any) {
      console.error('Withdraw error:', error);

      if (error.message === 'Insufficient balance') {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Insufficient balance for withdrawal',
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to process withdrawal',
      });
    }
  }

  // Stake tokens
  async stake(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { amount, duration_days } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      // Validate input
      if (!amount || !duration_days) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Missing required fields: amount, duration_days',
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Amount must be greater than 0',
        });
      }

      if (![30, 90, 180, 365].includes(Number(duration_days))) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Duration must be 30, 90, 180, or 365 days',
        });
      }

      const transaction = await this.walletsService.stake(
        userId,
        amount,
        Number(duration_days)
      );

      return res.json({
        success: true,
        data: transaction,
      });
    } catch (error: any) {
      console.error('Stake error:', error);

      if (error.message === 'Insufficient balance') {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Insufficient PAC balance for staking',
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to process staking',
      });
    }
  }

  // Unstake tokens
  async unstake(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      const transaction = await this.walletsService.unstake(userId);

      return res.json({
        success: true,
        data: transaction,
      });
    } catch (error: any) {
      console.error('Unstake error:', error);

      if (error.message === 'No active stake found') {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'No active stake found',
        });
      }

      if (error.message === 'Stake period not completed') {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Cannot unstake before the staking period ends',
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to process unstaking',
      });
    }
  }

  // Get staking info
  async getStakingInfo(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      const stakingInfo = await this.walletsService.getStakingInfo(userId);

      return res.json({
        success: true,
        data: stakingInfo,
      });
    } catch (error) {
      console.error('Get staking info error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch staking information',
      });
    }
  }
}

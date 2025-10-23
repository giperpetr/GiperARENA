// Game Sessions Controller - Handle game session lifecycle
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { GameSessionsService } from '../services/GameSessionsService';

export class GameSessionsController {
  private gameSessionsService: GameSessionsService;

  constructor() {
    this.gameSessionsService = new GameSessionsService();
  }

  // Get all game sessions with filters
  async getGameSessions(req: AuthRequest, res: Response) {
    try {
      const { arena_id, player_id, status, limit = 20, offset = 0 } = req.query;

      const filters: any = {};

      if (arena_id) filters.arena_id = arena_id;
      if (player_id) filters.player_id = player_id;
      if (status) filters.status = status;

      const sessions = await this.gameSessionsService.getGameSessions(
        filters,
        Number(limit),
        Number(offset)
      );

      return res.json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      console.error('Get game sessions error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch game sessions',
      });
    }
  }

  // Get game session by ID
  async getGameSessionById(req: AuthRequest, res: Response) {
    try {
      const { sessionId } = req.params;

      const session = await this.gameSessionsService.getGameSessionById(sessionId);

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Game session not found',
        });
      }

      return res.json({
        success: true,
        data: session,
      });
    } catch (error) {
      console.error('Get game session error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch game session',
      });
    }
  }

  // Create new game session
  async createGameSession(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      const sessionData = {
        ...req.body,
        player_id: userId,
      };

      // Validate required fields
      const requiredFields = ['arena_id'];
      const missingFields = requiredFields.filter((field) => !sessionData[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
      }

      const session = await this.gameSessionsService.createGameSession(sessionData);

      return res.status(201).json({
        success: true,
        data: session,
      });
    } catch (error) {
      console.error('Create game session error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to create game session',
      });
    }
  }

  // Start game session
  async startGameSession(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { sessionId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      // Verify session exists and user is the player
      const session = await this.gameSessionsService.getGameSessionById(sessionId);

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Game session not found',
        });
      }

      if (session.player_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Only the session player can start this game',
        });
      }

      if (session.status !== 'waiting') {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: `Cannot start session with status: ${session.status}`,
        });
      }

      const updatedSession = await this.gameSessionsService.startGameSession(sessionId);

      return res.json({
        success: true,
        data: updatedSession,
      });
    } catch (error) {
      console.error('Start game session error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to start game session',
      });
    }
  }

  // End game session
  async endGameSession(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { sessionId } = req.params;
      const { score, replay_url } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      // Verify session exists
      const session = await this.gameSessionsService.getGameSessionById(sessionId);

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Game session not found',
        });
      }

      // Allow player or arena operator to end session
      if (session.player_id !== userId && session.arena_operator_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Only the player or arena operator can end this session',
        });
      }

      if (session.status !== 'active') {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: `Cannot end session with status: ${session.status}`,
        });
      }

      const updatedSession = await this.gameSessionsService.endGameSession(
        sessionId,
        score,
        replay_url
      );

      return res.json({
        success: true,
        data: updatedSession,
      });
    } catch (error) {
      console.error('End game session error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to end game session',
      });
    }
  }

  // Cancel game session
  async cancelGameSession(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { sessionId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      // Verify session exists and user is the player
      const session = await this.gameSessionsService.getGameSessionById(sessionId);

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Game session not found',
        });
      }

      if (session.player_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Only the session player can cancel this game',
        });
      }

      if (session.status === 'completed' || session.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: `Cannot cancel session with status: ${session.status}`,
        });
      }

      const updatedSession = await this.gameSessionsService.cancelGameSession(sessionId);

      return res.json({
        success: true,
        data: updatedSession,
      });
    } catch (error) {
      console.error('Cancel game session error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to cancel game session',
      });
    }
  }

  // Get user's game history
  async getUserGameHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { limit = 20, offset = 0 } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      const history = await this.gameSessionsService.getUserGameHistory(
        userId,
        Number(limit),
        Number(offset)
      );

      return res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      console.error('Get user game history error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch game history',
      });
    }
  }
}

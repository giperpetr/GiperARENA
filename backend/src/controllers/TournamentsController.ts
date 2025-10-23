// Tournaments Controller - Handle tournament operations
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { TournamentsService } from '../services/TournamentsService';

export class TournamentsController {
  private tournamentsService: TournamentsService;

  constructor() {
    this.tournamentsService = new TournamentsService();
  }

  // Get all tournaments with filters
  async getTournaments(req: Request, res: Response) {
    try {
      const { status, arena_id, tournament_type, limit = 20, offset = 0 } = req.query;

      const filters: any = {};

      if (status) filters.status = status;
      if (arena_id) filters.arena_id = arena_id;
      if (tournament_type) filters.tournament_type = tournament_type;

      const tournaments = await this.tournamentsService.getTournaments(
        filters,
        Number(limit),
        Number(offset)
      );

      return res.json({
        success: true,
        data: tournaments,
      });
    } catch (error) {
      console.error('Get tournaments error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch tournaments',
      });
    }
  }

  // Get tournament by ID
  async getTournamentById(req: Request, res: Response) {
    try {
      const { tournamentId } = req.params;

      const tournament = await this.tournamentsService.getTournamentById(tournamentId);

      if (!tournament) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Tournament not found',
        });
      }

      return res.json({
        success: true,
        data: tournament,
      });
    } catch (error) {
      console.error('Get tournament error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch tournament',
      });
    }
  }

  // Create tournament (operator only)
  async createTournament(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      const tournamentData = {
        ...req.body,
        organizer_id: userId,
      };

      // Validate required fields
      const requiredFields = ['name', 'arena_id', 'tournament_type', 'start_date'];
      const missingFields = requiredFields.filter((field) => !tournamentData[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
      }

      const tournament = await this.tournamentsService.createTournament(tournamentData);

      return res.status(201).json({
        success: true,
        data: tournament,
      });
    } catch (error) {
      console.error('Create tournament error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to create tournament',
      });
    }
  }

  // Register for tournament
  async registerForTournament(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { tournamentId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      const registration = await this.tournamentsService.registerParticipant(
        tournamentId,
        userId
      );

      return res.json({
        success: true,
        data: registration,
      });
    } catch (error: any) {
      console.error('Register for tournament error:', error);

      if (error.message === 'Tournament is full') {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Tournament has reached maximum participants',
        });
      }

      if (error.message === 'Already registered') {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'You are already registered for this tournament',
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to register for tournament',
      });
    }
  }

  // Unregister from tournament
  async unregisterFromTournament(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { tournamentId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      await this.tournamentsService.unregisterParticipant(tournamentId, userId);

      return res.json({
        success: true,
        message: 'Successfully unregistered from tournament',
      });
    } catch (error: any) {
      console.error('Unregister from tournament error:', error);

      if (error.message === 'Tournament has already started') {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Cannot unregister after tournament has started',
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to unregister from tournament',
      });
    }
  }

  // Get tournament participants
  async getTournamentParticipants(req: Request, res: Response) {
    try {
      const { tournamentId } = req.params;

      const participants = await this.tournamentsService.getTournamentParticipants(
        tournamentId
      );

      return res.json({
        success: true,
        data: participants,
      });
    } catch (error) {
      console.error('Get tournament participants error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch tournament participants',
      });
    }
  }

  // Get tournament bracket
  async getTournamentBracket(req: Request, res: Response) {
    try {
      const { tournamentId } = req.params;

      const bracket = await this.tournamentsService.getTournamentBracket(tournamentId);

      return res.json({
        success: true,
        data: bracket,
      });
    } catch (error) {
      console.error('Get tournament bracket error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch tournament bracket',
      });
    }
  }

  // Start tournament (organizer only)
  async startTournament(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { tournamentId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      // Verify tournament exists and user is organizer
      const tournament = await this.tournamentsService.getTournamentById(tournamentId);

      if (!tournament) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Tournament not found',
        });
      }

      if (tournament.organizer_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Only the tournament organizer can start the tournament',
        });
      }

      const updatedTournament = await this.tournamentsService.startTournament(tournamentId);

      return res.json({
        success: true,
        data: updatedTournament,
      });
    } catch (error) {
      console.error('Start tournament error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to start tournament',
      });
    }
  }

  // Complete tournament (organizer only)
  async completeTournament(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { tournamentId } = req.params;
      const { winner_id } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      // Verify tournament exists and user is organizer
      const tournament = await this.tournamentsService.getTournamentById(tournamentId);

      if (!tournament) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Tournament not found',
        });
      }

      if (tournament.organizer_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Only the tournament organizer can complete the tournament',
        });
      }

      const updatedTournament = await this.tournamentsService.completeTournament(
        tournamentId,
        winner_id
      );

      return res.json({
        success: true,
        data: updatedTournament,
      });
    } catch (error) {
      console.error('Complete tournament error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to complete tournament',
      });
    }
  }
}

// Arenas Controller - Handle arena management
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ArenasService } from '../services/ArenasService';

export class ArenasController {
  private arenasService: ArenasService;

  constructor() {
    this.arenasService = new ArenasService();
  }

  // Get all arenas with filters
  async getArenas(req: Request, res: Response) {
    try {
      const {
        status,
        game_type,
        country,
        city,
        limit = 20,
        offset = 0,
        lat,
        lng,
        radius,
      } = req.query;

      const filters: any = {};

      if (status) filters.status = status;
      if (game_type) filters.game_type = game_type;
      if (country) filters.country = country;
      if (city) filters.city = city;

      // Location-based search
      if (lat && lng && radius) {
        filters.location = {
          lat: Number(lat),
          lng: Number(lng),
          radius: Number(radius),
        };
      }

      const arenas = await this.arenasService.getArenas(
        filters,
        Number(limit),
        Number(offset)
      );

      return res.json({
        success: true,
        data: arenas,
      });
    } catch (error) {
      console.error('Get arenas error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch arenas',
      });
    }
  }

  // Get arena by ID
  async getArenaById(req: Request, res: Response) {
    try {
      const { arenaId } = req.params;

      const arena = await this.arenasService.getArenaById(arenaId);

      if (!arena) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Arena not found',
        });
      }

      return res.json({
        success: true,
        data: arena,
      });
    } catch (error) {
      console.error('Get arena error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch arena',
      });
    }
  }

  // Create new arena (operator only)
  async createArena(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      const arenaData = {
        ...req.body,
        operator_id: userId,
      };

      // Validate required fields
      const requiredFields = ['name', 'game_type', 'country', 'city'];
      const missingFields = requiredFields.filter((field) => !arenaData[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
      }

      const arena = await this.arenasService.createArena(arenaData);

      return res.status(201).json({
        success: true,
        data: arena,
      });
    } catch (error) {
      console.error('Create arena error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to create arena',
      });
    }
  }

  // Update arena (operator only)
  async updateArena(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { arenaId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      // Verify arena exists and user is the operator
      const arena = await this.arenasService.getArenaById(arenaId);

      if (!arena) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Arena not found',
        });
      }

      if (arena.operator_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Only the arena operator can update this arena',
        });
      }

      const updates = req.body;
      const updatedArena = await this.arenasService.updateArena(arenaId, updates);

      return res.json({
        success: true,
        data: updatedArena,
      });
    } catch (error) {
      console.error('Update arena error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update arena',
      });
    }
  }

  // Delete arena (operator only)
  async deleteArena(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { arenaId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      // Verify arena exists and user is the operator
      const arena = await this.arenasService.getArenaById(arenaId);

      if (!arena) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Arena not found',
        });
      }

      if (arena.operator_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Only the arena operator can delete this arena',
        });
      }

      await this.arenasService.deleteArena(arenaId);

      return res.json({
        success: true,
        message: 'Arena deleted successfully',
      });
    } catch (error) {
      console.error('Delete arena error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to delete arena',
      });
    }
  }

  // Search arenas by name
  async searchArenas(req: Request, res: Response) {
    try {
      const { query, limit = 10, offset = 0 } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Search query is required',
        });
      }

      const arenas = await this.arenasService.searchArenas(
        query,
        Number(limit),
        Number(offset)
      );

      return res.json({
        success: true,
        data: arenas,
      });
    } catch (error) {
      console.error('Search arenas error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to search arenas',
      });
    }
  }

  // Get arena statistics
  async getArenaStats(req: Request, res: Response) {
    try {
      const { arenaId } = req.params;

      const stats = await this.arenasService.getArenaStats(arenaId);

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Get arena stats error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch arena statistics',
      });
    }
  }
}

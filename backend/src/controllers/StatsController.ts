// Stats Controller - Handle platform statistics requests
import { Request, Response } from 'express';
import { StatsService } from '../services/StatsService';

export class StatsController {
  private statsService: StatsService;

  constructor() {
    this.statsService = new StatsService();
  }

  /**
   * GET /stats/live
   * Get current live platform statistics
   */
  async getLiveStats(_req: Request, res: Response) {
    try {
      const stats = await this.statsService.getLiveStats();

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Error fetching live stats:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch live statistics',
      });
    }
  }

  /**
   * GET /stats/platform?period=today|week|month|all_time
   * Get platform statistics for a specific time period
   */
  async getPlatformStats(req: Request, res: Response) {
    try {
      const period = (req.query.period as string) || 'all_time';

      // Validate period
      if (!['today', 'week', 'month', 'all_time'].includes(period)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid period. Must be one of: today, week, month, all_time',
        });
      }

      const stats = await this.statsService.getPlatformStats(
        period as 'today' | 'week' | 'month' | 'all_time'
      );

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Error fetching platform stats:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch platform statistics',
      });
    }
  }
}

// Users Controller - Handle user profile operations
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UsersService } from '../services/UsersService';

export class UsersController {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  // Get current user profile
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      const user = await this.usersService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'User not found',
        });
      }

      return res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch user profile',
      });
    }
  }

  // Get user by ID
  async getUserById(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;

      const user = await this.usersService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'User not found',
        });
      }

      return res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Get user error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch user',
      });
    }
  }

  // Update user profile
  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      const updates = req.body;

      // Validate that user can only update their own profile
      if (updates.id && updates.id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Cannot update other users profiles',
        });
      }

      const updatedUser = await this.usersService.updateUser(userId, updates);

      return res.json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update profile',
      });
    }
  }

  // Get user statistics
  async getUserStats(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;

      const stats = await this.usersService.getUserStats(userId);

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch user statistics',
      });
    }
  }

  // Search users
  async searchUsers(req: AuthRequest, res: Response) {
    try {
      const { query, limit = 10, offset = 0 } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Search query is required',
        });
      }

      const users = await this.usersService.searchUsers(
        query,
        Number(limit),
        Number(offset)
      );

      return res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error('Search users error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to search users',
      });
    }
  }

  // Deactivate user account
  async deactivateAccount(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      await this.usersService.deactivateUser(userId);

      return res.json({
        success: true,
        message: 'Account deactivated successfully',
      });
    } catch (error) {
      console.error('Deactivate account error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to deactivate account',
      });
    }
  }
}

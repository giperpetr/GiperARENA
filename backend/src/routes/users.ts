// User routes
import { Router } from 'express';
import { UsersController } from '../controllers/UsersController';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimit';

const router = Router();
const usersController = new UsersController();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Get current user profile (authenticated)
router.get('/me', authenticate, (req, res) => usersController.getProfile(req, res));

// Get user by ID
router.get('/:userId', (req, res) => usersController.getUserById(req, res));

// Update current user profile (authenticated)
router.patch('/me', authenticate, (req, res) => usersController.updateProfile(req, res));

// Get user statistics
router.get('/:userId/stats', (req, res) => usersController.getUserStats(req, res));

// Search users
router.get('/search', (req, res) => usersController.searchUsers(req, res));

// Deactivate account (authenticated)
router.delete('/me', authenticate, (req, res) =>
  usersController.deactivateAccount(req, res)
);

export default router;

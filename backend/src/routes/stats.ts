// Stats routes
import { Router } from 'express';
import { StatsController } from '../controllers/StatsController';
import { apiLimiter } from '../middleware/rateLimit';

const router = Router();
const statsController = new StatsController();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Get live platform statistics (public)
router.get('/live', (req, res) => statsController.getLiveStats(req, res));

// Get platform statistics for a specific period (public)
router.get('/platform', (req, res) => statsController.getPlatformStats(req, res));

export default router;

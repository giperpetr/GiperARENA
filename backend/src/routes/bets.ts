// Betting routes
import { Router } from 'express';
import { BetsController } from '../controllers/BetsController';
import { authenticate } from '../middleware/auth';
import { apiLimiter, strictLimiter } from '../middleware/rateLimit';

const router = Router();
const betsController = new BetsController();

// All betting routes require authentication
router.use(authenticate);

// Get all betting markets
router.get('/markets', apiLimiter, (req, res) =>
  betsController.getBettingMarkets(req, res)
);

// Get betting market by ID
router.get('/markets/:marketId', apiLimiter, (req, res) =>
  betsController.getBettingMarketById(req, res)
);

// Get user's bets
router.get('/my-bets', apiLimiter, (req, res) => betsController.getUserBets(req, res));

// Get betting statistics
router.get('/stats', apiLimiter, (req, res) => betsController.getBettingStats(req, res));

// Get bet by ID
router.get('/:betId', apiLimiter, (req, res) => betsController.getBetById(req, res));

// Place bet (strict rate limit)
router.post('/', strictLimiter, (req, res) => betsController.placeBet(req, res));

// Cancel bet
router.delete('/:betId', strictLimiter, (req, res) => betsController.cancelBet(req, res));

export default router;

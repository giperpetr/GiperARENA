// Game session routes
import { Router } from 'express';
import { GameSessionsController } from '../controllers/GameSessionsController';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimit';

const router = Router();
const gameSessionsController = new GameSessionsController();

// Apply rate limiting to all routes
router.use(apiLimiter);

// All session routes require authentication
router.use(authenticate);

// Get all game sessions (with filters)
router.get('/', (req, res) => gameSessionsController.getGameSessions(req, res));

// Get game session by ID
router.get('/:sessionId', (req, res) =>
  gameSessionsController.getGameSessionById(req, res)
);

// Create new game session
router.post('/', (req, res) => gameSessionsController.createGameSession(req, res));

// Start game session
router.post('/:sessionId/start', (req, res) =>
  gameSessionsController.startGameSession(req, res)
);

// End game session
router.post('/:sessionId/end', (req, res) =>
  gameSessionsController.endGameSession(req, res)
);

// Cancel game session
router.post('/:sessionId/cancel', (req, res) =>
  gameSessionsController.cancelGameSession(req, res)
);

// Get user's game history
router.get('/me/history', (req, res) =>
  gameSessionsController.getUserGameHistory(req, res)
);

export default router;

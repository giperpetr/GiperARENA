// Arena routes
import { Router } from 'express';
import { ArenasController } from '../controllers/ArenasController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimit';

const router = Router();
const arenasController = new ArenasController();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Get all arenas (public, with optional auth)
router.get('/', optionalAuth, (req, res) => arenasController.getArenas(req, res));

// Search arenas
router.get('/search', (req, res) => arenasController.searchArenas(req, res));

// Get arena by ID (public)
router.get('/:arenaId', (req, res) => arenasController.getArenaById(req, res));

// Get arena statistics (public)
router.get('/:arenaId/stats', (req, res) => arenasController.getArenaStats(req, res));

// Create arena (authenticated, operator only)
router.post('/', authenticate, (req, res) => arenasController.createArena(req, res));

// Update arena (authenticated, operator only)
router.patch('/:arenaId', authenticate, (req, res) =>
  arenasController.updateArena(req, res)
);

// Delete arena (authenticated, operator only)
router.delete('/:arenaId', authenticate, (req, res) =>
  arenasController.deleteArena(req, res)
);

export default router;

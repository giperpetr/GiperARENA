// Tournament routes
import { Router } from 'express';
import { TournamentsController } from '../controllers/TournamentsController';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimit';

const router = Router();
const tournamentsController = new TournamentsController();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Get all tournaments (public)
router.get('/', (req, res) => tournamentsController.getTournaments(req, res));

// Get tournament by ID (public)
router.get('/:tournamentId', (req, res) =>
  tournamentsController.getTournamentById(req, res)
);

// Get tournament participants (public)
router.get('/:tournamentId/participants', (req, res) =>
  tournamentsController.getTournamentParticipants(req, res)
);

// Get tournament bracket (public)
router.get('/:tournamentId/bracket', (req, res) =>
  tournamentsController.getTournamentBracket(req, res)
);

// Create tournament (authenticated)
router.post('/', authenticate, (req, res) =>
  tournamentsController.createTournament(req, res)
);

// Register for tournament (authenticated)
router.post('/:tournamentId/register', authenticate, (req, res) =>
  tournamentsController.registerForTournament(req, res)
);

// Unregister from tournament (authenticated)
router.delete('/:tournamentId/register', authenticate, (req, res) =>
  tournamentsController.unregisterFromTournament(req, res)
);

// Start tournament (authenticated, organizer only)
router.post('/:tournamentId/start', authenticate, (req, res) =>
  tournamentsController.startTournament(req, res)
);

// Complete tournament (authenticated, organizer only)
router.post('/:tournamentId/complete', authenticate, (req, res) =>
  tournamentsController.completeTournament(req, res)
);

export default router;

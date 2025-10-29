// Main routes index - exports all route modules
import { Router } from 'express';
import usersRoutes from './users';
import arenasRoutes from './arenas';
import sessionsRoutes from './sessions';
import walletsRoutes from './wallets';
import tournamentsRoutes from './tournaments';
import betsRoutes from './bets';
import nftsRoutes from './nfts';
// import mediaRoutes from './media'; // Temporarily disabled - TS errors

const router = Router();

// Mount all route modules
router.use('/users', usersRoutes);
router.use('/arenas', arenasRoutes);
router.use('/sessions', sessionsRoutes);
router.use('/wallets', walletsRoutes);
router.use('/tournaments', tournamentsRoutes);
router.use('/bets', betsRoutes);
router.use('/nfts', nftsRoutes);
// router.use('/media', mediaRoutes); // Temporarily disabled - TS errors

export default router;

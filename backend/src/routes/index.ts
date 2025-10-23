// Main routes index - exports all route modules
import { Router } from 'express';
import usersRoutes from './users';
import arenasRoutes from './arenas';
import sessionsRoutes from './sessions';
import walletsRoutes from './wallets';
import tournamentsRoutes from './tournaments';
import betsRoutes from './bets';
import nftsRoutes from './nfts';

const router = Router();

// Mount all route modules
router.use('/users', usersRoutes);
router.use('/arenas', arenasRoutes);
router.use('/sessions', sessionsRoutes);
router.use('/wallets', walletsRoutes);
router.use('/tournaments', tournamentsRoutes);
router.use('/bets', betsRoutes);
router.use('/nfts', nftsRoutes);

export default router;

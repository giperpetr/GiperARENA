// Wallet routes
import { Router } from 'express';
import { WalletsController } from '../controllers/WalletsController';
import { authenticate } from '../middleware/auth';
import { apiLimiter, strictLimiter } from '../middleware/rateLimit';

const router = Router();
const walletsController = new WalletsController();

// All wallet routes require authentication
router.use(authenticate);

// Get wallet
router.get('/', apiLimiter, (req, res) => walletsController.getWallet(req, res));

// Get transaction history
router.get('/transactions', apiLimiter, (req, res) =>
  walletsController.getTransactions(req, res)
);

// Deposit tokens (strict rate limit)
router.post('/deposit', strictLimiter, (req, res) => walletsController.deposit(req, res));

// Withdraw tokens (strict rate limit)
router.post('/withdraw', strictLimiter, (req, res) =>
  walletsController.withdraw(req, res)
);

// Stake tokens
router.post('/stake', strictLimiter, (req, res) => walletsController.stake(req, res));

// Unstake tokens
router.post('/unstake', strictLimiter, (req, res) => walletsController.unstake(req, res));

// Get staking info
router.get('/staking', apiLimiter, (req, res) =>
  walletsController.getStakingInfo(req, res)
);

export default router;

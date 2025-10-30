// Seed routes - TEMPORARY for database seeding
import { Router } from 'express';
import { SeedController } from '../controllers/SeedController';

const router = Router();
const seedController = new SeedController();

// POST /api/v1/seed
router.post('/', (req, res) => seedController.seedDatabase(req, res));

export default router;

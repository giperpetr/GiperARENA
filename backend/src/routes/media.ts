// Media routes
import { Router } from 'express';
import { MediaFilesController } from '../controllers/MediaFilesController';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimit';

const router = Router();
const mediaFilesController = new MediaFilesController();

// Apply rate limiting to all routes
router.use(apiLimiter);

/**
 * Upload file (authenticated)
 * POST /api/v1/media/upload
 *
 * Body (multipart/form-data):
 * - file: File (required)
 * - file_type: 'avatar' | 'video' | 'replay' | 'document' | 'image' | 'thumbnail' | 'banner' (required)
 * - entity_type: 'user' | 'arena' | 'session' | 'tournament' | 'device' (required)
 * - entity_id: UUID (required)
 * - metadata: JSON string (optional)
 */
router.post(
  '/upload',
  authenticate,
  mediaFilesController.uploadMiddleware,
  (req, res) => mediaFilesController.uploadFile(req, res)
);

/**
 * Get file metadata by ID
 * GET /api/v1/media/:fileId
 */
router.get('/:fileId', (req, res) =>
  mediaFilesController.getFileById(req, res)
);

/**
 * Get file URL (signed)
 * GET /api/v1/media/:fileId/url?expiresIn=3600
 */
router.get('/:fileId/url', (req, res) =>
  mediaFilesController.getFileUrl(req, res)
);

/**
 * Get all files for an entity
 * GET /api/v1/media/entity/:entityType/:entityId?fileType=avatar
 */
router.get('/entity/:entityType/:entityId', (req, res) =>
  mediaFilesController.getEntityFiles(req, res)
);

/**
 * Delete file (authenticated, owner only)
 * DELETE /api/v1/media/:fileId
 */
router.delete('/:fileId', authenticate, (req, res) =>
  mediaFilesController.deleteFile(req, res)
);

export default router;

// MediaFiles Controller - Handle file upload/download requests
import { Request, Response } from 'express';
import { MediaFilesService } from '../services/MediaFilesService';
import multer from 'multer';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 52428800, // 50MB
  },
  fileFilter: (req, file, cb) => {
    // Allowed mime types
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'application/pdf',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  },
});

export class MediaFilesController {
  private mediaFilesService: MediaFilesService;

  constructor() {
    this.mediaFilesService = new MediaFilesService();
  }

  // Multer middleware for single file upload
  uploadMiddleware = upload.single('file');

  /**
   * Upload file
   * POST /api/v1/media/upload
   */
  async uploadFile(req: Request, res: Response) {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          error: 'No file provided',
          message: 'Please upload a file',
        });
      }

      const { file_type, entity_type, entity_id, metadata } = req.body;

      // Validate required fields
      if (!file_type || !entity_type || !entity_id) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'file_type, entity_type, and entity_id are required',
        });
      }

      // Get user ID from auth middleware
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in to upload files',
        });
      }

      // Upload file
      const result = await this.mediaFilesService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        {
          file_type,
          entity_type,
          entity_id,
          uploaded_by: userId,
          metadata: metadata ? JSON.parse(metadata) : undefined,
        }
      );

      res.status(201).json({
        message: 'File uploaded successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({
        error: 'Upload failed',
        message: error.message,
      });
    }
  }

  /**
   * Get file metadata by ID
   * GET /api/v1/media/:fileId
   */
  async getFileById(req: Request, res: Response) {
    try {
      const { fileId } = req.params;

      const file = await this.mediaFilesService.getFileById(fileId);

      if (!file) {
        return res.status(404).json({
          error: 'File not found',
        });
      }

      res.json({
        data: file,
      });
    } catch (error: any) {
      console.error('Get file error:', error);
      res.status(500).json({
        error: 'Failed to get file',
        message: error.message,
      });
    }
  }

  /**
   * Get file URL
   * GET /api/v1/media/:fileId/url
   */
  async getFileUrl(req: Request, res: Response) {
    try {
      const { fileId } = req.params;
      const expiresIn = parseInt(req.query.expiresIn as string) || 3600;

      const url = await this.mediaFilesService.getFileUrl(fileId, expiresIn);

      res.json({
        data: {
          url,
          expiresIn,
        },
      });
    } catch (error: any) {
      console.error('Get URL error:', error);
      res.status(500).json({
        error: 'Failed to generate file URL',
        message: error.message,
      });
    }
  }

  /**
   * Get files for an entity
   * GET /api/v1/media/entity/:entityType/:entityId
   */
  async getEntityFiles(req: Request, res: Response) {
    try {
      const { entityType, entityId } = req.params;
      const fileType = req.query.fileType as any;

      const files = await this.mediaFilesService.getEntityFiles(
        entityType as any,
        entityId,
        fileType
      );

      res.json({
        data: files,
        count: files.length,
      });
    } catch (error: any) {
      console.error('Get entity files error:', error);
      res.status(500).json({
        error: 'Failed to get entity files',
        message: error.message,
      });
    }
  }

  /**
   * Delete file
   * DELETE /api/v1/media/:fileId
   */
  async deleteFile(req: Request, res: Response) {
    try {
      const { fileId } = req.params;

      // Get user ID from auth middleware
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in to delete files',
        });
      }

      await this.mediaFilesService.deleteFile(fileId, userId);

      res.json({
        message: 'File deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete file error:', error);

      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({
          error: 'Forbidden',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Failed to delete file',
        message: error.message,
      });
    }
  }
}

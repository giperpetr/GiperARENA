// MediaFiles Service - Business logic for file operations with MinIO/Supabase Storage
import { supabaseAdmin } from '../config/supabase';
import redis from '../config/redis';
import { v4 as uuidv4 } from 'uuid';

export interface MediaFileMetadata {
  id?: string;
  file_type: 'avatar' | 'video' | 'replay' | 'document' | 'image' | 'thumbnail' | 'banner';
  entity_type: 'user' | 'arena' | 'session' | 'tournament' | 'device';
  entity_id: string;
  bucket?: string;
  path: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  width?: number;
  height?: number;
  duration_seconds?: number;
  processing_status?: 'pending' | 'processing' | 'completed' | 'failed';
  thumbnail_path?: string;
  metadata?: any;
  uploaded_by: string;
}

export interface UploadOptions {
  file_type: MediaFileMetadata['file_type'];
  entity_type: MediaFileMetadata['entity_type'];
  entity_id: string;
  uploaded_by: string;
  metadata?: any;
}

export class MediaFilesService {
  private readonly bucket = 'giperarena';
  private readonly maxFileSize = 52428800; // 50MB (as set in bucket config)

  /**
   * Upload file to Supabase Storage and create metadata record
   */
  async uploadFile(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
    options: UploadOptions
  ): Promise<MediaFileMetadata> {
    // Validate file size
    if (fileBuffer.length > this.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Generate unique file path
    const fileExt = filename.split('.').pop();
    const uniqueFilename = `${uuidv4()}.${fileExt}`;
    const filePath = this.generateFilePath(options.entity_type, options.entity_id, options.file_type, uniqueFilename);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(this.bucket)
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Get file size from buffer
    const sizeBytes = fileBuffer.length;

    // Create metadata record in database
    const mediaFile: MediaFileMetadata = {
      file_type: options.file_type,
      entity_type: options.entity_type,
      entity_id: options.entity_id,
      bucket: this.bucket,
      path: filePath,
      filename: filename,
      mime_type: mimeType,
      size_bytes: sizeBytes,
      processing_status: 'completed',
      metadata: options.metadata || {},
      uploaded_by: options.uploaded_by,
    };

    const { data, error } = await supabaseAdmin
      .from('media_files')
      .insert(mediaFile)
      .select()
      .single();

    if (error) {
      // If metadata creation fails, delete the uploaded file
      await this.deleteFileFromStorage(filePath);
      throw new Error(`Failed to create file metadata: ${error.message}`);
    }

    // Invalidate cache for entity
    await this.invalidateEntityCache(options.entity_type, options.entity_id);

    return data;
  }

  /**
   * Get file metadata by ID
   */
  async getFileById(fileId: string): Promise<MediaFileMetadata | null> {
    const cacheKey = `media_file:${fileId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const { data, error } = await supabaseAdmin
      .from('media_files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    // Cache for 1 hour
    if (data) {
      await redis.setex(cacheKey, 3600, JSON.stringify(data));
    }

    return data;
  }

  /**
   * Get public URL for a file
   */
  async getFileUrl(fileId: string, expiresIn: number = 3600): Promise<string> {
    const fileMetadata = await this.getFileById(fileId);

    if (!fileMetadata) {
      throw new Error('File not found');
    }

    // Create signed URL (expires in 1 hour by default)
    const { data, error } = await supabaseAdmin.storage
      .from(this.bucket)
      .createSignedUrl(fileMetadata.path, expiresIn);

    if (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  /**
   * Get all files for an entity
   */
  async getEntityFiles(
    entityType: MediaFileMetadata['entity_type'],
    entityId: string,
    fileType?: MediaFileMetadata['file_type']
  ): Promise<MediaFileMetadata[]> {
    const cacheKey = `entity_files:${entityType}:${entityId}:${fileType || 'all'}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    let query = supabaseAdmin
      .from('media_files')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (fileType) {
      query = query.eq('file_type', fileType);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Cache for 5 minutes
    if (data) {
      await redis.setex(cacheKey, 300, JSON.stringify(data));
    }

    return data || [];
  }

  /**
   * Delete file and its metadata
   */
  async deleteFile(fileId: string, userId: string): Promise<boolean> {
    const fileMetadata = await this.getFileById(fileId);

    if (!fileMetadata) {
      throw new Error('File not found');
    }

    // Check if user owns the file
    if (fileMetadata.uploaded_by !== userId) {
      throw new Error('Unauthorized: You can only delete your own files');
    }

    // Delete from storage
    await this.deleteFileFromStorage(fileMetadata.path);

    // Delete metadata
    const { error } = await supabaseAdmin
      .from('media_files')
      .delete()
      .eq('id', fileId);

    if (error) {
      throw new Error(`Failed to delete file metadata: ${error.message}`);
    }

    // Invalidate caches
    await redis.del(`media_file:${fileId}`);
    await this.invalidateEntityCache(fileMetadata.entity_type, fileMetadata.entity_id);

    return true;
  }

  /**
   * Update file processing status
   */
  async updateProcessingStatus(
    fileId: string,
    status: MediaFileMetadata['processing_status'],
    metadata?: any
  ): Promise<MediaFileMetadata> {
    const updates: any = { processing_status: status };

    if (metadata) {
      updates.metadata = metadata;
    }

    const { data, error } = await supabaseAdmin
      .from('media_files')
      .update(updates)
      .eq('id', fileId)
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    await redis.del(`media_file:${fileId}`);

    return data;
  }

  /**
   * Generate file path based on entity type and file type
   */
  private generateFilePath(
    entityType: string,
    entityId: string,
    fileType: string,
    filename: string
  ): string {
    // Path structure: {entity_type}/{file_type}s/{entity_id}/{filename}
    // Examples:
    // - users/avatars/uuid/avatar.jpg
    // - arenas/photos/uuid/photo.jpg
    // - sessions/replays/uuid/replay.mp4
    // - tournaments/banners/uuid/banner.png

    const fileTypeFolder = fileType === 'replay' ? 'replays' : `${fileType}s`;
    return `${entityType}s/${fileTypeFolder}/${entityId}/${filename}`;
  }

  /**
   * Delete file from storage
   */
  private async deleteFileFromStorage(path: string): Promise<void> {
    const { error } = await supabaseAdmin.storage
      .from(this.bucket)
      .remove([path]);

    if (error) {
      console.error('Failed to delete file from storage:', error);
      // Don't throw - continue with metadata deletion
    }
  }

  /**
   * Invalidate cache for all files of an entity
   */
  private async invalidateEntityCache(
    entityType: string,
    entityId: string
  ): Promise<void> {
    const patterns = [
      `entity_files:${entityType}:${entityId}:*`,
    ];

    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  }
}

export default new MediaFilesService();

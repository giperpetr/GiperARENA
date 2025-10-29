/**
 * Image Service - Integration with imgproxy for optimized image delivery
 *
 * imgproxy is part of the Supabase stack (supabase-storage with imgproxy)
 * Located at: http://imgproxy:8080 (internal) or https://img.${MAIN_DOMAIN} (external)
 */

export type ImageFormat = 'webp' | 'avif' | 'jpeg' | 'png';
export type ImageFit = 'fill' | 'fit' | 'crop' | 'auto';
export type ImageGravity = 'center' | 'north' | 'south' | 'east' | 'west' | 'smart';

export interface ImageOptions {
  width?: number;
  height?: number;
  format?: ImageFormat;
  quality?: number; // 1-100
  fit?: ImageFit;
  gravity?: ImageGravity;
  blur?: number; // 0-100
  sharpen?: number; // 0-10
  dpr?: number; // Device Pixel Ratio (1, 2, 3)
  background?: string; // hex color (e.g., 'ffffff')
  enlarge?: boolean; // Allow upscaling
}

export interface ResponsiveImageSet {
  src: string;
  srcSet: string;
  sizes?: string;
  width?: number;
  height?: number;
}

/**
 * Get imgproxy base URL from environment
 */
function getImgproxyBaseUrl(): string {
  // In production, imgproxy is exposed via Traefik
  const imgproxyUrl = process.env.NEXT_PUBLIC_IMGPROXY_URL || 'https://img.arenahub.space';
  return imgproxyUrl;
}

/**
 * Get Supabase Storage base URL for source images
 */
function getStorageBaseUrl(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://api.arenahub.space';
  return `${supabaseUrl}/storage/v1/object/public`;
}

/**
 * Generate imgproxy URL with processing options
 *
 * imgproxy URL format:
 * http://imgproxy/insecure/resize:fit:300:400:0/gravity:ce/plain/https://source.com/image.jpg
 *
 * @param src - Source image URL or path (can be Supabase Storage path or external URL)
 * @param options - Image processing options
 */
export function getOptimizedImageUrl(src: string, options: ImageOptions = {}): string {
  if (!src) return '';

  const {
    width,
    height,
    format = 'webp',
    quality = 85,
    fit = 'fill',
    gravity = 'smart',
    blur,
    sharpen,
    dpr = 1,
    background,
    enlarge = false,
  } = options;

  const baseUrl = getImgproxyBaseUrl();

  // If src is a relative path (e.g., "arenahub/arenas/tokyo.jpg"), prepend storage URL
  let sourceUrl = src;
  if (!src.startsWith('http://') && !src.startsWith('https://')) {
    sourceUrl = `${getStorageBaseUrl()}/${src}`;
  }

  // Build imgproxy processing options
  const processingOptions: string[] = [];

  // Resize with fit mode
  if (width || height) {
    const w = width ? Math.round(width * dpr) : 0;
    const h = height ? Math.round(height * dpr) : 0;
    const enl = enlarge ? 1 : 0;
    processingOptions.push(`resize:${fit}:${w}:${h}:${enl}`);
  }

  // Gravity for cropping
  if (gravity) {
    const gravityMap: Record<string, string> = {
      center: 'ce',
      north: 'no',
      south: 'so',
      east: 'ea',
      west: 'we',
      smart: 'sm',
    };
    processingOptions.push(`gravity:${gravityMap[gravity] || 'ce'}`);
  }

  // Quality
  if (quality) {
    processingOptions.push(`quality:${quality}`);
  }

  // Blur
  if (blur) {
    processingOptions.push(`blur:${blur}`);
  }

  // Sharpen
  if (sharpen) {
    processingOptions.push(`sharpen:${sharpen}`);
  }

  // Background color (for transparency)
  if (background) {
    processingOptions.push(`background:${background}`);
  }

  // Format
  processingOptions.push(`format:${format}`);

  // Build final URL
  // Using /insecure/ for now - in production, configure IMGPROXY_KEY and IMGPROXY_SALT for signed URLs
  const processedUrl = `${baseUrl}/insecure/${processingOptions.join('/')}/plain/${encodeURIComponent(sourceUrl)}`;

  return processedUrl;
}

/**
 * Generate responsive image srcset for different screen sizes
 *
 * @param src - Source image URL or path
 * @param baseWidth - Base width for calculations
 * @param options - Base image processing options
 */
export function getResponsiveImageSet(
  src: string,
  baseWidth: number,
  options: ImageOptions = {}
): ResponsiveImageSet {
  if (!src) {
    return { src: '', srcSet: '' };
  }

  // Generate srcset for common device sizes
  const sizes = [
    { width: Math.round(baseWidth * 0.5), descriptor: '640w' },
    { width: Math.round(baseWidth * 0.75), descriptor: '768w' },
    { width: baseWidth, descriptor: '1024w' },
    { width: Math.round(baseWidth * 1.5), descriptor: '1280w' },
    { width: Math.round(baseWidth * 2), descriptor: '1536w' },
  ];

  const srcSetEntries = sizes.map(({ width, descriptor }) => {
    const url = getOptimizedImageUrl(src, {
      ...options,
      width,
      dpr: 1, // Don't apply DPR in srcset, handled by browser
    });
    return `${url} ${descriptor}`;
  });

  // Default src (1x size)
  const defaultSrc = getOptimizedImageUrl(src, {
    ...options,
    width: baseWidth,
  });

  return {
    src: defaultSrc,
    srcSet: srcSetEntries.join(', '),
    sizes: `(max-width: 640px) 50vw, (max-width: 1024px) 75vw, ${baseWidth}px`,
    width: baseWidth,
  };
}

/**
 * Generate srcset for different DPR (Device Pixel Ratio)
 * Useful for fixed-size images that need retina support
 *
 * @param src - Source image URL or path
 * @param width - Fixed width
 * @param options - Base image processing options
 */
export function getDPRImageSet(
  src: string,
  width: number,
  options: ImageOptions = {}
): ResponsiveImageSet {
  if (!src) {
    return { src: '', srcSet: '' };
  }

  const dprs = [1, 2, 3];

  const srcSetEntries = dprs.map((dpr) => {
    const url = getOptimizedImageUrl(src, {
      ...options,
      width,
      dpr,
    });
    return `${url} ${dpr}x`;
  });

  const defaultSrc = getOptimizedImageUrl(src, {
    ...options,
    width,
    dpr: 1,
  });

  return {
    src: defaultSrc,
    srcSet: srcSetEntries.join(', '),
    width,
  };
}

/**
 * Get placeholder blur data URL for progressive loading
 * Generates a tiny 20px width blurred version for LQIP (Low Quality Image Placeholder)
 *
 * @param src - Source image URL or path
 */
export function getPlaceholderDataUrl(src: string): string {
  if (!src) return '';

  return getOptimizedImageUrl(src, {
    width: 20,
    quality: 30,
    blur: 50,
    format: 'jpeg',
  });
}

/**
 * Preload critical images for performance
 * Add <link rel="preload"> to document head
 *
 * @param src - Source image URL or path
 * @param options - Image processing options
 */
export function preloadImage(src: string, options: ImageOptions = {}): void {
  if (typeof window === 'undefined') return;

  const url = getOptimizedImageUrl(src, options);
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;

  // Add srcset if responsive
  if (options.width) {
    const { srcSet } = getResponsiveImageSet(src, options.width, options);
    link.setAttribute('imagesrcset', srcSet);
  }

  document.head.appendChild(link);
}

/**
 * Helper: Get optimized avatar URL
 *
 * @param src - Avatar source URL or path
 * @param size - Avatar size (default: 64px)
 */
export function getAvatarUrl(src: string, size: number = 64): string {
  return getOptimizedImageUrl(src, {
    width: size,
    height: size,
    fit: 'crop',
    gravity: 'smart',
    quality: 90,
    format: 'webp',
  });
}

/**
 * Helper: Get optimized thumbnail URL
 *
 * @param src - Thumbnail source URL or path
 * @param width - Thumbnail width
 * @param height - Thumbnail height
 */
export function getThumbnailUrl(src: string, width: number, height: number): string {
  return getOptimizedImageUrl(src, {
    width,
    height,
    fit: 'crop',
    gravity: 'smart',
    quality: 85,
    format: 'webp',
  });
}

/**
 * Helper: Get optimized hero/banner URL
 *
 * @param src - Hero image source URL or path
 * @param width - Hero width (default: 1920px)
 */
export function getHeroImageUrl(src: string, width: number = 1920): string {
  return getOptimizedImageUrl(src, {
    width,
    fit: 'fill',
    gravity: 'center',
    quality: 90,
    format: 'webp',
  });
}

'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  getOptimizedImageUrl,
  getResponsiveImageSet,
  getDPRImageSet,
  getPlaceholderDataUrl,
  type ImageOptions,
} from '@/lib/image-service';

export interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'srcSet' | 'placeholder' | 'blurDataURL'> {
  /**
   * Source image path (relative to Supabase Storage) or full URL
   * Example: "arenahub/arenas/tokyo.jpg" or "https://example.com/image.jpg"
   */
  src: string;

  /**
   * Alt text for accessibility (required)
   */
  alt: string;

  /**
   * Image width (required for responsive images)
   */
  width: number;

  /**
   * Image height (required for responsive images)
   */
  height: number;

  /**
   * Enable responsive srcset generation (default: true)
   * Generates multiple sizes for different viewports
   */
  responsive?: boolean;

  /**
   * Enable DPR (Device Pixel Ratio) srcset (default: false)
   * Generates 1x, 2x, 3x versions for retina displays
   * Use for fixed-size images (avatars, icons)
   */
  useDPR?: boolean;

  /**
   * Image processing options (quality, format, fit, etc.)
   */
  imageOptions?: ImageOptions;

  /**
   * Enable blur placeholder (LQIP - Low Quality Image Placeholder)
   * Shows blurred version while loading (default: true)
   */
  blurPlaceholder?: boolean;

  /**
   * Loading strategy
   * - 'lazy': Load when near viewport (default)
   * - 'eager': Load immediately
   * - 'priority': Preload for LCP (Largest Contentful Paint)
   */
  loading?: 'lazy' | 'eager';

  /**
   * Priority flag for critical images (hero, above-the-fold)
   * Alias for loading="eager" + fetchPriority="high"
   */
  priority?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Container CSS classes (wraps image)
   */
  containerClassName?: string;

  /**
   * Show loading skeleton while image loads
   */
  showSkeleton?: boolean;

  /**
   * Callback when image loads successfully
   */
  onLoad?: () => void;

  /**
   * Callback when image fails to load
   */
  onError?: () => void;
}

/**
 * OptimizedImage Component
 *
 * A wrapper around Next.js Image that integrates with imgproxy for:
 * - Automatic format conversion (WebP/AVIF)
 * - Responsive image generation
 * - Blur placeholder (LQIP)
 * - Retina display support
 * - Lazy loading with skeleton
 *
 * @example
 * // Basic usage
 * <OptimizedImage
 *   src="arenahub/arenas/tokyo.jpg"
 *   alt="Tokyo Arena"
 *   width={800}
 *   height={600}
 * />
 *
 * @example
 * // Avatar with DPR
 * <OptimizedImage
 *   src="arenahub/avatars/user123.jpg"
 *   alt="User Avatar"
 *   width={64}
 *   height={64}
 *   useDPR
 *   imageOptions={{ fit: 'crop', gravity: 'smart' }}
 * />
 *
 * @example
 * // Hero image with priority loading
 * <OptimizedImage
 *   src="arenahub/heroes/banner.jpg"
 *   alt="Hero Banner"
 *   width={1920}
 *   height={1080}
 *   priority
 *   imageOptions={{ quality: 95 }}
 * />
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  responsive = true,
  useDPR = false,
  imageOptions = {},
  blurPlaceholder = true,
  loading = 'lazy',
  priority = false,
  className,
  containerClassName,
  showSkeleton = true,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [imageSrcSet, setImageSrcSet] = useState('');
  const [blurDataURL, setBlurDataURL] = useState('');

  useEffect(() => {
    if (!src) {
      setHasError(true);
      return;
    }

    // Generate optimized URLs
    try {
      if (useDPR) {
        // Fixed-size images with DPR (1x, 2x, 3x)
        const { src: optimizedSrc, srcSet } = getDPRImageSet(src, width, imageOptions);
        setImageSrc(optimizedSrc);
        setImageSrcSet(srcSet);
      } else if (responsive) {
        // Responsive images with multiple sizes
        const { src: optimizedSrc, srcSet } = getResponsiveImageSet(src, width, imageOptions);
        setImageSrc(optimizedSrc);
        setImageSrcSet(srcSet);
      } else {
        // Single optimized image
        const optimizedSrc = getOptimizedImageUrl(src, { ...imageOptions, width, height });
        setImageSrc(optimizedSrc);
      }

      // Generate blur placeholder
      if (blurPlaceholder) {
        const placeholder = getPlaceholderDataUrl(src);
        setBlurDataURL(placeholder);
      }
    } catch (error) {
      console.error('OptimizedImage: Failed to generate image URLs', error);
      setHasError(true);
    }
  }, [src, width, height, responsive, useDPR, imageOptions, blurPlaceholder]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Error fallback
  if (hasError || !src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted/10 border border-border/20',
          containerClassName
        )}
        style={{ width, height }}
      >
        <span className="text-muted-foreground text-sm">Image not available</span>
      </div>
    );
  }

  // Loading skeleton
  const skeleton = showSkeleton && isLoading && (
    <div
      className={cn(
        'absolute inset-0 bg-gradient-to-r from-muted/20 via-muted/40 to-muted/20',
        'animate-shimmer bg-[length:200%_100%]',
        'rounded-inherit'
      )}
    />
  );

  return (
    <div className={cn('relative overflow-hidden', containerClassName)} style={{ width, height }}>
      {skeleton}

      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        priority={priority}
        placeholder={blurDataURL && blurPlaceholder ? 'blur' : 'empty'}
        blurDataURL={blurDataURL || undefined}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        {...props}
      />
    </div>
  );
}

/**
 * OptimizedAvatar - Specialized component for user avatars
 *
 * @example
 * <OptimizedAvatar
 *   src="arenahub/avatars/user123.jpg"
 *   alt="User Name"
 *   size={64}
 * />
 */
export function OptimizedAvatar({
  src,
  alt,
  size = 64,
  className,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & { size?: number }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      useDPR
      imageOptions={{
        fit: 'crop',
        gravity: 'smart',
        quality: 90,
        format: 'webp',
      }}
      className={cn('rounded-full', className)}
      {...props}
    />
  );
}

/**
 * OptimizedThumbnail - Specialized component for thumbnails
 *
 * @example
 * <OptimizedThumbnail
 *   src="arenahub/arenas/tokyo.jpg"
 *   alt="Tokyo Arena"
 *   width={320}
 *   height={180}
 * />
 */
export function OptimizedThumbnail({
  src,
  alt,
  width,
  height,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      imageOptions={{
        fit: 'crop',
        gravity: 'smart',
        quality: 85,
        format: 'webp',
      }}
      className={cn('rounded-lg', className)}
      {...props}
    />
  );
}

/**
 * OptimizedHero - Specialized component for hero/banner images
 *
 * @example
 * <OptimizedHero
 *   src="arenahub/heroes/tournament-banner.jpg"
 *   alt="Tournament Banner"
 *   width={1920}
 *   height={600}
 * />
 */
export function OptimizedHero({
  src,
  alt,
  width = 1920,
  height,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority
      imageOptions={{
        fit: 'fill',
        gravity: 'center',
        quality: 90,
        format: 'webp',
      }}
      className={cn('w-full object-cover', className)}
      {...props}
    />
  );
}

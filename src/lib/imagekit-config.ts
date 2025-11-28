import ImageKit from 'imagekit';

// Client-side ImageKit configuration (public only)
export const imagekitConfig = {
  publicKey: process.env['NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY'] || '',
  urlEndpoint: process.env['NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT'] || '',
};

// Server-side ImageKit instance (only available on server)
export const getImageKitInstance = () => {
  if (typeof window !== 'undefined') {
    throw new Error('ImageKit instance should only be created on the server side');
  }
  
  const privateKey = process.env['IMAGEKIT_PRIVATE_KEY'];
  if (!privateKey) {
    throw new Error('IMAGEKIT_PRIVATE_KEY is not configured');
  }
  
  return new ImageKit({
    publicKey: imagekitConfig.publicKey,
    privateKey: privateKey,
    urlEndpoint: imagekitConfig.urlEndpoint,
  });
};

// Validate ImageKit configuration (client-side only)
export function validateImageKitConfig(): boolean {
  return !!(imagekitConfig.publicKey && imagekitConfig.urlEndpoint);
}

// Validate server-side configuration
export function validateServerImageKitConfig(): boolean {
  return !!(imagekitConfig.publicKey && imagekitConfig.urlEndpoint && process.env['IMAGEKIT_PRIVATE_KEY']);
}

// Generate unique folder path for products
export function generateProductImagePath(productSlug: string, filename: string): string {
  const timestamp = Date.now();
  return `products/${productSlug}/${timestamp}-${filename}`;
}

// Get public URL for uploaded image
export function getImageKitUrl(filePath: string): string {
  return `${imagekitConfig.urlEndpoint}/${filePath}`;
}

/**
 * ImageKit Transformation Options
 */
export interface ImageKitTransformOptions {
  width?: number;
  height?: number;
  quality?: number; // 1-100, default 80
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'maintain_ratio' | 'at_least' | 'at_max' | 'force';
  focus?: 'auto' | 'center' | 'top' | 'left' | 'bottom' | 'right' | 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';
}

/**
 * Check if a URL is an ImageKit URL
 */
export function isImageKitUrl(url: string | undefined): boolean {
  if (!url) return false;
  // Check for ImageKit domain
  if (url.includes('ik.imagekit.io') || url.includes('imagekit.io')) {
    return true;
  }
  // Check against configured endpoint (only if endpoint is set)
  if (imagekitConfig.urlEndpoint && imagekitConfig.urlEndpoint.length > 0) {
    return url.includes(imagekitConfig.urlEndpoint);
  }
  return false;
}

/**
 * Add ImageKit transformation parameters to a URL
 * @param url - Original image URL
 * @param options - Transformation options
 * @returns URL with ImageKit transformation parameters
 */
export function getImageKitTransformUrl(url: string, options: ImageKitTransformOptions = {}): string {
  // If not an ImageKit URL, return as-is
  if (!isImageKitUrl(url)) {
    return url;
  }

  const {
    width,
    height,
    quality = 80,
    format = 'auto',
    crop = 'maintain_ratio',
    focus = 'auto',
  } = options;

  // Build transformation parameters
  const transformations: string[] = [];

  if (width) {
    transformations.push(`w-${width}`);
  }
  if (height) {
    transformations.push(`h-${height}`);
  }
  if (quality !== 80) {
    transformations.push(`q-${quality}`);
  }
  if (format !== 'auto') {
    transformations.push(`f-${format}`);
  }
  if (crop !== 'maintain_ratio') {
    transformations.push(`c-${crop}`);
  }
  if (focus !== 'auto') {
    transformations.push(`fo-${focus}`);
  }

  // If no transformations, return original URL
  if (transformations.length === 0) {
    return url;
  }

  // Add transformation parameters to URL
  // Handle URLs that already have query parameters
  const separator = url.includes('?') ? '&' : '?';
  const transformString = `tr=${transformations.join(',')}`;
  
  // Avoid duplicate transformation parameters
  if (url.includes('tr=')) {
    // If URL already has transformations, replace them
    const urlParts = url.split('?');
    const baseUrl = urlParts[0];
    const existingParams = urlParts[1] || '';
    const params = new URLSearchParams(existingParams);
    params.set('tr', transformations.join(','));
    return `${baseUrl}?${params.toString()}`;
  }
  
  return `${url}${separator}${transformString}`;
}

/**
 * Get optimized ImageKit URL for Next.js Image component
 * Automatically determines size based on width/height and adds quality
 */
export function getOptimizedImageKitUrl(
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  if (!isImageKitUrl(url)) {
    return url;
  }

  const options: ImageKitTransformOptions = {
    quality,
    format: 'auto', // Let ImageKit choose best format
    crop: 'maintain_ratio',
  };
  
  if (width !== undefined) {
    options.width = width;
  }
  if (height !== undefined) {
    options.height = height;
  }

  return getImageKitTransformUrl(url, options);
}

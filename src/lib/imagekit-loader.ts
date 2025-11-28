/**
 * Custom Next.js Image Loader for ImageKit
 * This bypasses Next.js optimization for ImageKit URLs since ImageKit handles transformations
 * 
 * For ImageKit URLs: Returns the URL as-is (transformations should already be added via getOptimizedImageKitUrl)
 * For other URLs: Uses Next.js default optimization
 */
export default function imagekitLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  // Safety check: ensure src is a valid string
  if (!src || typeof src !== 'string') {
    return src || '';
  }

  // Check if this is an ImageKit URL (already has transformation params or is ImageKit domain)
  const isImageKit = src.includes('ik.imagekit.io') || src.includes('imagekit.io');
  
  if (isImageKit) {
    // ImageKit URLs - return as-is
    // Transformations should already be added in components using getOptimizedImageKitUrl
    // This bypasses Next.js optimization, saving Vercel transformation costs
    return src;
  }

  // Check if this is a Cloudinary URL - Cloudinary already handles optimization
  const isCloudinary = src.includes('res.cloudinary.com') || src.includes('cloudinary.com');
  
  if (isCloudinary) {
    // Cloudinary URLs - return as-is (Cloudinary already optimizes images)
    // This prevents double optimization and ensures logos load correctly
    return src;
  }
  
  // For non-ImageKit URLs (placeholders, data URIs, relative paths, etc.), use Next.js default optimization
  // Skip Next.js optimization for data URIs and relative paths (they're already optimized)
  if (src.startsWith('data:') || src.startsWith('/')) {
    return src;
  }
  
  // For other external URLs, use Next.js default optimization
  const params = new URLSearchParams();
  params.set('url', src);
  params.set('w', width.toString());
  if (quality) {
    params.set('q', quality.toString());
  }
  
  return `/_next/image?${params.toString()}`;
}


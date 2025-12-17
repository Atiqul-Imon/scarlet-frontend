import { Product } from './types';

/**
 * Generate variant key from size and color (matches backend logic)
 * Format: "size_color" (e.g., "Large_Red", "Medium_", "_Blue")
 */
export function getVariantKey(size?: string, color?: string): string {
  const sizeKey = size || 'no-size';
  const colorKey = color || 'no-color';
  return `${sizeKey}_${colorKey}`;
}

/**
 * Get variant-specific images for a product
 * Returns variant images if available, otherwise falls back to main product images
 * @param product - The product object
 * @param size - Selected size (optional)
 * @param color - Selected color (optional)
 * @returns Array of image URLs for the variant, or main product images as fallback
 */
/**
 * Get all unique images from all variants (used as fallback when no main images)
 */
function getAllVariantImages(product: Product): string[] {
  if (!product.variantImages || typeof product.variantImages !== 'object') {
    return [];
  }
  
  const allImages: string[] = [];
  Object.values(product.variantImages).forEach((variantImageArray: any) => {
    if (Array.isArray(variantImageArray)) {
      variantImageArray.forEach((img: any) => {
        if (img && typeof img === 'string' && img.trim() !== '' && !allImages.includes(img)) {
          allImages.push(img);
        }
      });
    }
  });
  
  return allImages;
}

/**
 * Get images from variants matching a specific size (when only size is selected)
 */
function getVariantImagesBySize(product: Product, size: string): string[] {
  if (!product.variantImages || typeof product.variantImages !== 'object' || !size) {
    return [];
  }
  
  const matchingImages: string[] = [];
  Object.entries(product.variantImages).forEach(([key, variantImageArray]: [string, any]) => {
    // Key format: "size_color" or "size_no-color"
    if (key.startsWith(`${size}_`)) {
      if (Array.isArray(variantImageArray)) {
        variantImageArray.forEach((img: any) => {
          if (img && typeof img === 'string' && img.trim() !== '' && !matchingImages.includes(img)) {
            matchingImages.push(img);
          }
        });
      }
    }
  });
  
  return matchingImages;
}

/**
 * Get images from variants matching a specific color (when only color is selected)
 */
function getVariantImagesByColor(product: Product, color: string): string[] {
  if (!product.variantImages || typeof product.variantImages !== 'object' || !color) {
    return [];
  }
  
  const matchingImages: string[] = [];
  Object.entries(product.variantImages).forEach(([key, variantImageArray]: [string, any]) => {
    // Key format: "size_color" or "no-size_color"
    if (key.endsWith(`_${color}`)) {
      if (Array.isArray(variantImageArray)) {
        variantImageArray.forEach((img: any) => {
          if (img && typeof img === 'string' && img.trim() !== '' && !matchingImages.includes(img)) {
            matchingImages.push(img);
          }
        });
      }
    }
  });
  
  return matchingImages;
}

export function getVariantImages(product: Product, size?: string, color?: string): string[] {
  // Get main images
  const mainImages = product.images && Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : [];
  
  // Get all variant images as fallback (if no main images)
  const allVariantImages = mainImages.length === 0 ? getAllVariantImages(product) : [];
  
  // If BOTH size and color are provided, try to get exact variant-specific images
  if (product.variantImages && typeof product.variantImages === 'object' && size && color) {
    const variantKey = getVariantKey(size, color);
    const variantImages = product.variantImages[variantKey];
    
    // If variant has specific images, return them
    if (variantImages && Array.isArray(variantImages) && variantImages.length > 0) {
      return variantImages;
    }
  }
  
  // If ONLY size is provided (no color), get images from all variants with that size
  if (product.variantImages && typeof product.variantImages === 'object' && size && !color) {
    const sizeImages = getVariantImagesBySize(product, size);
    if (sizeImages.length > 0) {
      return sizeImages;
    }
  }
  
  // If ONLY color is provided (no size), get images from all variants with that color
  if (product.variantImages && typeof product.variantImages === 'object' && !size && color) {
    const colorImages = getVariantImagesByColor(product, color);
    if (colorImages.length > 0) {
      return colorImages;
    }
  }
  
  // Debug: Log when variant images not found
  if (size || color) {
    console.log('Variant images lookup:', {
      size,
      color,
      hasExactMatch: !!(size && color && product.variantImages?.[getVariantKey(size, color)]),
      hasSizeMatch: size ? getVariantImagesBySize(product, size).length > 0 : false,
      hasColorMatch: color ? getVariantImagesByColor(product, color).length > 0 : false,
      availableKeys: Object.keys(product.variantImages || {}),
      fallingBackToMain: mainImages.length > 0,
      fallingBackToAllVariants: allVariantImages.length > 0
    });
  }
  
  // Fallback priority:
  // 1. Main product images (if they exist)
  // 2. All variant images combined (if no main images)
  if (mainImages.length > 0) {
    return mainImages;
  }
  
  if (allVariantImages.length > 0) {
    return allVariantImages;
  }
  
  // Last resort: return empty array
  return [];
}

/**
 * Get a single variant image (first image from variant or main images)
 * Convenience function for cases where only one image is needed
 * @param product - The product object
 * @param size - Selected size (optional)
 * @param color - Selected color (optional)
 * @returns Single image URL, or empty string if no images available
 */
export function getVariantImage(product: Product, size?: string, color?: string): string {
  const images = getVariantImages(product, size, color);
  return images.length > 0 ? images[0] : '';
}




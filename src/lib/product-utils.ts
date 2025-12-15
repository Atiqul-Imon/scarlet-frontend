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
export function getVariantImages(product: Product, size?: string, color?: string): string[] {
  // If product has variantImages and size/color provided, try to get variant-specific images
  if (product.variantImages && (size || color)) {
    const variantKey = getVariantKey(size, color);
    const variantImages = product.variantImages[variantKey];
    
    // If variant has specific images, return them
    if (variantImages && Array.isArray(variantImages) && variantImages.length > 0) {
      return variantImages;
    }
  }
  
  // Fallback to main product images
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return product.images;
  }
  
  // Last resort: return empty array (caller should handle placeholder)
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


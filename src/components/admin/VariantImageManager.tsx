"use client";
import * as React from 'react';
import Image from 'next/image';
import { getImageKitStatus } from '@/lib/imagekit-test';
import { uploadImage } from '@/lib/image-upload';
import { fetchJsonAuth } from '@/lib/api';
import dynamic from 'next/dynamic';

const ImageSelector = dynamic(() => import('@/components/admin/ImageSelector'), {
  ssr: false,
});

interface VariantImageManagerProps {
  sizes: string[];
  colors: string[];
  variantImages: Record<string, string[]>; // Values as arrays of image URLs
  onChange: (variantImages: Record<string, string[]>) => void;
  mainImages: string[]; // Main product images for reference
}

/**
 * Helper function to generate variant key from size and color
 */
function getVariantKey(size: string, color: string): string {
  const sizeKey = size || 'no-size';
  const colorKey = color || 'no-color';
  return `${sizeKey}_${colorKey}`;
}

export default function VariantImageManager({
  sizes,
  colors,
  variantImages,
  onChange,
  mainImages
}: VariantImageManagerProps) {
  // Generate all possible combinations
  const combinations = React.useMemo(() => {
    const combos: Array<{ size: string; color: string; key: string }> = [];
    
    // If no sizes and no colors, create one "no-size_no-color" combination
    if (sizes.length === 0 && colors.length === 0) {
      combos.push({ size: '', color: '', key: getVariantKey('', '') });
    }
    // If only sizes
    else if (sizes.length > 0 && colors.length === 0) {
      sizes.forEach(size => {
        combos.push({ size, color: '', key: getVariantKey(size, '') });
      });
    }
    // If only colors
    else if (sizes.length === 0 && colors.length > 0) {
      colors.forEach(color => {
        combos.push({ size: '', color, key: getVariantKey('', color) });
      });
    }
    // If both sizes and colors
    else {
      sizes.forEach(size => {
        colors.forEach(color => {
          combos.push({ size, color, key: getVariantKey(size, color) });
        });
      });
    }
    
    return combos;
  }, [sizes, colors]);

  const handleImageUpload = async (variantKey: string, file: File) => {
    try {
      const result = await uploadImage(file);
      if (result.success && result.url) {
        // Save to media library
        try {
          await fetchJsonAuth('/media', {
            method: 'POST',
            body: JSON.stringify({
              filename: result.data?.filename || file.name,
              originalName: file.name,
              url: result.url,
              thumbnailUrl: result.data?.thumbnailUrl,
              size: file.size,
              mimeType: file.type,
              alt: file.name,
              caption: '',
              tags: [],
              category: 'product'
            })
          });
        } catch (err) {
          // Log error but don't block the upload - image is already uploaded to ImageKit
          console.error('Failed to save to media library:', err);
        }

        // Add to variant images
        const currentImages = variantImages[variantKey] || [];
        onChange({
          ...variantImages,
          [variantKey]: [...currentImages, result.url]
        });
      } else {
        console.error('Error uploading image:', result.error || 'Upload failed');
        alert(`Failed to upload image: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRemoveImage = (variantKey: string, imageIndex: number) => {
    const currentImages = variantImages[variantKey] || [];
    const newImages = currentImages.filter((_, idx) => idx !== imageIndex);
    
    if (newImages.length === 0) {
      // Remove the variant key if no images left
      const { [variantKey]: _, ...rest } = variantImages;
      onChange(rest);
    } else {
      onChange({
        ...variantImages,
        [variantKey]: newImages
      });
    }
  };

  const handleCopyFromMain = (variantKey: string) => {
    if (mainImages.length > 0) {
      onChange({
        ...variantImages,
        [variantKey]: [...mainImages]
      });
    }
  };

  if (combinations.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500">
          Add sizes or colors to enable variant-specific images.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Variant Images</h3>
          <p className="text-xs text-gray-500 mt-1">
            Upload images for specific size/color combinations. If not set, main product images will be used.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {combinations.map((combo) => {
          const variantKey = combo.key;
          const images = variantImages[variantKey] || [];
          const displayLabel = [
            combo.size && `Size: ${combo.size}`,
            combo.color && `Color: ${combo.color}`
          ].filter(Boolean).join(', ') || 'Default';

          return (
            <div key={variantKey} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">{displayLabel}</h4>
                {mainImages.length > 0 && images.length === 0 && (
                  <button
                    type="button"
                    onClick={() => handleCopyFromMain(variantKey)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Copy from main images
                  </button>
                )}
              </div>

              {/* Existing Images */}
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {images.map((imageUrl, idx) => (
                    <div key={idx} className="relative group">
                      <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={`${displayLabel} - Image ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 25vw, 20vw"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(variantKey, idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Options */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ImageSelector
                    onImageSelect={(urls) => {
                      const urlsArray = Array.isArray(urls) ? urls : [urls];
                      const validUrls = urlsArray.filter(url => url && typeof url === 'string' && url.trim() !== '');
                      
                      if (validUrls.length > 0) {
                        const currentImages = variantImages[variantKey] || [];
                        onChange({
                          ...variantImages,
                          [variantKey]: [...currentImages, ...validUrls]
                        });
                      }
                    }}
                    productSlug="variant-images"
                    buttonText="Select from Gallery"
                    multiple={true}
                  />
                  <span className="text-xs text-gray-500">or</span>
                  <label className="inline-block">
                    <span className="sr-only">Upload image for {displayLabel}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(variantKey, file);
                        }
                        // Reset input so same file can be selected again
                        e.target.value = '';
                      }}
                      className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </label>
                </div>
                {images.length === 0 && (
                  <p className="text-xs text-gray-400">
                    No images set. Main product images will be used.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}




import Image from 'next/image';
import { useState } from 'react';

interface ProductImageProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export default function ProductImage({ 
  src, 
  alt, 
  width = 200, 
  height = 200, 
  className = '',
  sizes = '200px',
  priority = false
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  if (imageError || !src) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center text-gray-400 ${className}`}
        style={{ width, height }}
      >
        <svg 
          className="w-8 h-8" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" 
            clipRule="evenodd" 
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {imageLoading && (
        <div 
          className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        onError={handleImageError}
        onLoad={handleImageLoad}
        className={`object-cover transition-opacity duration-200 ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ width, height }}
      />
    </div>
  );
}

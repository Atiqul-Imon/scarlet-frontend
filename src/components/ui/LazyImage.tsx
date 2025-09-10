"use client";
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  fallback?: string;
  className?: string;
  containerClassName?: string;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function LazyImage({
  src,
  alt,
  placeholder,
  fallback = '/placeholder-image.jpg',
  className,
  containerClassName,
  threshold = 0.1,
  rootMargin = '50px',
  onLoad,
  onError,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setImageSrc(src);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [src, threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setImageSrc(fallback);
    onError?.();
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        containerClassName
      )}
    >
      {/* Placeholder */}
      {!isLoaded && (
        <div className={cn(
          'absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center',
          className
        )}>
          {placeholder ? (
            <img
              src={placeholder}
              alt=""
              className="w-full h-full object-cover opacity-50"
            />
          ) : (
            <div className="w-8 h-8 text-gray-400">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Actual Image */}
      {isInView && imageSrc && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          {...props}
        />
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-8 h-8 mx-auto mb-2">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-xs">Failed to load</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Specialized LazyImage for product images
export function LazyProductImage({
  src,
  alt,
  className,
  ...props
}: Omit<LazyImageProps, 'placeholder' | 'fallback'>) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      className={cn('aspect-square', className)}
      placeholder="/product-placeholder.jpg"
      fallback="/product-fallback.jpg"
      {...props}
    />
  );
}

// Specialized LazyImage for hero images
export function LazyHeroImage({
  src,
  alt,
  className,
  ...props
}: Omit<LazyImageProps, 'placeholder' | 'fallback'>) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      className={cn('aspect-video', className)}
      placeholder="/hero-placeholder.jpg"
      fallback="/hero-fallback.jpg"
      threshold={0.2}
      rootMargin="100px"
      {...props}
    />
  );
}

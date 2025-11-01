
"use client";
import * as React from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  productTitle: string;
}

export default function ProductGallery({ images, productTitle }: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const [isZoomed, setIsZoomed] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [imageErrors, setImageErrors] = React.useState<Set<number>>(new Set());
  const [isMobile, setIsMobile] = React.useState(false);
  const imageRef = React.useRef<HTMLDivElement>(null);
  const touchStartRef = React.useRef<{ x: number; y: number; time: number } | null>(null);

  // Optimized placeholder images for failed loads
  const getPlaceholderImage = (index: number) => {
    const colors = ['FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FFEAA7', 'DDA0DD', '98D8C8', 'F7DC6F'];
    const color = colors[index % colors.length];
    // Simplified SVG for better performance
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg width="500" height="500" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="500" height="500" fill="#${color}20"/>
        <rect x="150" y="150" width="200" height="200" fill="#${color}40"/>
        <text x="250" y="300" font-family="Arial, sans-serif" font-size="16" fill="#${color}" text-anchor="middle">Image ${index + 1}</text>
      </svg>
    `)}`;
  };

  const getCurrentImage = () => {
    const currentImage = images[selectedImageIndex];
    if (imageErrors.has(selectedImageIndex)) {
      return getPlaceholderImage(selectedImageIndex);
    }
    return currentImage;
  };

  // Detect mobile device
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Optimized image loading
  React.useEffect(() => {
    // Reset image errors when images change
    setImageErrors(new Set());
  }, [images]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isZoomed) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };

  const handleImageClick = (e?: React.MouseEvent | React.TouchEvent) => {
    // Prevent default to avoid conflicts
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Toggle zoom
    if (isZoomed) {
      setIsZoomed(false);
    } else {
      setIsZoomed(true);
    }
  };

  // Handle touch events for mobile zoom
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Only handle single touch for tap
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (touch) {
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        };
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    // Check if we have a valid touch start
    if (!touchStartRef.current) return;
    
    // Check if touch ended (no active touches)
    if (e.touches.length > 0) {
      touchStartRef.current = null;
      return;
    }
    
    const touch = e.changedTouches[0];
    if (!touch) {
      touchStartRef.current = null;
      return;
    }
    
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    // If it's a quick tap (not a swipe), toggle zoom
    if (deltaTime < 300 && deltaX < 15 && deltaY < 15) {
      handleImageClick(e);
    }
    
    touchStartRef.current = null;
  };

  // Handle touch move - allow swiping when zoomed
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    // If two fingers, allow native pinch zoom
    if (e.touches.length === 2) {
      // Don't prevent default - allow native pinch
      return;
    }
    
    // If swiping while zoomed, update mouse position for zoom center
    if (isZoomed && e.touches.length === 1 && imageRef.current) {
      const touch = e.touches[0];
      if (touch && imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 100;
        const y = ((touch.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
      }
    }
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
    setIsZoomed(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsFullscreen(false);
      setIsZoomed(false);
    } else if (e.key === 'ArrowLeft' && images.length > 1) {
      setSelectedImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
    } else if (e.key === 'ArrowRight' && images.length > 1) {
      setSelectedImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
    }
  };

  React.useEffect(() => {
    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
    return undefined;
  }, [isFullscreen, images.length]);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
        <ImagePlaceholder />
      </div>
    );
  }

  const currentImage = images[selectedImageIndex];
  if (!currentImage) {
    return (
      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
        <ImagePlaceholder />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div 
          ref={imageRef}
          className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-zoom-in"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => !isMobile && setIsZoomed(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          onClick={isMobile ? handleImageClick : undefined}
          style={isMobile ? { touchAction: isZoomed ? 'pan-x pan-y pinch-zoom' : 'manipulation' } : undefined}
        >
          <Image
            src={getCurrentImage() || '/placeholder-product.jpg'}
            alt={`${productTitle} - Image ${selectedImageIndex + 1}`}
            fill
            className={`object-cover transition-all duration-300 ${
              isZoomed 
                ? `${isMobile ? 'scale-150' : 'scale-200'} cursor-zoom-out` 
                : 'cursor-zoom-in hover:scale-105'
            }`}
            style={isZoomed ? {
              transformOrigin: isMobile 
                ? 'center center' 
                : `${mousePosition.x}% ${mousePosition.y}%`
            } : undefined}
            onClick={!isMobile ? handleImageClick : undefined}
            onError={() => {
              setImageErrors(prev => new Set([...prev, selectedImageIndex]));
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={selectedImageIndex === 0}
            quality={85}
          />
          
          {/* Zoom Indicator */}
          {!isZoomed && (
            <div className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIcon />
            </div>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFullscreenToggle();
            }}
            className={`absolute top-4 left-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-opacity ${
              isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            aria-label="View fullscreen"
          >
            <ExpandIcon />
          </button>
          

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}

          {/* Zoom Instruction */}
          {isZoomed && (
            <div className="absolute bottom-3 left-3 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
              {isMobile ? 'Tap to exit zoom • Pinch to zoom' : 'Move mouse to zoom • Click to exit'}
            </div>
          )}
          {!isZoomed && isMobile && (
            <div className="absolute bottom-3 left-3 bg-black/70 text-white text-sm px-3 py-1 rounded-full opacity-75">
              Tap image to zoom
            </div>
          )}
        </div>

        {/* Thumbnail Images */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((image, index) => {
              if (!image) return null;
              return (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                    index === selectedImageIndex 
                      ? 'border-red-500 shadow-md' 
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                    <Image
                      src={imageErrors.has(index) ? getPlaceholderImage(index) : image}
                      alt={`${productTitle} - Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                      quality={75}
                    />
                  {index === selectedImageIndex && (
                    <div className="absolute inset-0 bg-red-500/20" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={handleFullscreenToggle}
            className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
            aria-label="Close fullscreen"
          >
            <CloseIcon />
          </button>

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 left-4 z-10 bg-white/20 text-white px-4 py-2 rounded-full">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}

          {/* Main Fullscreen Image */}
          <div className="relative w-full h-full flex items-center justify-center p-8">
            <Image
              src={getCurrentImage() || '/placeholder-product.jpg'}
              alt={`${productTitle} - Fullscreen ${selectedImageIndex + 1}`}
              width={1200}
              height={1200}
              className="max-w-full max-h-full object-contain"
              sizes="100vw"
              quality={90}
              priority
            />
          </div>

          {/* Navigation in Fullscreen */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setSelectedImageIndex(prev => 
                  prev === 0 ? images.length - 1 : prev - 1
                )}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeftIcon />
              </button>
              <button
                onClick={() => setSelectedImageIndex(prev => 
                  prev === images.length - 1 ? 0 : prev + 1
                )}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRightIcon />
              </button>
            </>
          )}

          {/* Thumbnail Navigation in Fullscreen */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4">
              {images.map((image, index) => {
                if (!image) return null;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      index === selectedImageIndex 
                        ? 'border-white shadow-lg' 
                        : 'border-white/50 hover:border-white/80'
                    }`}
                  >
                    <Image
                      src={imageErrors.has(index) ? getPlaceholderImage(index) : image}
                      alt={`${productTitle} - Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                      quality={75}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Instructions */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/80 text-sm text-center">
            Use arrow keys or click arrows to navigate • Press ESC to close
          </div>
        </div>
      )}
    </>
  );
}

function ImagePlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center text-gray-400 space-y-2">
      <svg 
        width="64" 
        height="64" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="9" cy="9" r="2"/>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
      </svg>
      <span className="text-sm">No image available</span>
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

function ZoomIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
      <line x1="11" y1="8" x2="11" y2="14"/>
      <line x1="8" y1="11" x2="14" y2="11"/>
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}
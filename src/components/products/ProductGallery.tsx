
"use client";
import * as React from 'react';

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
  const imageRef = React.useRef<HTMLDivElement>(null);

  // Generate placeholder images for failed loads
  const getPlaceholderImage = (index: number) => {
    const colors = ['FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FFEAA7', 'DDA0DD', '98D8C8', 'F7DC6F'];
    const color = colors[index % colors.length];
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="500" height="500" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="500" height="500" fill="#${color}20"/>
        <rect x="150" y="150" width="200" height="200" fill="#${color}40"/>
        <rect x="200" y="200" width="100" height="100" fill="#${color}60"/>
        <text x="250" y="350" font-family="Arial, sans-serif" font-size="16" fill="#${color}" text-anchor="middle">Product Image ${index + 1}</text>
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

  // Debug logging
  React.useEffect(() => {
    console.log('ProductGallery received images:', images);
    console.log('ProductGallery productTitle:', productTitle);
  }, [images, productTitle]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isZoomed) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };

  const handleImageClick = () => {
    if (isZoomed) {
      setIsZoomed(false);
    } else {
      setIsZoomed(true);
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
          onMouseLeave={() => setIsZoomed(false)}
        >
          <img
            src={getCurrentImage()}
            alt={`${productTitle} - Image ${selectedImageIndex + 1}`}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isZoomed 
                ? 'scale-200 cursor-zoom-out' 
                : 'cursor-zoom-in hover:scale-105'
            }`}
            style={isZoomed ? {
              transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
            } : undefined}
            onClick={handleImageClick}
            onError={(e) => {
              console.error('Image failed to load:', images[selectedImageIndex]);
              setImageErrors(prev => new Set([...prev, selectedImageIndex]));
              e.currentTarget.src = getPlaceholderImage(selectedImageIndex);
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', images[selectedImageIndex]);
            }}
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
            className="absolute top-4 left-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="View fullscreen"
          >
            <ExpandIcon />
          </button>
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(prev => 
                    prev === 0 ? images.length - 1 : prev - 1
                  );
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeftIcon />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(prev => 
                    prev === images.length - 1 ? 0 : prev + 1
                  );
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRightIcon />
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}

          {/* Zoom Instruction */}
          {isZoomed && (
            <div className="absolute bottom-3 left-3 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
              Move mouse to zoom • Click to exit
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
                    <img
                      src={imageErrors.has(index) ? getPlaceholderImage(index) : image}
                      alt={`${productTitle} - Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Thumbnail failed to load:', image);
                        setImageErrors(prev => new Set([...prev, index]));
                        e.currentTarget.src = getPlaceholderImage(index);
                      }}
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
            <img
              src={getCurrentImage()}
              alt={`${productTitle} - Fullscreen ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
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
                    <img
                      src={imageErrors.has(index) ? getPlaceholderImage(index) : image}
                      alt={`${productTitle} - Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Fullscreen thumbnail failed to load:', image);
                        setImageErrors(prev => new Set([...prev, index]));
                        e.currentTarget.src = getPlaceholderImage(index);
                      }}
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
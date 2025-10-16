"use client";
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useSwipeNavigation } from '@/hooks/useTouchGesture';

interface SwipeableProps {
  children: React.ReactNode[];
  className?: string;
  showIndicators?: boolean;
  showArrows?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onSlideChange?: (index: number) => void;
  enableSwipe?: boolean;
  enableKeyboard?: boolean;
}

export default function Swipeable({
  children,
  className,
  showIndicators = true,
  showArrows = false,
  autoPlay = false,
  autoPlayInterval = 3000,
  onSlideChange,
  enableSwipe = true,
  enableKeyboard = true,
}: SwipeableProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const { handlers } = useSwipeNavigation(children, (index) => {
    if (enableSwipe) {
      goToSlide(index);
    }
  });

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    
    setIsTransitioning(true);
    setCurrentIndex(index);
    onSlideChange?.(index);
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const nextSlide = () => {
    const nextIndex = (currentIndex + 1) % children.length;
    goToSlide(nextIndex);
  };

  const prevSlide = () => {
    const prevIndex = currentIndex === 0 ? children.length - 1 : currentIndex - 1;
    goToSlide(prevIndex);
  };

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && children.length > 1) {
      autoPlayRef.current = setInterval(nextSlide, autoPlayInterval);
    }
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [autoPlay, autoPlayInterval, currentIndex, children.length]);

  // Pause auto-play on hover/touch
  const handleMouseEnter = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (autoPlay && children.length > 1) {
      autoPlayRef.current = setInterval(nextSlide, autoPlayInterval);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isTransitioning]);

  if (children.length === 0) return null;

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Slides Container */}
      <div
        ref={containerRef}
        className="flex transition-transform duration-300 ease-in-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
        {...(enableSwipe ? handlers : {})}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className="w-full flex-shrink-0"
          >
            {child}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && children.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-200 disabled:opacity-50"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-200 disabled:opacity-50"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && children.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-200',
                index === currentIndex
                  ? 'bg-red-700 w-6'
                  : 'bg-white/60 hover:bg-white/80'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Specialized Swipeable for product images
export function SwipeableProductImages({ 
  images, 
  className 
}: { 
  images: string[]; 
  className?: string; 
}) {
  if (images.length === 0) return null;

  return (
    <Swipeable
      className={cn('aspect-square', className)}
      showIndicators={images.length > 1}
      showArrows={images.length > 1}
      enableSwipe={true}
    >
      {images.map((image, index) => (
        <div key={index} className="relative w-full h-full">
          <img
            src={image}
            alt={`Product image ${index + 1}`}
            className="w-full h-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        </div>
      ))}
    </Swipeable>
  );
}

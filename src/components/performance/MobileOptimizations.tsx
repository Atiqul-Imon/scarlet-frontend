import React, { useEffect } from 'react';
import { useTouchOptimization, useViewportOptimization } from '../../hooks/useTouchOptimization';

interface MobileOptimizationsProps {
  children: React.ReactNode;
}

export function MobileOptimizations({ children }: MobileOptimizationsProps) {
  const { isTouchDevice } = useTouchOptimization();
  const viewport = useViewportOptimization();

  useEffect(() => {
    // Optimize for mobile devices
    if (isTouchDevice) {
      // Prevent zoom on input focus
      const preventZoom = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          const viewport = document.querySelector('meta[name="viewport"]');
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
          }
        }
      };

      // Restore zoom capability when not focused on input
      const restoreZoom = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          const viewport = document.querySelector('meta[name="viewport"]');
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
          }
        }
      };

      document.addEventListener('focusin', preventZoom);
      document.addEventListener('focusout', restoreZoom);

      return () => {
        document.removeEventListener('focusin', preventZoom);
        document.removeEventListener('focusout', restoreZoom);
      };
    }
  }, [isTouchDevice]);

  useEffect(() => {
    // Add mobile-specific CSS classes
    if (viewport.isMobile) {
      document.body.classList.add('mobile-device');
    } else {
      document.body.classList.remove('mobile-device');
    }

    if (viewport.isTablet) {
      document.body.classList.add('tablet-device');
    } else {
      document.body.classList.remove('tablet-device');
    }

    if (viewport.isDesktop) {
      document.body.classList.add('desktop-device');
    } else {
      document.body.classList.remove('desktop-device');
    }
  }, [viewport]);

  return <>{children}</>;
}

// Component for lazy loading images on mobile
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({ 
  src, 
  alt, 
  className = '', 
  placeholder,
  onLoad,
  onError 
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            img.src = src;
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '50px' }
    );

    observer.observe(img);

    return () => observer.disconnect();
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  if (isError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400">Failed to load</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && placeholder && (
        <div className="absolute inset-0">
          {placeholder}
        </div>
      )}
      <img
        ref={imgRef}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
}

// Touch-friendly button component
interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  touchFeedback?: boolean;
}

export function TouchButton({ 
  children, 
  touchFeedback = true, 
  className = '', 
  ...props 
}: TouchButtonProps) {
  const [isPressed, setIsPressed] = React.useState(false);

  const handleTouchStart = () => {
    if (touchFeedback) {
      setIsPressed(true);
    }
  };

  const handleTouchEnd = () => {
    if (touchFeedback) {
      setIsPressed(false);
    }
  };

  return (
    <button
      {...props}
      className={`touch-manipulation select-none ${
        isPressed ? 'scale-95' : 'scale-100'
      } transition-transform duration-150 ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {children}
    </button>
  );
}

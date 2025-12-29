'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function ProductDetailTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Scroll to top function - defined once for reuse
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
    };

    // On initial mount, hide content immediately and show after delay
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setIsVisible(false);
      
      // Scroll to top on initial mount
      scrollToTop();
      
      // Show after content is ready
      const fadeInTimeout = setTimeout(() => {
        setIsVisible(true);
      }, 150);
      
      return () => {
        clearTimeout(fadeInTimeout);
      };
    }

    // On route change: Reset visibility and scroll to top
    setIsVisible(false);
    scrollToTop();

    // Also scroll after a brief delay to catch any late scroll restoration
    const timeoutId = setTimeout(scrollToTop, 0);
    const rafId = requestAnimationFrame(() => {
      scrollToTop();
      requestAnimationFrame(scrollToTop);
    });

    // Trigger fade-in animation after a delay to ensure content is ready
    // This prevents flicker from skeleton or unstyled content
    const fadeInTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(fadeInTimeout);
      cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
        transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
        transition: isVisible 
          ? 'opacity 0.3s ease-out, transform 0.3s ease-out' 
          : 'opacity 0s, transform 0s, visibility 0s',
        willChange: 'opacity, transform',
        // Completely hide and clip content initially to prevent flicker
        position: 'relative',
        overflow: isVisible ? 'visible' : 'hidden',
        maxHeight: isVisible ? 'none' : '100vh',
        height: isVisible ? 'auto' : '100vh',
        // Prevent interaction during transition
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      {children}
    </div>
  );
}


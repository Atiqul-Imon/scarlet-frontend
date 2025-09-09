"use client";
import React, { Suspense, lazy, ComponentType } from 'react';
import { cn } from '@/lib/utils';

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

// Default loading fallback
const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Skeleton fallback for different content types
export const SkeletonFallback = {
  Card: () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-lg aspect-square mb-4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-5 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  ),
  
  Text: () => (
    <div className="animate-pulse space-y-2">
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-4/6" />
    </div>
  ),
  
  Button: () => (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 rounded-lg w-24" />
    </div>
  ),
  
  List: () => (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-2 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  ),
};

export default function LazyComponent({
  children,
  fallback = <DefaultFallback />,
  threshold = 0.1,
  rootMargin = '50px',
  className,
}: LazyComponentProps) {
  const [isInView, setIsInView] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
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
  }, [threshold, rootMargin]);

  return (
    <div ref={containerRef} className={className}>
      {isInView ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function LazyLoadedComponent(props: P) {
    return (
      <LazyComponent fallback={fallback}>
        <Component {...props} />
      </LazyComponent>
    );
  };
}

// Lazy load a component with dynamic import
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyLoadedComponent(props: React.ComponentProps<T>) {
    return (
      <LazyComponent fallback={fallback}>
        <LazyComponent {...props} />
      </LazyComponent>
    );
  };
}

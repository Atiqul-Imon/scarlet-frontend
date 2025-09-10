"use client";
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { usePullToRefresh } from '@/hooks/useTouchGesture';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  className?: string;
  refreshText?: string;
  releaseText?: string;
  refreshingText?: string;
}

export default function PullToRefresh({
  children,
  onRefresh,
  threshold = 100,
  className,
  refreshText = "Pull to refresh",
  releaseText = "Release to refresh",
  refreshingText = "Refreshing...",
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
        setIsPulling(false);
      }, 1000);
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      currentY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (window.scrollY === 0 && !isRefreshing) {
      currentY.current = e.touches[0].clientY;
      const deltaY = currentY.current - startY.current;
      
      if (deltaY > 0) {
        e.preventDefault();
        setIsPulling(true);
        setPullDistance(Math.min(deltaY, 150));
      }
    }
  };

  const handleTouchEnd = () => {
    if (isPulling && pullDistance > threshold && !isRefreshing) {
      handleRefresh();
    } else {
      setIsPulling(false);
      setPullDistance(0);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, threshold, isRefreshing]);

  const progress = Math.min(pullDistance / threshold, 1);
  const shouldRefresh = pullDistance > threshold;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Pull to refresh indicator */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 z-10 flex items-center justify-center transition-all duration-200',
          isPulling || isRefreshing ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          transform: `translateY(${Math.min(pullDistance - 50, 0)}px)`,
          height: `${Math.max(pullDistance, 50)}px`,
        }}
      >
        <div className="flex flex-col items-center space-y-2">
          <div
            className={cn(
              'w-6 h-6 border-2 border-pink-600 rounded-full transition-all duration-200',
              isRefreshing ? 'animate-spin' : 'rotate-0'
            )}
            style={{
              borderTopColor: isRefreshing ? 'transparent' : 'currentColor',
              transform: `rotate(${progress * 180}deg)`,
            }}
          />
          
          <span className="text-sm text-gray-600 font-medium">
            {isRefreshing 
              ? refreshingText 
              : shouldRefresh 
                ? releaseText 
                : refreshText
            }
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className={cn(
          'transition-transform duration-200',
          isPulling && 'transform-gpu'
        )}
        style={{
          transform: `translateY(${isPulling ? pullDistance * 0.5 : 0}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

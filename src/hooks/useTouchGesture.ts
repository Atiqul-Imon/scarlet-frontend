"use client";
import { useCallback, useRef, useState, useEffect } from 'react';

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onPinch?: (scale: number) => void;
  threshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
}

interface TouchState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
  isDragging: boolean;
  isLongPressing: boolean;
  lastTapTime: number;
  tapCount: number;
}

export function useTouchGesture(options: TouchGestureOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    onLongPress,
    onPinch,
    threshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
  } = options;

  const [touchState, setTouchState] = useState<TouchState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    isDragging: false,
    isLongPressing: false,
    lastTapTime: 0,
    tapCount: 0,
  });

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const doubleTapTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const now = Date.now();
    
    setTouchState(prev => ({
      ...prev,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      startTime: now,
      isDragging: false,
      isLongPressing: false,
    }));

    // Start long press timer
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        setTouchState(prev => ({ ...prev, isLongPressing: true }));
        onLongPress();
      }, longPressDelay);
    }
  }, [onLongPress, longPressDelay]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchState.startX;
    const deltaY = touch.clientY - touchState.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Clear long press timer if moving
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Start dragging if moved enough
    if (distance > 10 && !touchState.isDragging) {
      setTouchState(prev => ({ ...prev, isDragging: true }));
    }

    setTouchState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
    }));
  }, [touchState.startX, touchState.startY, touchState.isDragging]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const now = Date.now();
    const deltaX = touchState.currentX - touchState.startX;
    const deltaY = touchState.currentY - touchState.startY;
    const deltaTime = now - touchState.startTime;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Clear timers
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Handle swipe gestures
    if (touchState.isDragging && distance > threshold) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    } else if (!touchState.isDragging && deltaTime < 300) {
      // Handle tap gestures
      const timeSinceLastTap = now - touchState.lastTapTime;
      
      if (timeSinceLastTap < doubleTapDelay) {
        // Double tap
        setTouchState(prev => ({ ...prev, tapCount: prev.tapCount + 1 }));
        onDoubleTap?.();
      } else {
        // Single tap
        setTouchState(prev => ({ ...prev, tapCount: 1 }));
        
        // Delay single tap to allow for double tap
        doubleTapTimer.current = setTimeout(() => {
          if (touchState.tapCount === 1) {
            onTap?.();
          }
        }, doubleTapDelay);
      }
    }

    setTouchState(prev => ({
      ...prev,
      lastTapTime: now,
      isDragging: false,
      isLongPressing: false,
    }));
  }, [touchState, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, onDoubleTap, doubleTapDelay]);

  const handleTouchCancel = useCallback(() => {
    // Clear all timers
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (doubleTapTimer.current) {
      clearTimeout(doubleTapTimer.current);
      doubleTapTimer.current = null;
    }

    setTouchState(prev => ({
      ...prev,
      isDragging: false,
      isLongPressing: false,
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      if (doubleTapTimer.current) clearTimeout(doubleTapTimer.current);
    };
  }, []);

  return {
    touchState,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
  };
}

// Hook for swipe navigation between items
export function useSwipeNavigation(items: any[], onItemChange: (index: number) => void) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { handlers } = useTouchGesture({
    onSwipeLeft: () => {
      const nextIndex = (currentIndex + 1) % items.length;
      setCurrentIndex(nextIndex);
      onItemChange(nextIndex);
    },
    onSwipeRight: () => {
      const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
      setCurrentIndex(prevIndex);
      onItemChange(prevIndex);
    },
  });

  return {
    currentIndex,
    setCurrentIndex,
    handlers,
  };
}

// Hook for pull-to-refresh
export function usePullToRefresh(onRefresh: () => void) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const { handlers } = useTouchGesture({
    onSwipeDown: () => {
      if (pullDistance > 100 && !isRefreshing) {
        setIsRefreshing(true);
        onRefresh();
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 2000);
      }
    },
  });

  const handleTouchMove = (e: TouchEvent) => {
    if (window.scrollY === 0) {
      const touch = e.touches[0];
      const deltaY = touch.clientY - touchState.startY;
      
      if (deltaY > 0) {
        setIsPulling(true);
        setPullDistance(Math.min(deltaY, 150));
      }
    }
  };

  return {
    isRefreshing,
    pullDistance,
    isPulling,
    handlers: {
      ...handlers,
      onTouchMove: handleTouchMove,
    },
  };
}

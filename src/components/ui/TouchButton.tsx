"use client";
import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  touchFeedback?: boolean;
  hapticFeedback?: boolean;
  className?: string;
}

const variants = {
  primary: 'bg-red-700 text-white hover:bg-red-800 active:bg-red-900',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800',
  outline: 'border-2 border-red-700 text-red-700 hover:bg-red-50 active:bg-red-100',
  ghost: 'text-red-700 hover:bg-red-50 active:bg-red-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
};

const sizes = {
  sm: 'px-3 py-2 text-sm min-h-[36px]',
  md: 'px-4 py-3 text-base min-h-[44px]',
  lg: 'px-6 py-4 text-lg min-h-[52px]',
  xl: 'px-8 py-5 text-xl min-h-[60px]',
};

export default function TouchButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  touchFeedback = true,
  hapticFeedback = true,
  className,
  onClick,
  ...props
}: TouchButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleTouchStart = () => {
    if (disabled || loading) return;
    
    setIsPressed(true);
    
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10); // Short vibration
    }
  };

  const handleTouchEnd = () => {
    if (disabled || loading) return;
    
    setIsPressed(false);
    
    if (touchFeedback) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 150);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(5); // Very short vibration
    }
    
    onClick?.(e);
  };

  return (
    <button
      ref={buttonRef}
      className={cn(
        'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        isPressed && 'scale-95',
        isAnimating && 'animate-pulse',
        className
      )}
      disabled={disabled || loading}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onClick={handleClick}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <span className={cn(loading && 'opacity-0')}>
        {children}
      </span>
    </button>
  );
}

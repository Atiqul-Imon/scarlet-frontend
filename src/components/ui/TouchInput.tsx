"use client";
import React, { useState, useRef, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TouchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  touchFeedback?: boolean;
  hapticFeedback?: boolean;
}

const variants = {
  default: 'border border-gray-300 focus:border-pink-500 focus:ring-pink-500',
  filled: 'bg-gray-100 border-0 focus:bg-white focus:ring-2 focus:ring-pink-500',
  outlined: 'border-2 border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-500',
};

const sizes = {
  sm: 'px-3 py-2 text-sm min-h-[36px]',
  md: 'px-4 py-3 text-base min-h-[44px]',
  lg: 'px-5 py-4 text-lg min-h-[52px]',
};

const TouchInput = forwardRef<HTMLInputElement, TouchInputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  size = 'md',
  touchFeedback = true,
  hapticFeedback = true,
  className,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setIsTouched(true);
    
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(5);
    }
    
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleTouchStart = () => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(3);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref || inputRef}
          className={cn(
            'w-full rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
            variants[variant],
            sizes[size],
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            isFocused && touchFeedback && 'scale-[1.02]',
            className
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onTouchStart={handleTouchStart}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

TouchInput.displayName = 'TouchInput';

export default TouchInput;

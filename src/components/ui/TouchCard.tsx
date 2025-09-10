"use client";
import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TouchCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  interactive?: boolean;
  touchFeedback?: boolean;
  hapticFeedback?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const variants = {
  default: 'bg-white shadow-sm hover:shadow-md',
  elevated: 'bg-white shadow-lg hover:shadow-xl',
  outlined: 'bg-white border border-gray-200 hover:border-gray-300',
  flat: 'bg-gray-50 hover:bg-gray-100',
};

export default function TouchCard({
  children,
  variant = 'default',
  interactive = true,
  touchFeedback = true,
  hapticFeedback = true,
  loading = false,
  disabled = false,
  className,
  onClick,
  ...props
}: TouchCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = () => {
    if (disabled || loading || !interactive) return;
    
    setIsPressed(true);
    
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(8); // Light vibration
    }
  };

  const handleTouchEnd = () => {
    if (disabled || loading || !interactive) return;
    
    setIsPressed(false);
    
    if (touchFeedback) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 200);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || loading || !interactive) return;
    
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(5); // Very light vibration
    }
    
    onClick?.(e);
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative rounded-lg transition-all duration-200',
        variants[variant],
        interactive && !disabled && 'cursor-pointer',
        isPressed && 'scale-95',
        isAnimating && 'animate-pulse',
        disabled && 'opacity-50 cursor-not-allowed',
        loading && 'pointer-events-none',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onClick={handleClick}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
          <div className="w-6 h-6 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <div className={cn(loading && 'opacity-50')}>
        {children}
      </div>
    </div>
  );
}

// Specialized TouchCard for products
export function TouchProductCard({
  product,
  onClick,
  className,
  ...props
}: {
  product: {
    _id: string;
    title: string;
    images: string[];
    price: { amount: number; currency: string };
    discountPercentage?: number;
  };
  onClick?: () => void;
  className?: string;
} & Omit<TouchCardProps, 'children' | 'onClick'>) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <TouchProductCard
      onClick={onClick}
      className={cn('group', className)}
      {...props}
    >
      <div className="aspect-square relative overflow-hidden rounded-t-lg">
        {product.images[0] && (
          <img
            src={product.images[0]}
            alt={product.title}
            className={cn(
              'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105',
              !imageLoaded && 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        )}
        
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        
        {product.discountPercentage && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{product.discountPercentage}%
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
          {product.title}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-pink-600">
              {product.price.currency} {product.price.amount}
            </span>
            {product.discountPercentage && (
              <span className="text-sm text-gray-500 line-through">
                {product.price.currency} {Math.round(product.price.amount / (1 - product.discountPercentage / 100))}
              </span>
            )}
          </div>
        </div>
      </div>
    </TouchProductCard>
  );
}

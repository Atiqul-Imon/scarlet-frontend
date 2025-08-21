"use client";
import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';

interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    slug: string;
    images: string[];
    price: {
      currency: string;
      amount: number;
      originalAmount?: number;
      discountPercentage?: number;
    };
    brand?: string;
    stock?: number;
    rating?: {
      average: number;
      count: number;
    };
    isFeatured?: boolean;
  };
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  onQuickView?: (productId: string) => void;
  className?: string;
}

export default function ProductCard({ 
  product, 
  onAddToCart, 
  onAddToWishlist, 
  onQuickView,
  className = "" 
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onAddToCart || isAddingToCart) return;
    
    setIsAddingToCart(true);
    try {
      await onAddToCart(product._id);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onAddToWishlist?.(product._id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product._id);
  };

  const formatPrice = (amount: number, currency: string) => {
    if (currency === 'BDT') {
      return `৳${amount.toLocaleString('en-US')}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const discountPercentage = product.price.discountPercentage;
  const hasDiscount = product.price.originalAmount && product.price.originalAmount > product.price.amount;

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  return (
    <div className={`group relative bg-white rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}>
      <Link href={`/products/${product.slug}`} className="block">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <ImagePlaceholder />
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleWishlistToggle}
              className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200"
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <HeartIcon filled={isWishlisted} />
            </button>
            {onQuickView && (
              <button
                onClick={handleQuickView}
                className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200"
                aria-label="Quick view"
              >
                <EyeIcon />
              </button>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {isOutOfStock && (
              <div className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                Out of Stock
              </div>
            )}
            {hasDiscount && discountPercentage && (
              <div className="bg-pink-500 text-white text-xs font-medium px-2 py-1 rounded">
                -{discountPercentage}%
              </div>
            )}
            {product.isFeatured && !hasDiscount && !isOutOfStock && (
              <div className="bg-purple-500 text-white text-xs font-medium px-2 py-1 rounded">
                Featured
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Brand */}
          {product.brand && (
            <p className="text-sm text-gray-500 mb-1 truncate">{product.brand}</p>
          )}
          
          {/* Title */}
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
            {product.title}
          </h3>
          
          {/* Rating */}
          {product.rating && product.rating.count > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, index) => (
                  <StarIcon 
                    key={index} 
                    filled={index < Math.floor(product.rating!.average)} 
                    half={index === Math.floor(product.rating!.average) && product.rating!.average % 1 >= 0.5}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                ({product.rating.count})
              </span>
            </div>
          )}
          
          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price.amount, product.price.currency)}
            </span>
            {hasDiscount && product.price.originalAmount && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price.originalAmount, product.price.currency)}
              </span>
            )}
          </div>
          
          {/* Stock Status */}
          {product.stock !== undefined && product.stock > 0 && product.stock <= 5 && (
            <p className="text-xs text-orange-600 mb-2">
              Only {product.stock} left in stock
            </p>
          )}
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="px-4 pb-4">
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAddingToCart}
          className="w-full"
          variant={isOutOfStock ? "secondary" : "primary"}
        >
          {isAddingToCart ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner />
              Adding...
            </div>
          ) : isOutOfStock ? (
            "Out of Stock"
          ) : (
            "Add to Cart"
          )}
        </Button>
      </div>
    </div>
  );
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill={filled ? "currentColor" : "none"} 
      stroke="currentColor" 
      strokeWidth="2"
      className={filled ? "text-pink-500" : "text-gray-600"}
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
    </svg>
  );
}

function ImagePlaceholder() {
  return (
    <svg 
      width="48" 
      height="48" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5"
      className="text-gray-400"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="9" cy="9" r="2"/>
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg 
      className="animate-spin h-4 w-4" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      className="text-gray-600"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function StarIcon({ filled = false, half = false }: { filled?: boolean; half?: boolean }) {
  if (half) {
    return (
      <svg 
        width="12" 
        height="12" 
        viewBox="0 0 24 24" 
        className="text-yellow-400"
      >
        <defs>
          <linearGradient id="half-fill">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path 
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
          fill="url(#half-fill)" 
          stroke="currentColor" 
          strokeWidth="1"
        />
      </svg>
    );
  }

  return (
    <svg 
      width="12" 
      height="12" 
      viewBox="0 0 24 24" 
      fill={filled ? "currentColor" : "none"} 
      stroke="currentColor" 
      strokeWidth="1"
      className={filled ? "text-yellow-400" : "text-gray-300"}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}

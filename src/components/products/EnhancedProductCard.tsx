"use client";
import * as React from 'react';
import Link from 'next/link';
import { useCart, useToast } from '../../lib/context';
import type { Product } from '../../lib/types';

interface EnhancedProductCardProps {
  product: Product;
  showQuickActions?: boolean;
}

export default function EnhancedProductCard({ 
  product, 
  showQuickActions = true 
}: EnhancedProductCardProps) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await addItem(product._id!, 1);
      addToast({
        type: 'success',
        title: 'Added to Cart',
        message: `${product.title} added to cart!`
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to add to cart'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement quick view modal
    console.log('Quick view:', product.title);
  };

  const handleNavigation = () => {
    setIsNavigating(true);
  };

  const formatPrice = (amount: number) => `৳${amount.toLocaleString('en-US')}`;
  
  const discountPercentage = product.price.originalAmount 
    ? Math.round(((product.price.originalAmount - product.price.amount) / product.price.originalAmount) * 100)
    : 0;

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isLowStock = product.stock !== undefined && product.stock <= 5 && product.stock > 0;

  return (
    <div
      className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug}`} onClick={handleNavigation}>
        {/* Product Image */}
        <div className="aspect-square relative overflow-hidden bg-gray-50">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
              <span className="text-4xl text-pink-300">💄</span>
            </div>
          )}
          
          {/* Navigation Loading Overlay */}
          {isNavigating && (
            <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2">
                <LoadingSpinner />
                <span className="text-sm font-medium text-gray-700">Loading...</span>
              </div>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {discountPercentage > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                -{discountPercentage}%
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Out of Stock
              </span>
            )}
            {isLowStock && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Only {product.stock} left
              </span>
            )}
          </div>

          {/* Quick Actions */}
          {showQuickActions && (
            <div className={`
              absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300
              ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}
            `}>
              <button
                onClick={handleQuickView}
                className="w-8 h-8 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center text-gray-600 hover:text-pink-600 transition-colors duration-200 shadow-sm"
                title="Quick View"
              >
                <EyeIcon />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // TODO: Add to wishlist
                }}
                className="w-8 h-8 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors duration-200 shadow-sm"
                title="Add to Wishlist"
              >
                <HeartIcon />
              </button>
            </div>
          )}

          {/* Add to Cart Button */}
          <div className={`
            absolute bottom-0 left-0 right-0 p-3 transition-all duration-300
            ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
          `}>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isLoading}
              className={`
                w-full py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200
                ${isOutOfStock 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-pink-600 hover:bg-pink-700 text-white shadow-lg'
                }
              `}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner />
                  <span className="ml-2">Adding...</span>
                </div>
              ) : isOutOfStock ? (
                'Out of Stock'
              ) : (
                'Add to Cart'
              )}
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Brand */}
          {product.brand && (
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">
              {product.brand}
            </p>
          )}
          
          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors duration-200">
            {product.title}
          </h3>
          
          {/* Rating */}
          {product.rating && (
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    filled={i < Math.floor(product.rating!.average)}
                    className="w-3 h-3"
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">
                ({product.rating.count})
              </span>
            </div>
          )}
          
          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">
              {formatPrice(product.price.amount)}
            </span>
            {product.price.originalAmount && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price.originalAmount)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

// Icon Components
function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function StarIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

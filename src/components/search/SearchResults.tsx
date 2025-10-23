"use client";
import * as React from 'react';
import Link from 'next/link';
import ProductImage from '../ui/ProductImage';
import { Product } from '../../lib/types';
import { 
  HeartIcon, 
  ShoppingCartIcon,
  StarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface SearchResultsProps {
  products: Product[];
  total: number;
  onAddToCart: (productId: string) => void;
  suggestions?: string[];
}

export default function SearchResults({ 
  products, 
  total, 
  onAddToCart, 
  suggestions 
}: SearchResultsProps) {
  const [wishlist, setWishlist] = React.useState<Set<string>>(new Set());
  
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };
  
  const formatPrice = (price: any) => {
    if (!price) return '৳0';
    return `৳${price.amount?.toLocaleString('bn-BD') || 0}`;
  };
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };
  
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-base font-medium text-gray-700">
          Showing {products.length} of {total} products
        </div>
        
        {/* View Options - Hidden on mobile for cleaner layout */}
        <div className="hidden md:flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </button>
          <button className="p-2 text-red-600 hover:text-red-700 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => {
          const isOutOfStock = product.stock === 0 || product.stock === undefined;
          const isInWishlist = wishlist.has(product._id!);
          
          return (
            <div
              key={product._id}
              className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden">
                <Link href={`/products/${product.slug}`}>
                  <ProductImage
                    src={product.images?.[0]}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </Link>
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col space-y-1">
                  {product.isBestSeller && (
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Best Seller
                    </span>
                  )}
                  {product.isNewArrival && (
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      New
                    </span>
                  )}
                  {product.price?.discountPercentage && (
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      -{product.price.discountPercentage}%
                    </span>
                  )}
                </div>
                
                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product._id!)}
                  className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors"
                >
                  {isInWishlist ? (
                    <HeartSolidIcon className="w-5 h-5 text-red-600" />
                  ) : (
                    <HeartIcon className="w-5 h-5 text-gray-600 hover:text-red-600" />
                  )}
                </button>
                
                {/* Quick View Button */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Link
                    href={`/products/${product.slug}`}
                    className="p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors"
                  >
                    <EyeIcon className="w-5 h-5 text-gray-700" />
                  </Link>
                </div>
              </div>
              
              {/* Product Info */}
              <div className="p-3 md:p-4">
                {/* Brand */}
                {product.brand && (
                  <div className="text-xs text-gray-500 mb-1">{product.brand}</div>
                )}
                
                {/* Title */}
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-red-600 transition-colors text-sm md:text-base">
                    {product.title}
                  </h3>
                </Link>
                
                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center space-x-1 mb-2">
                    <div className="flex">
                      {renderStars(product.rating.average)}
                    </div>
                    <span className="text-xs text-gray-500">
                      ({product.rating.count})
                    </span>
                  </div>
                )}
                
                {/* Price */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-base md:text-lg font-semibold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.price?.originalAmount && (
                    <span className="text-sm text-gray-500 line-through">
                      ৳{product.price.originalAmount?.toLocaleString('bn-BD') || '0'}
                    </span>
                  )}
                </div>
                
                {/* Add to Cart Button */}
                <button
                  onClick={() => onAddToCart(product._id!)}
                  disabled={isOutOfStock}
                  className={`w-full flex items-center justify-center space-x-2 py-2 px-3 md:px-4 rounded-lg font-medium transition-colors text-sm md:text-base ${
                    isOutOfStock
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  <ShoppingCartIcon className="w-4 h-4" />
                  <span>
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Load More Button */}
      {products.length < total && (
        <div className="text-center pt-6 md:pt-8">
          <button className="px-6 md:px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-base">
            Load More Products
          </button>
        </div>
      )}
      
      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="mt-6 md:mt-8 p-4 md:p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-3 text-sm md:text-base">Did you mean:</h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors font-medium"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

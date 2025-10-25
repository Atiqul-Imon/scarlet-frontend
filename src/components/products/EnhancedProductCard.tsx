"use client";
import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart, useToast } from '../../lib/context';
import type { Product } from '../../lib/types';

interface EnhancedProductCardProps {
  product: Product;
}

const EnhancedProductCard = React.memo(function EnhancedProductCard({ 
  product
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



  const handleNavigation = () => {
    setIsNavigating(true);
  };

  const formatPrice = (amount: number | undefined) => `৳${amount?.toLocaleString('en-US') || '0'}`;
  
  const discountPercentage = product.price.originalAmount 
    ? Math.round(((product.price.originalAmount - product.price.amount) / product.price.originalAmount) * 100)
    : 0;

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isLowStock = product.stock !== undefined && product.stock <= 5 && product.stock > 0;

  return (
    <div
      className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ease-out transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug}`} onClick={handleNavigation} prefetch={true}>
        {/* Product Image */}
        <div className="aspect-square relative overflow-hidden bg-gray-50">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0] || '/images/placeholder.jpg'}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300 ease-out"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              quality={80}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-purple-100">
              <span className="text-4xl text-red-300">💄</span>
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
                  : 'bg-red-700 hover:bg-red-800 text-white shadow-lg'
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
          <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-red-700 transition-colors duration-300 ease-out">
            {product.title}
          </h3>
          
          
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
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return prevProps.product._id === nextProps.product._id &&
         prevProps.product.stock === nextProps.product.stock &&
         prevProps.product.price.amount === nextProps.product.price.amount;
});

export default EnhancedProductCard;


function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

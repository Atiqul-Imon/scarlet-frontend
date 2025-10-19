"use client";
import * as React from 'react';
import ProductCard from './ProductCard';
import { Product } from '../../lib/types';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
}

const ProductGrid = React.memo(function ProductGrid({ 
  products, 
  loading = false, 
  onAddToCart, 
  onAddToWishlist 
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <EmptyIcon />
        </div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-sm sm:text-base text-gray-500 px-4">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
        />
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // Optimize re-renders
  return prevProps.products.length === nextProps.products.length &&
         prevProps.loading === nextProps.loading &&
         prevProps.products[0]?._id === nextProps.products[0]?._id;
});

export default ProductGrid;

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200" />
      
      {/* Content skeleton */}
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

function EmptyIcon() {
  return (
    <svg 
      width="32" 
      height="32" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5"
      className="text-gray-400"
    >
      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z"/>
      <path d="M8 21l8-8"/>
    </svg>
  );
}

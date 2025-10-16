"use client";
import React, { useState } from 'react';
import { SwipeableProductImages, TouchButton, TouchCard } from '../ui';
import { useSwipeNavigation } from '@/hooks/useTouchGesture';
import type { Product } from '@/lib/types';

interface MobileProductViewProps {
  product: Product;
  onAddToCart: () => void;
  onAddToWishlist: () => void;
  isInCart?: boolean;
  isInWishlist?: boolean;
  loading?: boolean;
}

export default function MobileProductView({
  product,
  onAddToCart,
  onAddToWishlist,
  isInCart = false,
  isInWishlist = false,
  loading = false,
}: MobileProductViewProps) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { currentIndex, handlers } = useSwipeNavigation(
    product.images || [],
    (index) => setSelectedVariant(index)
  );

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  return (
    <div className="lg:hidden">
      {/* Product Images */}
      <div className="sticky top-0 z-10">
        <SwipeableProductImages
          images={product.images || []}
          className="w-full"
          showIndicators={true}
          enableSwipe={true}
        />
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-4">
        {/* Title and Price */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {product.title}
          </h1>
          
          <div className="flex items-center space-x-3">
            <span className="text-3xl font-bold text-red-700">
              {product.price.currency} {product.price.amount}
            </span>
            {product.price.discountPercentage && (
              <span className="text-lg text-gray-500 line-through">
                {product.price.currency} {Math.round(product.price.amount / (1 - product.price.discountPercentage / 100))}
              </span>
            )}
            {product.price.discountPercentage && (
              <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                -{product.price.discountPercentage}%
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
            <ul className="space-y-1">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quantity Selector */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quantity</h3>
          <div className="flex items-center space-x-4">
            <TouchButton
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              -
            </TouchButton>
            
            <span className="text-lg font-semibold w-8 text-center">
              {quantity}
            </span>
            
            <TouchButton
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(1)}
            >
              +
            </TouchButton>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <TouchButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={onAddToCart}
            loading={loading}
            hapticFeedback={true}
          >
            {isInCart ? 'Added to Cart' : 'Add to Cart'}
          </TouchButton>
          
          <TouchButton
            variant="outline"
            size="lg"
            fullWidth
            onClick={onAddToWishlist}
            hapticFeedback={true}
          >
            {isInWishlist ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
          </TouchButton>
        </div>

        {/* Product Details */}
        <TouchCard variant="outlined" className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Details</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Brand:</span>
              <span className="font-medium">{product.brand || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Category:</span>
              <span className="font-medium">{product.category || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>SKU:</span>
              <span className="font-medium">{product.sku || 'N/A'}</span>
            </div>
            {product.weight && (
              <div className="flex justify-between">
                <span>Weight:</span>
                <span className="font-medium">{product.weight}</span>
              </div>
            )}
          </div>
        </TouchCard>
      </div>
    </div>
  );
}

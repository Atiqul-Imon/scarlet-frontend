"use client";
import React, { useState } from 'react';
import { TouchButton, TouchCard } from '../ui';
import { SwipeableProductImages } from '../ui';

interface MobileCartItemProps {
  item: {
    productId: string;
    product: {
      _id: string;
      title: string;
      images: string[];
      price: { amount: number; currency: string };
      discountPercentage?: number;
    };
    quantity: number;
  };
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  loading?: boolean;
}

export default function MobileCartItem({
  item,
  onUpdateQuantity,
  onRemove,
  loading = false,
}: MobileCartItemProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, item.quantity + delta);
    onUpdateQuantity(item.productId, newQuantity);
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove(item.productId);
    } finally {
      setIsRemoving(false);
    }
  };

  const totalPrice = item.product.price.amount * item.quantity;
  const originalPrice = item.product.discountPercentage 
    ? item.product.price.amount / (1 - item.product.discountPercentage / 100)
    : item.product.price.amount;

  return (
    <TouchCard
      variant="outlined"
      className="p-4 space-y-4"
      touchFeedback={true}
      hapticFeedback={true}
    >
      {/* Product Image */}
      <div className="aspect-square w-24 h-24 rounded-lg overflow-hidden">
        {item.product.images && item.product.images.length > 0 ? (
          <SwipeableProductImages
            images={item.product.images}
            className="w-full h-full"
            showIndicators={item.product.images.length > 1}
            enableSwipe={true}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-2xl">📦</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
          {item.product.title}
        </h3>
        
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg font-bold text-pink-600">
            {item.product.price.currency} {item.product.price.amount}
          </span>
          {item.product.discountPercentage && (
            <span className="text-sm text-gray-500 line-through">
              {item.product.price.currency} {Math.round(originalPrice)}
            </span>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TouchButton
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(-1)}
              disabled={item.quantity <= 1 || loading}
              hapticFeedback={true}
            >
              -
            </TouchButton>
            
            <span className="text-lg font-semibold w-8 text-center">
              {item.quantity}
            </span>
            
            <TouchButton
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(1)}
              disabled={loading}
              hapticFeedback={true}
            >
              +
            </TouchButton>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {item.product.price.currency} {totalPrice.toFixed(2)}
            </div>
            {item.quantity > 1 && (
              <div className="text-sm text-gray-500">
                {item.product.price.currency} {item.product.price.amount} each
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remove Button */}
      <div className="flex justify-end">
        <TouchButton
          variant="danger"
          size="sm"
          onClick={handleRemove}
          loading={isRemoving}
          hapticFeedback={true}
        >
          Remove
        </TouchButton>
      </div>
    </TouchCard>
  );
}

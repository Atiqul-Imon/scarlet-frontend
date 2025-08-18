"use client";
import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';

interface CartItemProps {
  item: {
    productId: string;
    title: string;
    slug: string;
    image: string;
    price: {
      currency: string;
      amount: number;
    };
    quantity: number;
    brand?: string;
    stock?: number;
  };
  onUpdateQuantity: (productId: string, quantity: number) => Promise<void>;
  onRemove: (productId: string) => Promise<void>;
  isUpdating?: boolean;
}

export default function CartItem({ 
  item, 
  onUpdateQuantity, 
  onRemove, 
  isUpdating = false 
}: CartItemProps) {
  const [localQuantity, setLocalQuantity] = React.useState(item.quantity);
  const [isRemoving, setIsRemoving] = React.useState(false);
  const updateTimeoutRef = React.useRef<NodeJS.Timeout>();

  // Update local quantity when item quantity changes
  React.useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > (item.stock || 999)) return;
    
    setLocalQuantity(newQuantity);
    
    // Debounce the API call
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      onUpdateQuantity(item.productId, newQuantity);
    }, 500);
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove(item.productId);
    } catch (error) {
      setIsRemoving(false);
      console.error('Error removing item:', error);
    }
  };

  const totalPrice = item.price.amount * localQuantity;
  const isOutOfStock = item.stock !== undefined && item.stock <= 0;
  const isLowStock = item.stock !== undefined && item.stock <= 10 && item.stock > 0;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 transition-opacity ${
      isRemoving ? 'opacity-50' : ''
    }`}>
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <Link href={`/products/${item.slug}`}>
            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                width={96}
                height={96}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              />
            </div>
          </Link>
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              {/* Brand */}
              {item.brand && (
                <p className="text-sm text-gray-500 mb-1">{item.brand}</p>
              )}
              
              {/* Title */}
              <Link 
                href={`/products/${item.slug}`}
                className="text-lg font-medium text-gray-900 hover:text-pink-600 transition-colors line-clamp-2"
              >
                {item.title}
              </Link>
              
              {/* Stock Status */}
              {isOutOfStock && (
                <p className="text-sm text-red-600 font-medium mt-1">Out of Stock</p>
              )}
              {isLowStock && (
                <p className="text-sm text-orange-600 mt-1">Only {item.stock} left in stock</p>
              )}
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="text-gray-400 hover:text-red-500 p-1 transition-colors"
              aria-label="Remove item"
            >
              {isRemoving ? <LoadingSpinner /> : <TrashIcon />}
            </button>
          </div>

          {/* Price and Quantity Controls */}
          <div className="flex items-center justify-between mt-4">
            {/* Quantity Controls */}
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-3">Qty:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => handleQuantityChange(localQuantity - 1)}
                  disabled={localQuantity <= 1 || isUpdating || isOutOfStock}
                  className="px-3 py-1 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={item.stock || 999}
                  value={localQuantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  disabled={isUpdating || isOutOfStock}
                  className="w-16 text-center border-0 focus:ring-0 py-1 disabled:bg-gray-50"
                />
                <button
                  onClick={() => handleQuantityChange(localQuantity + 1)}
                  disabled={localQuantity >= (item.stock || 999) || isUpdating || isOutOfStock}
                  className="px-3 py-1 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">
                {formatPrice(totalPrice, item.price.currency)}
              </p>
              {localQuantity > 1 && (
                <p className="text-sm text-gray-500">
                  {formatPrice(item.price.amount, item.price.currency)} each
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
      <line x1="10" y1="11" x2="10" y2="17"/>
      <line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg 
      className="animate-spin h-5 w-5" 
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

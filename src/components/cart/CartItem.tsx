"use client";
import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';

interface CartItemData {
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
}

interface CartItemProps {
  item: CartItemData;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  isUpdating?: boolean;
}

const CartItem = React.memo(function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false
}: CartItemProps) {
  const [quantity, setQuantity] = React.useState(item.quantity);
  const [isRemoving, setIsRemoving] = React.useState(false);

  // Update local quantity when prop changes
  React.useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  const formatPrice = (amount: number, currency: string) => {
    if (currency === 'BDT') {
      return `৳${amount.toLocaleString('en-US')}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 99) return;
    if (newQuantity === quantity) return;
    
    setQuantity(newQuantity);
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

  const isOutOfStock = item.stock !== undefined && item.stock <= 0;
  const isLowStock = item.stock !== undefined && item.stock > 0 && item.stock <= 5;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 transition-all duration-200 hover:shadow-md">
      {/* Mobile Layout */}
      <div className="block sm:hidden">
        {/* Header with image and remove button */}
        <div className="flex gap-3 mb-3">
          <Link href={`/products/${item.slug}`}>
            <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-200"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImagePlaceholder />
                </div>
              )}
            </div>
          </Link>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0 pr-2">
                <Link 
                  href={`/products/${item.slug}`}
                  className="block hover:text-red-700 transition-colors"
                >
                  <h3 className="text-base font-medium text-gray-900 line-clamp-2 leading-tight">
                    {item.title}
                  </h3>
                </Link>
                {item.brand && (
                  <p className="text-xs text-gray-500 mt-1">{item.brand}</p>
                )}
              </div>
              
              {/* Remove Button */}
              <button
                onClick={handleRemove}
                disabled={isRemoving}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                aria-label="Remove item"
              >
                {isRemoving ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <TrashIcon />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stock Status */}
        {(isOutOfStock || isLowStock) && (
          <div className="mb-3">
            {isOutOfStock ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Out of Stock
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Only {item.stock} left
              </span>
            )}
          </div>
        )}

        {/* Price and Quantity - Stacked on mobile */}
        <div className="space-y-3">
          {/* Price */}
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {formatPrice(item.price.amount * quantity, item.price.currency)}
            </div>
            <div className="text-sm text-gray-500">
              {formatPrice(item.price.amount, item.price.currency)} each
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isUpdating || isOutOfStock}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Decrease quantity"
              >
                <MinusIcon />
              </button>
              
              <input
                type="number"
                min="1"
                max="99"
                value={quantity}
                onChange={(e) => {
                  const newQty = parseInt(e.target.value) || 1;
                  handleQuantityChange(newQty);
                }}
                disabled={isUpdating || isOutOfStock}
                className="w-12 text-center border-0 focus:ring-0 text-sm font-medium disabled:opacity-50"
              />
              
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= 99 || isUpdating || isOutOfStock || (item.stock && quantity >= item.stock)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Increase quantity"
              >
                <PlusIcon />
              </button>
            </div>

            {isUpdating && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <LoadingSpinner size="sm" />
                <span>Updating...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex gap-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <Link href={`/products/${item.slug}`}>
            <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-200"
                  sizes="96px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImagePlaceholder />
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <Link 
                href={`/products/${item.slug}`}
                className="block hover:text-red-700 transition-colors"
              >
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {item.title}
                </h3>
              </Link>
              {item.brand && (
                <p className="text-sm text-gray-500 mt-1">{item.brand}</p>
              )}
            </div>
            
            {/* Remove Button */}
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="ml-4 text-gray-400 hover:text-red-500 transition-colors p-1"
              aria-label="Remove item"
            >
              {isRemoving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <TrashIcon />
              )}
            </button>
          </div>

          {/* Stock Status */}
          {isOutOfStock && (
            <div className="mb-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Out of Stock
              </span>
            </div>
          )}
          {isLowStock && !isOutOfStock && (
            <div className="mb-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Only {item.stock} left
              </span>
            </div>
          )}

          {/* Price and Quantity Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              {/* Quantity Controls */}
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || isUpdating || isOutOfStock}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Decrease quantity"
                >
                  <MinusIcon />
                </button>
                
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={quantity}
                  onChange={(e) => {
                    const newQty = parseInt(e.target.value) || 1;
                    handleQuantityChange(newQty);
                  }}
                  disabled={isUpdating || isOutOfStock}
                  className="w-12 text-center border-0 focus:ring-0 text-sm font-medium disabled:opacity-50"
                />
                
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 99 || isUpdating || isOutOfStock || (item.stock && quantity >= item.stock)}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <PlusIcon />
                </button>
              </div>

              {isUpdating && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <LoadingSpinner size="sm" />
                  <span>Updating...</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {formatPrice(item.price.amount * quantity, item.price.currency)}
              </div>
              <div className="text-sm text-gray-500">
                {formatPrice(item.price.amount, item.price.currency)} each
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Optimize re-renders by comparing relevant props
  return prevProps.item.productId === nextProps.item.productId &&
         prevProps.item.quantity === nextProps.item.quantity &&
         prevProps.item.price.amount === nextProps.item.price.amount &&
         prevProps.isUpdating === nextProps.isUpdating;
});

export default CartItem;

function ImagePlaceholder() {
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
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="9" cy="9" r="2"/>
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <polyline points="3,6 5,6 21,6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      <line x1="10" y1="11" x2="10" y2="17"/>
      <line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg 
      width="12" 
      height="12" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg 
      width="12" 
      height="12" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  
  return (
    <svg 
      className={`animate-spin ${sizeClass}`} 
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
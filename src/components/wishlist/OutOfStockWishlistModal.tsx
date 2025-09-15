"use client";
import * as React from 'react';
import { Button } from '../ui/button';
import { useToast } from '../../lib/context';
import { wishlistApi } from '../../lib/api';
import { Product } from '../../lib/types';

interface OutOfStockWishlistModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function OutOfStockWishlistModal({
  product,
  isOpen,
  onClose,
  onSuccess
}: OutOfStockWishlistModalProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [notifyWhenInStock, setNotifyWhenInStock] = React.useState(true);
  const [priority, setPriority] = React.useState<'low' | 'medium' | 'high'>('medium');
  const [customerNotes, setCustomerNotes] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const wishlistData: {
        notifyWhenInStock?: boolean;
        customerNotes?: string;
        priority?: 'low' | 'medium' | 'high';
      } = {
        notifyWhenInStock,
        priority
      };
      
      if (customerNotes.trim()) {
        wishlistData.customerNotes = customerNotes.trim();
      }
      
      await wishlistApi.addToWishlist(product._id!, wishlistData);
      
      addToast({
        type: 'success',
        title: 'Added to Wishlist',
        message: `We'll notify you when ${product.title} is back in stock!`
      });
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to add to wishlist'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <HeartIcon className="w-5 h-5 text-red-600" />
              </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Add to Wishlist</h2>
              <p className="text-sm text-gray-600">Get notified when back in stock</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-gray-400 text-xs text-center">
                  No Image
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
                {product.title}
              </h3>
              {product.brand && (
                <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
              )}
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-900">
                  ৳{product.price.amount.toLocaleString()}
                </span>
                {product.price.originalAmount && (
                  <span className="text-sm text-gray-500 line-through">
                    ৳{product.price.originalAmount.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <AlertCircleIcon className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600 font-medium">Out of Stock</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Notification Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="notifyWhenInStock"
                checked={notifyWhenInStock}
                onChange={(e) => setNotifyWhenInStock(e.target.checked)}
                className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              />
              <label htmlFor="notifyWhenInStock" className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <BellIcon className="w-4 h-4" />
                Notify me when this item is back in stock
              </label>
            </div>
            
            {notifyWhenInStock && (
              <div className="ml-7 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  We'll send you an email and SMS notification as soon as this product is restocked.
                </p>
              </div>
            )}
          </div>

          {/* Priority Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-900">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700' },
                { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
                { value: 'high', label: 'High', color: 'bg-red-100 text-red-700' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPriority(option.value as 'low' | 'medium' | 'high')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    priority === option.value
                      ? option.color
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Higher priority items are processed first by our team
            </p>
          </div>

          {/* Customer Notes */}
          <div className="space-y-2">
            <label htmlFor="customerNotes" className="block text-sm font-medium text-gray-900">
              Additional Notes (Optional)
            </label>
            <textarea
              id="customerNotes"
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="Any specific requirements or questions about this product?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              {customerNotes.length}/500 characters
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-800 mb-2">Why add to wishlist?</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li className="flex items-center gap-2">
                <StarIcon className="w-3 h-3" />
                Get notified immediately when restocked
              </li>
              <li className="flex items-center gap-2">
                <MessageSquareIcon className="w-3 h-3" />
                Help us understand demand for this product
              </li>
              <li className="flex items-center gap-2">
                <HeartIcon className="w-3 h-3" />
                Save for later without losing interest
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-pink-600 hover:bg-pink-700"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <HeartIcon className="w-4 h-4" />
                  Add to Wishlist
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Icon Components
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function MessageSquareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function AlertCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  );
}

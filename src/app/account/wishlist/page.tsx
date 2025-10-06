"use client";
import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart, useWishlist } from '../../../lib/context';
import AccountLayout from '../../../components/account/AccountLayout';
import { Button } from '../../../components/ui/button';
import { formatters } from '../../../lib/utils';
import { WishlistItem } from '../../../lib/types';

export default function WishlistPage(): JSX.Element {
  const { addItem } = useCart();
  const { wishlistItems, isLoading: wishlistLoading, removeFromWishlist, error: wishlistError } = useWishlist();
  const [addingToCart, setAddingToCart] = React.useState<string | null>(null);

  const handleRemoveFromWishlist = async (item: WishlistItem) => {
    try {
      await removeFromWishlist(item.productId);
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleAddToCart = async (product: any) => {
    if (product.stock === 0) return;
    
    setAddingToCart(product._id);
    try {
      await addItem(product._id, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleMoveToCart = async (item: WishlistItem) => {
    if (item.product.stock === 0) return;
    
    try {
      await handleAddToCart(item.product);
      await handleRemoveFromWishlist(item);
    } catch (error) {
      console.error('Error moving to cart:', error);
    }
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        setError(null);
        await wishlistApi.clearWishlist();
        setWishlistItems([]);
      } catch (error: any) {
        console.error('Error clearing wishlist:', error);
        setError(error.message || 'Failed to clear wishlist');
      }
    }
  };


  if (wishlistLoading) {
    return (
      <AccountLayout>
        <WishlistSkeleton />
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className="space-y-6">
        {/* Error Display */}
        {wishlistError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{wishlistError.message}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
            <p className="text-gray-600 mt-1">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
          {wishlistItems.length > 0 && (
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  wishlistItems.forEach(item => {
                    if (item.product.stock && item.product.stock > 0) {
                      handleMoveToCart(item);
                    }
                  });
                }}
              >
                Add All to Cart
              </Button>
              <Button
                variant="ghost"
                onClick={handleClearWishlist}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear Wishlist
              </Button>
            </div>
          )}
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100">
                  <Link href={`/products/${item.product.slug}`}>
                    <div className="w-full h-full flex items-center justify-center">
                      {/* Placeholder for product image */}
                      <span className="text-gray-400 text-lg">Product Image</span>
                    </div>
                  </Link>
                  
                  {/* Remove from Wishlist Button */}
                  <button
                    onClick={() => handleRemoveFromWishlist(item)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <HeartFilledIcon className="w-5 h-5 text-pink-600" />
                  </button>

                  {/* Discount Badge */}
                  {item.product.price.discountPercentage && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        -{item.product.price.discountPercentage}%
                      </span>
                    </div>
                  )}

                  {/* Stock Status */}
                  {item.product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="bg-white px-4 py-2 rounded-lg text-sm font-medium text-gray-900">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-4">
                  {/* Brand */}
                  {item.product.brand && (
                    <p className="text-sm text-gray-500 mb-1">{item.product.brand}</p>
                  )}

                  {/* Title */}
                  <Link href={`/products/${item.product.slug}`}>
                    <h3 className="font-medium text-gray-900 hover:text-pink-600 transition-colors line-clamp-2 mb-2">
                      {item.product.title}
                    </h3>
                  </Link>


                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-semibold text-gray-900">
                      {formatters.formatPrice(item.product.price.amount, item.product.price.currency)}
                    </span>
                    {item.product.price.originalAmount && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatters.formatPrice(item.product.price.originalAmount, item.product.price.currency)}
                      </span>
                    )}
                  </div>

                  {/* Stock Information */}
                  {item.product.stock !== undefined && item.product.stock > 0 && item.product.stock <= 10 && (
                    <p className="text-sm text-orange-600 mb-3">
                      Only {item.product.stock} left in stock
                    </p>
                  )}

                  {/* Added Date */}
                  <p className="text-xs text-gray-500 mb-3">
                    Added {formatters.formatRelativeTime(item.addedAt)}
                  </p>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button
                      fullWidth
                      onClick={() => handleAddToCart(item.product)}
                      disabled={item.product.stock === 0 || addingToCart === item.product._id}
                      loading={addingToCart === item.product._id}
                    >
                      {item.product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        onClick={() => handleMoveToCart(item)}
                        disabled={item.product.stock === 0}
                      >
                        Move to Cart
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromWishlist(item)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <HeartIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">
              Save items you love to your wishlist and shop them later
            </p>
            <Link href="/products">
              <Button>
                Start Shopping
              </Button>
            </Link>
          </div>
        )}

        {/* Recommendations */}
        {wishlistItems.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">You might also like</h3>
            <p className="text-gray-600">
              Based on your wishlist items, we think you might enjoy these products too.
            </p>
            <div className="mt-4">
              <Link href="/products">
                <Button variant="secondary">
                  View Recommendations
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}

function WishlistSkeleton(): JSX.Element {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded w-40 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
        </div>
      </div>

      {/* Items Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Icon Components
function HeartIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function HeartFilledIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function StarHalfIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77V2z" />
      <path d="M12 2l-3.09 6.26L2 9.27l5 4.87L5.82 21L12 17.77V2z" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

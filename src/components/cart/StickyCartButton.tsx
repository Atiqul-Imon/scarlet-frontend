'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingCartIcon, 
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useCart } from '@/lib/context';
import { useAuth } from '@/lib/context';
import { Cart, CartItem, Product } from '@/lib/types';
import { productApi } from '@/lib/api';

interface StickyCartButtonProps {
  className?: string;
}

export default function StickyCartButton({ className = '' }: StickyCartButtonProps) {
  const { cart, addItem, updateItem, removeItem, itemCount, totalPrice, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [enrichedItems, setEnrichedItems] = useState<Array<CartItem & { product?: Product }>>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-collapse after 5 seconds of inactivity
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  // Animation effect for cart count changes
  useEffect(() => {
    if (itemCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [itemCount]);

  // Fetch product data for cart items
  useEffect(() => {
    const fetchProductData = async () => {
      if (!cart?.items || cart.items.length === 0) {
        setEnrichedItems([]);
        return;
      }

      setLoadingProducts(true);
      try {
        // Fetch all products
        const allProducts = await productApi.getProducts();
        let products: Product[] = [];
        
        if (allProducts?.data && Array.isArray(allProducts.data)) {
          products = allProducts.data;
        } else if (Array.isArray(allProducts)) {
          products = allProducts;
        }

        // Enrich cart items with product data
        const enriched = cart.items.map(cartItem => {
          const product = products.find(p => p._id === cartItem.productId);
          return {
            ...cartItem,
            product
          };
        });

        setEnrichedItems(enriched);
      } catch (error) {
        console.error('Error fetching product data for cart:', error);
        // Fallback to cart items without product data
        setEnrichedItems(cart.items.map(item => ({ ...item, product: undefined })));
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProductData();
  }, [cart?.items]);

  const handleAddItem = async (productId: string, currentQuantity: number) => {
    setUpdatingItems(prev => new Set(prev).add(productId));
    try {
      await updateItem(productId, currentQuantity + 1);
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (productId: string, currentQuantity: number) => {
    setUpdatingItems(prev => new Set(prev).add(productId));
    try {
      if (currentQuantity <= 1) {
        await removeItem(productId);
      } else {
        await updateItem(productId, currentQuantity - 1);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleDeleteItem = async (productId: string) => {
    setUpdatingItems(prev => new Set(prev).add(productId));
    try {
      await removeItem(productId);
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Calculate real total price from enriched items
  const calculateTotalPrice = () => {
    return enrichedItems.reduce((total, item) => {
      const price = item.product?.price?.amount || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const realTotalPrice = calculateTotalPrice();

  if (!cart || itemCount === 0) {
    // Don't show on mobile
    if (isMobile) {
      return null;
    }
    
    return (
      <div className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-50 ${className}`}>
        <Link
          href="/cart"
          className="group relative bg-pink-600 hover:bg-pink-700 text-white px-4 py-3 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center space-x-3 min-w-[120px] border border-pink-500"
        >
          <ShoppingCartIcon className="w-5 h-5" />
          <div className="flex flex-col items-start">
            <div className="text-sm font-medium leading-tight">
              ৳0
            </div>
            <div className="text-xs opacity-90">
              0 items
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Don't show on mobile
  if (isMobile) {
    return null;
  }

  return (
    <div className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-50 ${className}`}>
      {/* Main Cart Button */}
      <div className="relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="group relative bg-pink-600 hover:bg-pink-700 text-white px-4 py-3 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center space-x-3 min-w-[120px] border border-pink-500"
        >
          <div className="relative">
            <ShoppingCartIcon className="w-5 h-5" />
            <div className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold transition-all duration-300 ${
              isAnimating ? 'animate-pulse scale-125' : ''
            }`}>
              {itemCount}
            </div>
          </div>
          <div className="flex flex-col items-start">
            <div className="text-sm font-medium leading-tight">
              {formatPrice(realTotalPrice)}
            </div>
            <div className="text-xs opacity-90">
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </div>
          </div>
        </button>

        {/* Backdrop for mobile */}
        {isExpanded && isMobile && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsExpanded(false)}
          />
        )}

        {/* Expanded Cart Panel */}
        {isExpanded && (
          <div className={`absolute ${isMobile ? 'right-0 top-full mt-2 w-screen max-w-sm z-50' : 'right-full top-0 mr-4 w-80'} bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden`}>
            {/* Header */}
            <div className="bg-pink-600 text-white p-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Shopping Cart</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-white hover:text-pink-200 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="max-h-96 overflow-y-auto">
              {loadingProducts ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600 mx-auto"></div>
                  <p className="mt-2 text-sm">Loading products...</p>
                </div>
              ) : enrichedItems.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p className="text-sm">No items in cart</p>
                </div>
              ) : (
                enrichedItems.map((item) => (
                <div key={item.productId} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingCartIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {item.product?.title || 'Product'}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {formatPrice(item.product?.price?.amount || 0)}
                      </p>
                      {item.product?.brand && (
                        <p className="text-xs text-gray-500 mt-1">
                          {item.product.brand}
                        </p>
                      )}
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => handleRemoveItem(item.productId, item.quantity)}
                          disabled={loading || updatingItems.has(item.productId)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          {updatingItems.has(item.productId) ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <MinusIcon className="w-4 h-4" />
                          )}
                        </button>
                        
                        <span className="text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => handleAddItem(item.productId, item.quantity)}
                          disabled={loading || updatingItems.has(item.productId)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                        >
                          {updatingItems.has(item.productId) ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <PlusIcon className="w-4 h-4" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteItem(item.productId)}
                          disabled={loading || updatingItems.has(item.productId)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 ml-auto"
                        >
                          {updatingItems.has(item.productId) ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <TrashIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-900">
                  Total: {formatPrice(realTotalPrice)}
                </span>
                <span className="text-sm text-gray-600">
                  {itemCount} item{itemCount !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="space-y-2">
                <Link
                  href="/cart"
                  className="block w-full bg-pink-600 hover:bg-pink-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors"
                  onClick={() => setIsExpanded(false)}
                >
                  View Cart
                </Link>
                
                <Link
                  href="/checkout"
                  className="block w-full bg-white hover:bg-gray-50 text-pink-600 border border-pink-600 text-center py-3 px-4 rounded-lg font-medium transition-colors"
                  onClick={() => setIsExpanded(false)}
                >
                  Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

export const dynamic = 'force-dynamic';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';
import { Button } from '../../components/ui/button';
import { useCart, useToast, useAuth } from '../../lib/context';
import { productApi } from '../../lib/api';
import OTPRequestModal from '../../components/auth/OTPRequestModal';
import OTPVerification from '../../components/auth/OTPVerification';
import { logger } from '../../lib/logger';
import { getVariantImage, getEffectiveStock } from '../../lib/product-utils';

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
  variantStock?: Record<string, number>;
  selectedSize?: string;
  selectedColor?: string;
}

// Removed unused Cart interface

export default function CartPage() {
  const router = useRouter();
  const { cart, updateItem, removeItem, clearCart, markCartAsAbandoned, refreshCart, sessionId } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [enrichedItems, setEnrichedItems] = React.useState<CartItemData[]>([]);
  // Initialize loading as false - only set to true when we actually need to fetch
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [removingItems, setRemovingItems] = React.useState<Set<string>>(new Set());
  const lastCartItemsCountRef = React.useRef<number>(0);
  
  // OTP verification state for guests
  const [showOTPRequest, setShowOTPRequest] = React.useState(false);
  const [showOTPVerification, setShowOTPVerification] = React.useState(false);
  const [verifiedPhone, setVerifiedPhone] = React.useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = React.useState<string | null>(null);
  const [verifiedIdentifierType, setVerifiedIdentifierType] = React.useState<'email' | 'phone' | null>(null);
  const [receivedOTP, setReceivedOTP] = React.useState<string | null>(null);

  // Debug cart state
  React.useEffect(() => {
    logger.log('Cart page mounted, cart state:', cart);
    logger.log('User state:', user);
    logger.log('LocalStorage cart:', localStorage.getItem('scarlet_guest_cart'));
    logger.log('Cart items from context:', cart?.items);
    logger.log('Cart items length:', cart?.items?.length);
  }, [cart, user]);

  // Fetch cart data and enrich with product details - only when items are added/removed, not quantity changes
  React.useEffect(() => {
    logger.log('Cart effect triggered, cart:', cart);
    logger.log('Cart items:', cart?.items);
    logger.log('Cart items length:', cart?.items?.length);
    
    const currentItemsCount = cart?.items?.length || 0;
    
    // Only refetch if the number of items changed or it's the first load
    if (currentItemsCount === lastCartItemsCountRef.current && enrichedItems.length > 0) {
      logger.log('Skipping refetch - no changes');
      return;
    }
    
    lastCartItemsCountRef.current = currentItemsCount;
    
    const fetchCartData = async () => {
      setLoading(true);
      setError(null);

      try {
        logger.log('Fetching cart data...');
        logger.log('Cart exists:', !!cart);
        logger.log('Cart items exist:', !!cart?.items);
        logger.log('Cart items is array:', Array.isArray(cart?.items));
        logger.log('Cart items length:', cart?.items?.length);
        
        // Check if cart has items - if not, show empty state immediately
        if (!cart?.items || !Array.isArray(cart.items) || cart.items.length === 0) {
          logger.log('No cart items found, setting empty array');
          setEnrichedItems([]);
          setLoading(false);
          return;
        }

        // Check if cart items already have product data populated
        const hasProductData = cart.items.every(item => item.product);
        if (hasProductData && cart.items.length > 0) {
          logger.log('Cart items already have product data, enriching from cart');
          const enrichedFromCart: CartItemData[] = cart.items.map(item => {
            const enrichedItem: CartItemData = {
              productId: item.productId,
              title: item.product?.title || 'Unknown Product',
              slug: item.product?.slug || item.productId,
              image: item.product?.images?.[0] || '/placeholder-product.jpg',
              price: item.product?.price || { currency: 'BDT', amount: 0 },
              quantity: item.quantity,
              ...(item.selectedSize && { selectedSize: item.selectedSize }),
              ...(item.selectedColor && { selectedColor: item.selectedColor })
            };
            if (item.product?.brand) {
              enrichedItem.brand = item.product.brand;
            }
            if (item.product?.stock !== undefined) {
              enrichedItem.stock = item.product.stock;
            }
            if (item.product?.variantStock) {
              enrichedItem.variantStock = item.product.variantStock;
            }
            return enrichedItem;
          });
          setEnrichedItems(enrichedFromCart);
          setLoading(false);
          return;
        }

        // Fetch all products to enrich cart items (only if not already populated)
        const allProducts = await productApi.getProducts();
        
        // Ensure we have the products data - handle different response structures
        let products: any[] = [];
        if (allProducts?.data && Array.isArray(allProducts.data)) {
          products = allProducts.data;
        } else if (Array.isArray(allProducts)) {
          // Fallback if API returns array directly
          products = allProducts;
        } else {
          logger.warn('Unexpected API response structure:', allProducts);
        }
        
        // Enrich cart items with product details from real API
        // First, deduplicate cart items by productId + size + color
        const seenItems = new Map<string, CartItemData>();
        
        for (const item of cart.items) {
          logger.log('Processing cart item:', item);
          // Create a unique key for this item combination
          const itemKey = `${item.productId}_${item.selectedSize || ''}_${item.selectedColor || ''}`;
          
          // If we've seen this combination before, merge quantities
          if (seenItems.has(itemKey)) {
            const existingItem = seenItems.get(itemKey)!;
            existingItem.quantity += item.quantity;
            logger.log('Merged duplicate item:', itemKey, 'new quantity:', existingItem.quantity);
            continue;
          }
          
          const product = products.find(p => p._id === item.productId);
          logger.log('Found product in API:', product);
          
          if (product) {
            // Get variant-specific image, fallback to main product image
            const variantImage = getVariantImage(product, item.selectedSize, item.selectedColor);
            
            // Use real product data from the API
            const enrichedItem: CartItemData = {
              productId: item.productId,
              title: product.title || 'Unknown Product',
              slug: product.slug || item.productId,
              image: variantImage || product.images?.[0] || '/placeholder-product.jpg',
              price: product.price || { currency: 'BDT', amount: 0 },
              quantity: item.quantity,
              brand: product.brand,
              stock: product.stock,
              variantStock: product.variantStock,
              selectedSize: item.selectedSize,
              selectedColor: item.selectedColor
            };
            seenItems.set(itemKey, enrichedItem);
          } else {
            // Product not found in API - try to fetch individual product
            try {
              logger.log('Product not found in list, fetching individual product:', item.productId);
              const productResponse = await fetch(`/api/proxy/catalog/products/${item.productId}`);
              if (productResponse.ok) {
                const productData = await productResponse.json();
                if (productData.success && productData.data) {
                  const individualProduct = productData.data;
                  const itemKey = `${item.productId}_${item.selectedSize || ''}_${item.selectedColor || ''}`;
                  
                  // Check if we already have this item
                  if (seenItems.has(itemKey)) {
                    const existingItem = seenItems.get(itemKey)!;
                    existingItem.quantity += item.quantity;
                    logger.log('Merged duplicate item from individual fetch:', itemKey);
                  } else {
                    const enrichedItem: CartItemData = {
                      productId: item.productId,
                      title: individualProduct.title || 'Unknown Product',
                      slug: individualProduct.slug || item.productId,
                      image: individualProduct.images?.[0] || '/placeholder-product.jpg',
                      price: individualProduct.price || { currency: 'BDT', amount: 0 },
                      quantity: item.quantity,
                      brand: individualProduct.brand,
                      stock: individualProduct.stock,
                      variantStock: individualProduct.variantStock,
                      selectedSize: item.selectedSize,
                      selectedColor: item.selectedColor
                    };
                    seenItems.set(itemKey, enrichedItem);
                  }
                } else {
                  logger.warn('Failed to fetch individual product:', item.productId);
                }
              } else {
                logger.warn('Individual product fetch failed:', item.productId, productResponse.status);
              }
            } catch (err) {
              logger.warn('Error fetching individual product:', item.productId, err);
              // Skip this item if we can't fetch it
            }
          }
        }

        // Convert map to array
        const enrichedItems = Array.from(seenItems.values());
        logger.log('Enriched items (after deduplication):', enrichedItems);
        logger.log('Enriched items length:', enrichedItems.length);
        setEnrichedItems(enrichedItems);

      } catch (err) {
        setError('Failed to load cart. Please try again.');
        logger.error('Error fetching cart data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, [cart?.items, addToast]);

  const handleUpdateQuantity = React.useCallback(async (productId: string, quantity: number, selectedSize?: string, selectedColor?: string) => {
    if (quantity < 1) return;
    
    setIsUpdating(true);
    try {
      await updateItem(productId, quantity, selectedSize, selectedColor);
      // Don't show toast for every quantity change to avoid spam
      if (quantity === 0) {
        addToast({
          type: 'success',
          title: 'Item Removed',
          message: 'Item removed from cart'
        });
      }
    } catch (error) {
      logger.error('Error updating quantity:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update cart'
      });
    } finally {
      setIsUpdating(false);
    }
  }, [updateItem, addToast]);

  const handleRemoveItem = React.useCallback(async (productId: string, selectedSize?: string, selectedColor?: string) => {
    // Prevent multiple clicks on the same item
    if (removingItems.has(productId)) return;
    
    setRemovingItems(prev => new Set(prev).add(productId));
    try {
      await removeItem(productId, selectedSize, selectedColor);
      addToast({
        type: 'success',
        title: 'Item Removed',
        message: 'Item removed from cart'
      });
    } catch (error) {
      logger.error('Error removing item:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove item'
      });
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  }, [removeItem, addToast, removingItems]);

  const handleClearCart = React.useCallback(async () => {
    try {
      await clearCart();
      addToast({
        type: 'success',
        title: 'Cart Cleared',
        message: 'Cart cleared successfully'
      });
    } catch (error) {
      logger.error('Error clearing cart:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to clear cart'
      });
    }
  }, [clearCart, addToast]);

  const handleCheckout = () => {
    // Require OTP verification for guest checkout
    if (!user) {
      setShowOTPRequest(true);
      return;
    }
    
    // For logged-in users, proceed directly to checkout
    router.push('/checkout');
  };

  // OTP handlers - now supports email or phone
  const handleOTPSent = (identifier: string, type: 'email' | 'phone') => {
    if (type === 'phone') {
      setVerifiedPhone(identifier);
      setVerifiedEmail(null);
      sessionStorage.setItem('scarlet_verified_guest_phone', identifier);
      sessionStorage.removeItem('scarlet_verified_guest_email');
    } else {
      setVerifiedEmail(identifier);
      setVerifiedPhone(null);
      sessionStorage.setItem('scarlet_verified_guest_email', identifier);
      sessionStorage.removeItem('scarlet_verified_guest_phone');
    }
    setVerifiedIdentifierType(type);
    setReceivedOTP(null);
    setShowOTPRequest(false);
    setShowOTPVerification(true);
  };

  const handleOTPVerified = (identifier: string) => {
    setShowOTPVerification(false);
    // Proceed to checkout with verified identifier as URL parameter
    if (verifiedIdentifierType === 'phone') {
      router.push(`/checkout?verifiedPhone=${encodeURIComponent(identifier)}`);
    } else {
      router.push(`/checkout?verifiedEmail=${encodeURIComponent(identifier)}`);
    }
  };

  const handleOTPCancel = () => {
    setShowOTPRequest(false);
    setShowOTPVerification(false);
    setVerifiedPhone(null);
    setVerifiedEmail(null);
    setVerifiedIdentifierType(null);
    setReceivedOTP(null);
    // Clear verified identifiers from sessionStorage
    sessionStorage.removeItem('scarlet_verified_guest_phone');
    sessionStorage.removeItem('scarlet_verified_guest_email');
  };

  // Mobile-specific cart refresh mechanism
  React.useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Refresh cart when page becomes visible on mobile
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          logger.log('Page became visible, refreshing cart...');
          refreshCart();
        }
      };

      // Refresh cart when page loads on mobile
      const handlePageLoad = () => {
        logger.log('Page loaded on mobile, refreshing cart...');
        refreshCart();
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('load', handlePageLoad);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('load', handlePageLoad);
      };
    }
    
    // Return undefined for non-mobile devices
    return undefined;
  }, [refreshCart]);

  // Track cart abandonment when user leaves the page
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      if (enrichedItems.length > 0) {
        markCartAsAbandoned();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && enrichedItems.length > 0) {
        markCartAsAbandoned();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enrichedItems.length, markCartAsAbandoned]);

  // Calculate totals for Bangladesh market
  const subtotal = enrichedItems.reduce((sum, item) => sum + (item.price.amount * item.quantity), 0);
  const total = subtotal; // Shipping will be calculated at checkout based on location
  const itemCount = enrichedItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Format currency for Bangladesh
  const formatPrice = (amount: number | undefined) => `৳${amount?.toLocaleString('en-US') || '0'}`;
  
  // Check if user needs to login for checkout
  const needsAuth = !user;

  if (loading) {
    return <CartPageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <ErrorIcon />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show empty cart only if we're not loading and there are truly no items
  // Also check localStorage directly as a fallback
  const hasItemsInContext = cart?.items && cart.items.length > 0;
  const hasItemsInLocalStorage = (() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem('scarlet_guest_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.items && parsed.items.length > 0;
      }
    } catch (e) {
      logger.error('Error checking localStorage:', e);
    }
    return false;
  })();
  
  logger.log('Cart check - hasItemsInContext:', hasItemsInContext, 'hasItemsInLocalStorage:', hasItemsInLocalStorage, 'enrichedItems.length:', enrichedItems.length);
  
  if (!loading && enrichedItems.length === 0 && !hasItemsInContext && !hasItemsInLocalStorage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-rose-100">
        <div className="container-herlan py-16">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <EmptyCartIcon />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
            </p>
            <Link href="/products">
              <Button size="lg">
                Start Shopping
              </Button>
            </Link>
            
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left max-w-md mx-auto">
                <h3 className="font-bold mb-2">Debug Info:</h3>
                <p>Loading: {loading.toString()}</p>
                <p>Cart Items Length: {enrichedItems.length}</p>
                <p>Cart Exists: {cart ? 'Yes' : 'No'}</p>
                <p>Cart Items: {cart?.items?.length || 0}</p>
                <p>Raw Cart: {JSON.stringify(cart, null, 2)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-rose-100">
      <div className="container-herlan py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <div className="flex items-center gap-2">
              {/* Mobile refresh button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refreshCart()}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                title="Refresh cart"
              >
                🔄
              </Button>
              {/* Always show clear cart button (even if UI shows empty - force clear backend) */}
              <Button 
                variant="ghost" 
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-sm sm:text-base"
                size="sm"
                disabled={loading}
                title={enrichedItems.length === 0 ? "Clear any remaining items from cart" : "Clear all items from cart"}
              >
                Clear Cart
              </Button>
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {/* Responsive layout - better positioning for order summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items - 2/3 width on desktop */}
          <div className="lg:col-span-2 space-y-4">
            {enrichedItems.map((item, index) => {
              // Generate unique key that includes productId, size, and color
              const uniqueKey = `${item.productId}_${item.selectedSize || 'no-size'}_${item.selectedColor || 'no-color'}_${index}`;
              return (
                <CartItem
                  key={uniqueKey}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                  isUpdating={isUpdating || removingItems.has(item.productId)}
                />
              );
            })}

            {/* Recommended Products - Hidden on mobile to save space */}
            <div className="hidden md:block mt-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">You might also like</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <p className="text-gray-600 text-center">
                  Recommended products will appear here based on your cart items
                </p>
              </div>
            </div>
          </div>

          {/* Cart Summary - 1/3 width on desktop, full width on mobile */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <CartSummary
                subtotal={subtotal}
                shipping={0}
                total={total}
                currency="BDT"
                itemCount={itemCount}
                onCheckout={handleCheckout}
                isLoading={isUpdating}
                needsAuth={needsAuth}
                formatPrice={formatPrice}
              />
            </div>
          </div>
        </div>

      </div>
      
      {/* OTP Verification Modals */}
      <OTPRequestModal
        sessionId={sessionId}
        purpose="guest_checkout"
        onOTPSent={handleOTPSent}
        onCancel={handleOTPCancel}
        isOpen={showOTPRequest}
      />
      
      {showOTPVerification && verifiedIdentifierType && (verifiedPhone || verifiedEmail) && (
        <div className="fixed inset-0 bg-gradient-to-br from-red-100 via-purple-50 to-blue-100 bg-opacity-90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <OTPVerification
            identifier={verifiedPhone || verifiedEmail || ''}
            identifierType={verifiedIdentifierType}
            phone={verifiedPhone || undefined}
            email={verifiedEmail || undefined}
            sessionId={sessionId}
            purpose="guest_checkout"
            onVerified={handleOTPVerified}
            onCancel={handleOTPCancel}
            initialOTP={receivedOTP || undefined}
          />
        </div>
      )}
    </div>
  );
}

function CartPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-rose-100">
      <div className="container-herlan py-8">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items skeleton */}
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="flex justify-between items-center">
                        <div className="h-8 bg-gray-200 rounded w-24" />
                        <div className="h-6 bg-gray-200 rounded w-20" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-32 mb-6" />
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-20" />
                      <div className="h-4 bg-gray-200 rounded w-16" />
                    </div>
                  ))}
                </div>
                <div className="h-12 bg-gray-200 rounded mt-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCartIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 12.39A2 2 0 0 0 9.63 15H19a2 2 0 0 0 2-1.59l1.38-7.59H6"/>
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  );
}



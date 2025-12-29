'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShoppingCartIcon, 
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useCart } from '@/lib/context';
import { useAuth } from '@/lib/context';
import { CartItem, Product } from '@/lib/types';
import { productApi } from '@/lib/api';
import { getVariantImage } from '@/lib/product-utils';
import OTPRequestModal from '../auth/OTPRequestModal';
import OTPVerification from '../auth/OTPVerification';

interface StickyCartButtonProps {
  className?: string;
}

export default function StickyCartButton({ className = '' }: StickyCartButtonProps) {
  const { cart, updateItem, removeItem, itemCount, loading, sessionId } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Hide on admin pages
  const isAdminPage = pathname?.startsWith('/admin');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [enrichedItems, setEnrichedItems] = useState<Array<CartItem & { 
    product?: Product;
    title?: string;
    slug?: string;
    image?: string;
    price?: { currency: string; amount: number };
    brand?: string | undefined;
  }>>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const scrollableRef = React.useRef<HTMLDivElement>(null);
  
  // OTP verification state for guest checkout
  const [showOTPRequest, setShowOTPRequest] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [verifiedIdentifierType, setVerifiedIdentifierType] = useState<'email' | 'phone' | null>(null);

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-collapse disabled - user requested to keep cart open

  // Animation effect for cart count changes
  useEffect(() => {
    if (itemCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [itemCount]);

  // Handle wheel events to prevent page scroll while allowing cart scroll
  useEffect(() => {
    const element = scrollableRef.current;
    if (!element || !isExpanded) return;

    const handleWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const canScroll = scrollHeight > clientHeight;
      
      if (!canScroll) {
        // Content fits - prevent page scroll
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      // Content is scrollable
      const isAtTop = scrollTop <= 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
      
      // Only prevent default at boundaries to prevent page scroll
      // Otherwise let native scroll work
      if ((e.deltaY > 0 && isAtBottom) || (e.deltaY < 0 && isAtTop)) {
        // At boundary - prevent page scroll
        e.preventDefault();
        e.stopPropagation();
      } else {
        // Can scroll - just prevent page scroll, allow cart scroll
        e.stopPropagation();
      }
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, [isExpanded, enrichedItems.length]);

  // Position cart panel beside button, ensuring it stays below header and above bottom
  const panelRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isExpanded || isMobile || !panelRef.current) return;

    const adjustPosition = () => {
      const panel = panelRef.current;
      if (!panel) return;
      const buttonContainer = panel.parentElement;
      if (!buttonContainer) return;

      // Find the actual header element to get its height
      const header = document.querySelector('header, [class*="Header"], [class*="header"]');
      const headerRect = header?.getBoundingClientRect();
      const headerHeight = headerRect ? headerRect.bottom : 150;
      
      const viewportHeight = window.innerHeight;
      const bottomPadding = 20;
      const topPadding = 10;
      const minTop = headerHeight + topPadding;
      
      // Get button position
      const buttonRect = buttonContainer.getBoundingClientRect();
      const buttonTop = buttonRect.top;
      
      // Set panel max height to fit viewport
      const availableSpace = viewportHeight - minTop - bottomPadding;
      panel.style.maxHeight = `${availableSpace}px`;
      panel.style.height = 'auto';
      
      // Force layout to get accurate measurements
      void panel.offsetHeight;
      
      // Get panel's natural height
      const naturalHeight = panel.scrollHeight;
      const panelHeight = Math.min(naturalHeight, availableSpace);
      panel.style.height = `${panelHeight}px`;
      
      // Force another layout
      void panel.offsetHeight;
      const actualHeight = panel.getBoundingClientRect().height;
      
      // Position panel aligned with button (top of panel aligns with top of button)
      let panelTop = 0; // Relative to button container
      
      // Check if panel would go above header
      const panelAbsoluteTop = buttonTop + panelTop;
      if (panelAbsoluteTop < headerHeight) {
        // Adjust to stay below header
        panelTop = headerHeight - buttonTop + topPadding;
      }
      
      // Check if panel would go off bottom
      const panelAbsoluteBottom = buttonTop + panelTop + actualHeight;
      if (panelAbsoluteBottom > viewportHeight - bottomPadding) {
        // Adjust to keep bottom on screen
        panelTop = viewportHeight - bottomPadding - actualHeight - buttonTop;
        // But still ensure it's below header
        if (buttonTop + panelTop < headerHeight) {
          panelTop = headerHeight - buttonTop + topPadding;
          // If still too tall, reduce height
          if (buttonTop + panelTop + actualHeight > viewportHeight - bottomPadding) {
            const maxHeight = viewportHeight - bottomPadding - (buttonTop + panelTop);
            panel.style.height = `${maxHeight}px`;
          }
        }
      }
      
      // Apply position (relative to button container)
      panel.style.top = `${panelTop}px`;
      panel.style.transform = 'none';
      panel.style.position = 'absolute'; // Keep absolute relative to button
    };

    // Adjust immediately and on changes
    adjustPosition();
    const timeoutId = setTimeout(adjustPosition, 100);
    const resizeObserver = new ResizeObserver(adjustPosition);
    if (panelRef.current) {
      resizeObserver.observe(panelRef.current);
    }
    
    window.addEventListener('resize', adjustPosition);
    window.addEventListener('scroll', adjustPosition);
    
    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', adjustPosition);
      window.removeEventListener('scroll', adjustPosition);
    };
  }, [isExpanded, isMobile, enrichedItems.length]);

  // Fetch product data for cart items
  useEffect(() => {
    const fetchProductData = async () => {
      if (!cart?.items || cart.items.length === 0) {
        setEnrichedItems([]);
        return;
      }

      setLoadingProducts(true);
      try {
        // Fetch products by ID (more efficient than fetching all products)
        // Get unique product IDs from cart
        const productIds = [...new Set(cart.items.map(item => item.productId))];
        
        // Fetch each product individually
        const productPromises = productIds.map(async (id) => {
          try {
            const product = await productApi.getProductById(id);
            if (process.env.NODE_ENV === 'development') {
              console.log(`✅ Fetched product ${id}:`, product?.title);
            }
            return product;
          } catch (err) {
            console.error(`❌ Error fetching product ${id}:`, err);
            return null;
          }
        });
        
        const products = (await Promise.all(productPromises)).filter((p): p is Product => p !== null);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`📦 Fetched ${products.length} products for ${cart.items.length} cart items`);
        }

        // Enrich cart items with product data (similar to main cart page)
        const enriched = cart.items.map(cartItem => {
          const product = products.find(p => p._id === cartItem.productId);
          if (product) {
            // Get variant-specific image, fallback to main product image
            const variantImage = getVariantImage(product, cartItem.selectedSize, cartItem.selectedColor);
            
            const enrichedItem = {
              ...cartItem,
              product,
              title: product.title || 'Unknown Product',
              slug: product.slug || cartItem.productId,
              image: variantImage || product.images?.[0] || '/placeholder-product.jpg',
              price: product.price || { currency: 'BDT', amount: 0 },
              ...(product.brand && { brand: product.brand })
            };
            
            if (process.env.NODE_ENV === 'development') {
              console.log(`✅ Enriched item:`, {
                productId: cartItem.productId,
                title: enrichedItem.title,
                price: enrichedItem.price,
                image: enrichedItem.image,
                variant: { size: cartItem.selectedSize, color: cartItem.selectedColor }
              });
            }
            
            return enrichedItem;
          }
          // Fallback if product not found
          console.warn(`⚠️ Product ${cartItem.productId} not found, showing placeholder`);
          return {
            ...cartItem,
            title: 'Product',
            slug: cartItem.productId,
            image: '/placeholder-product.jpg',
            price: { currency: 'BDT', amount: 0 }
          };
        });

        setEnrichedItems(enriched);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`📊 Enriched items:`, enriched);
        }
      } catch (error) {
        console.error('Error fetching product data for cart:', error);
        // Fallback to cart items without product data
        setEnrichedItems(cart.items.map(item => ({ ...item })));
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProductData();
  }, [cart?.items]);

  const handleAddItem = async (productId: string, currentQuantity: number, selectedSize?: string, selectedColor?: string) => {
    const itemKey = `${productId}_${selectedSize || ''}_${selectedColor || ''}`;
    setUpdatingItems(prev => new Set(prev).add(itemKey));
    try {
      await updateItem(productId, currentQuantity + 1, selectedSize, selectedColor);
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (productId: string, currentQuantity: number, selectedSize?: string, selectedColor?: string) => {
    const itemKey = `${productId}_${selectedSize || ''}_${selectedColor || ''}`;
    setUpdatingItems(prev => new Set(prev).add(itemKey));
    try {
      if (currentQuantity <= 1) {
        await removeItem(productId, selectedSize, selectedColor);
      } else {
        await updateItem(productId, currentQuantity - 1, selectedSize, selectedColor);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const handleDeleteItem = async (productId: string, selectedSize?: string, selectedColor?: string) => {
    const itemKey = `${productId}_${selectedSize || ''}_${selectedColor || ''}`;
    setUpdatingItems(prev => new Set(prev).add(itemKey));
    try {
      await removeItem(productId, selectedSize, selectedColor);
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
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
      // Use item.price first (from enriched data), fallback to product.price
      const price = item.price?.amount || item.product?.price?.amount || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const realTotalPrice = calculateTotalPrice();

  // Handle checkout - same logic as cart page
  const handleCheckout = () => {
    // Require OTP verification for guest checkout
    if (!user) {
      setIsExpanded(false); // Close cart panel
      setShowOTPRequest(true);
      return;
    }
    
    // For logged-in users, proceed directly to checkout
    setIsExpanded(false); // Close cart panel
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
    // Clear verified identifiers from sessionStorage
    sessionStorage.removeItem('scarlet_verified_guest_phone');
    sessionStorage.removeItem('scarlet_verified_guest_email');
  };

  if (!cart || itemCount === 0) {
    // Don't show on mobile
    if (isMobile) {
      return null;
    }
    
    return (
      <div className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-50 ${className}`}>
        <Link
          href="/cart"
          className="group relative bg-red-700 hover:bg-red-800 text-white px-4 py-3 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center space-x-3 min-w-[120px] border border-red-500"
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

  // Hide on admin pages
  if (isAdminPage) {
    return null;
  }

  return (
    <div className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-50 ${className}`}>
      {/* Main Cart Button */}
      <div className="relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="group relative bg-red-700 hover:bg-red-800 text-white px-4 py-3 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center space-x-3 min-w-[120px] border border-red-500"
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
          <div 
            ref={panelRef}
            className={`absolute ${isMobile ? 'right-0 top-full mt-2 w-screen max-w-sm z-[10000]' : 'right-full mr-4 w-80 z-[10000]'} bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col`}
            style={{
              // Position relative to button - will be adjusted by adjustPosition
              top: isMobile ? 'auto' : '0',
              transform: 'none',
              // Ensure the panel fits within viewport
              maxHeight: isMobile ? 'calc(100vh - 2rem)' : 'calc(100vh - 8rem)',
              // Let it size naturally - adjustPosition will set the height
              height: 'auto',
              // Ensure proper flex layout
              display: 'flex',
              flexDirection: 'column',
              // Ensure overflow is handled by children, not parent
              overflow: 'hidden'
            }}
            onClick={(e) => {
              // Prevent clicks from closing when clicking inside the panel
              e.stopPropagation();
            }}
          >
            {/* Header */}
            <div className="bg-red-700 text-white p-4 flex items-center justify-between flex-shrink-0">
              <h3 className="font-semibold text-lg">Shopping Cart</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-white hover:text-red-200 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items - Scrollable */}
            <div 
              ref={scrollableRef}
              className="flex-1 overflow-y-auto min-h-0"
              style={{
                // Ensure smooth scrolling
                scrollBehavior: 'smooth',
                // Prevent scroll chaining - contains scroll within this element
                // This CSS property prevents page scroll when scrolling inside this container
                overscrollBehavior: 'contain',
                // Allow vertical scrolling on touch devices
                touchAction: 'pan-y',
                // Smooth scrolling on iOS
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {loadingProducts ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-700 mx-auto"></div>
                  <p className="mt-2 text-sm">Loading products...</p>
                </div>
              ) : enrichedItems.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p className="text-sm">No items in cart</p>
                </div>
              ) : (
                enrichedItems.map((item, index) => {
                  // Generate unique key that includes productId, size, and color to avoid duplicate key warnings
                  const uniqueKey = `${item.productId}_${item.selectedSize || 'no-size'}_${item.selectedColor || 'no-color'}_${index}`;
                  return (
                <div key={uniqueKey} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title || 'Product'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-product.jpg';
                          }}
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
                        {item.title || item.product?.title || 'Product'}
                      </h4>
                      
                      {/* Variant Information */}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {(item.brand || item.product?.brand) && (
                          <p className="text-xs text-gray-500">{item.brand || item.product?.brand}</p>
                        )}
                        {item.selectedSize && (
                          <span className="text-xs font-medium text-gray-700">Size: {item.selectedSize}</span>
                        )}
                        {item.selectedColor && (
                          <span className="text-xs font-medium text-gray-700 ml-2">Color: {item.selectedColor}</span>
                        )}
                      </div>
                      
                      {/* Price Information */}
                      <div className="mt-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice((item.price?.amount || item.product?.price?.amount || 0) * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-600">
                            {formatPrice(item.price?.amount || item.product?.price?.amount || 0)} each
                          </p>
                        )}
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => handleRemoveItem(item.productId, item.quantity, item.selectedSize, item.selectedColor)}
                          disabled={loading || updatingItems.has(`${item.productId}_${item.selectedSize || ''}_${item.selectedColor || ''}`)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          {updatingItems.has(`${item.productId}_${item.selectedSize || ''}_${item.selectedColor || ''}`) ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <MinusIcon className="w-4 h-4" />
                          )}
                        </button>
                        
                        <span className="text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => handleAddItem(item.productId, item.quantity, item.selectedSize, item.selectedColor)}
                          disabled={loading || updatingItems.has(`${item.productId}_${item.selectedSize || ''}_${item.selectedColor || ''}`)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                        >
                          {updatingItems.has(`${item.productId}_${item.selectedSize || ''}_${item.selectedColor || ''}`) ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <PlusIcon className="w-4 h-4" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteItem(item.productId, item.selectedSize, item.selectedColor)}
                          disabled={loading || updatingItems.has(`${item.productId}_${item.selectedSize || ''}_${item.selectedColor || ''}`)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 ml-auto"
                        >
                          {updatingItems.has(`${item.productId}_${item.selectedSize || ''}_${item.selectedColor || ''}`) ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <TrashIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                );
                })
              )}
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
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
                  className="block w-full bg-red-700 hover:bg-red-800 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors"
                  onClick={() => setIsExpanded(false)}
                >
                  View Cart
                </Link>
                
                <button
                  onClick={handleCheckout}
                  className="block w-full bg-white hover:bg-gray-50 text-red-700 border border-red-700 text-center py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* OTP Verification Modals - Render using portal to escape positioning context */}
      {typeof window !== 'undefined' && createPortal(
        <OTPRequestModal
          sessionId={sessionId || ''}
          purpose="guest_checkout"
          onOTPSent={handleOTPSent}
          onCancel={handleOTPCancel}
          isOpen={showOTPRequest}
        />,
        document.body
      )}
      
      {typeof window !== 'undefined' && showOTPVerification && verifiedIdentifierType && (verifiedPhone || verifiedEmail) && sessionId && createPortal(
        <div 
          className="fixed inset-0 bg-gradient-to-br from-red-100 via-purple-50 to-blue-100 bg-opacity-90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            // Close modal when clicking backdrop (outside the modal content)
            if (e.target === e.currentTarget) {
              handleOTPCancel();
            }
          }}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <OTPVerification
              identifier={verifiedPhone || verifiedEmail || ''}
              identifierType={verifiedIdentifierType}
              {...(verifiedPhone ? { phone: verifiedPhone } : {})}
              {...(verifiedEmail ? { email: verifiedEmail } : {})}
              sessionId={sessionId}
              purpose="guest_checkout"
              onVerified={handleOTPVerified}
              onCancel={handleOTPCancel}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}


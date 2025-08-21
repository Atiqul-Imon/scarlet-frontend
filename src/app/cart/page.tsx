"use client";
import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';
import { Button } from '../../components/ui/button';
import { useCart, useToast, useAuth } from '../../lib/context';
import { productApi } from '../../lib/api';

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

interface Cart {
  _id: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  updatedAt: string;
}

export default function CartPage() {
  const router = useRouter();
  const { cart, updateItem, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [cartItems, setCartItems] = React.useState<CartItemData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const lastCartItemsCountRef = React.useRef<number>(0);

  // Fetch cart data and enrich with product details - only when items are added/removed, not quantity changes
  React.useEffect(() => {
    const currentItemsCount = cart?.items?.length || 0;
    
    // Only refetch if the number of items changed or it's the first load
    if (currentItemsCount === lastCartItemsCountRef.current && cartItems.length > 0) {
      return;
    }
    
    lastCartItemsCountRef.current = currentItemsCount;
    
    const fetchCartData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!cart?.items || !Array.isArray(cart.items) || cart.items.length === 0) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        // Fetch all products to enrich cart items
        const allProducts = await productApi.getProducts();
        
        // Ensure we have the products data - handle different response structures
        let products: Product[] = [];
        if (allProducts?.data && Array.isArray(allProducts.data)) {
          products = allProducts.data;
        } else if (Array.isArray(allProducts)) {
          // Fallback if API returns array directly
          products = allProducts;
        } else {
          console.warn('Unexpected API response structure:', allProducts);
        }
        
        // Enrich cart items with product details
        const enrichedItems: CartItemData[] = cart.items.map(item => {
          const product = products.find(p => p._id === item.productId);
          return {
            productId: item.productId,
            title: product?.title || 'Product not found',
            slug: product?.slug || '',
            image: product?.images?.[0] || '/placeholder-product.jpg',
            price: product?.price || { currency: 'BDT', amount: 0 },
            quantity: item.quantity,
            brand: product?.brand,
            stock: product?.stock
          };
        }).filter(item => item.title !== 'Product not found'); // Remove invalid items

        setCartItems(enrichedItems);

      } catch (err) {
        setError('Failed to load cart. Please try again.');
        console.error('Error fetching cart data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, [cart, cartItems.length]);

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    
    // Optimistically update the local state first for instant UI feedback
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.productId === productId 
          ? { ...item, quantity }
          : item
      )
    );
    
    setIsUpdating(true);
    try {
      await updateItem(productId, quantity);
      addToast({
        type: 'success',
        title: 'Cart Updated',
        message: 'Cart updated successfully!'
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Revert the optimistic update on error
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.productId === productId 
            ? { ...item, quantity: cart?.items.find(cartItem => cartItem.productId === productId)?.quantity || item.quantity }
            : item
        )
      );
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update cart'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    // Store the item for potential rollback
    const itemToRemove = cartItems.find(item => item.productId === productId);
    
    // Optimistically remove the item from local state first for instant UI feedback
    setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
    
    try {
      await removeItem(productId);
      addToast({
        type: 'success',
        title: 'Item Removed',
        message: 'Item removed from cart'
      });
    } catch (error) {
      console.error('Error removing item:', error);
      // Revert the optimistic update on error
      if (itemToRemove) {
        setCartItems(prevItems => [...prevItems, itemToRemove]);
      }
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove item'
      });
    }
  };

  const handleClearCart = async () => {
    // Store current items for potential rollback
    const currentItems = [...cartItems];
    
    // Optimistically clear the cart from local state first for instant UI feedback
    setCartItems([]);
    
    try {
      await clearCart();
      addToast({
        type: 'success',
        title: 'Cart Cleared',
        message: 'Cart cleared successfully'
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Revert the optimistic update on error
      setCartItems(currentItems);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to clear cart'
      });
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  // Calculate totals for Bangladesh market
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price.amount * item.quantity), 0);
  const freeShippingThreshold = 2000; // ৳2000 for free shipping
  const shippingCost = 100; // ৳100 standard shipping
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
  const tax = 0; // No VAT on cosmetics in Bangladesh for small amounts
  const total = subtotal + shipping + tax;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Format currency for Bangladesh
  const formatPrice = (amount: number) => `৳${amount.toLocaleString('en-US')}`;
  
  // Check if user needs to login for checkout
  const needsAuth = !user;

  if (loading) {
    return <CartPageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-herlan py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <p className="text-gray-600">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          {cartItems.length > 0 && (
            <Button 
              variant="ghost" 
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear Cart
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <CartItem
                key={item.productId}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
                isUpdating={isUpdating}
              />
            ))}

            {/* Recommended Products */}
            <div className="mt-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">You might also like</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <p className="text-gray-600 text-center">
                  Recommended products will appear here based on your cart items
                </p>
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <CartSummary
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
              currency="BDT"
              itemCount={itemCount}
              onCheckout={handleCheckout}
              isLoading={isUpdating}
              freeShippingThreshold={freeShippingThreshold}
              needsAuth={needsAuth}
              formatPrice={formatPrice}
            />
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center">
              <ShippingIcon />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Free Shipping</h3>
            <p className="text-sm text-gray-600">Free shipping on orders over {formatPrice(freeShippingThreshold)}</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center">
              <ReturnIcon />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Easy Returns</h3>
            <p className="text-sm text-gray-600">7-day hassle-free returns</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center">
              <SecurityIcon />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Secure Payment</h3>
            <p className="text-sm text-gray-600">bKash, Nagad & Card accepted</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
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

function ShippingIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-600">
      <path d="M16 3h5v5"/>
      <path d="M8 3H3v5"/>
      <path d="M12 22V8"/>
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-600">
      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z"/>
    </svg>
  );
}

function SecurityIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-600">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

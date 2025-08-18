"use client";
import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';
import { Button } from '../../components/ui/button';
import { fetchJson } from '../../lib/api';

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
  const [cartItems, setCartItems] = React.useState<CartItemData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Fetch cart data
  React.useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      setError(null);

      try {
        // TODO: Replace with actual authenticated cart endpoint
        // For now, we'll simulate cart data
        const mockCartItems: CartItemData[] = [
          {
            productId: '1',
            title: 'Vitamin C Brightening Serum',
            slug: 'vitamin-c-brightening-serum',
            image: '/products/serum-1.jpg',
            price: { currency: 'USD', amount: 29.99 },
            quantity: 2,
            brand: 'Scarlet Beauty',
            stock: 15
          },
          {
            productId: '2',
            title: 'Hydrating Night Cream',
            slug: 'hydrating-night-cream',
            image: '/products/cream-1.jpg',
            price: { currency: 'USD', amount: 45.00 },
            quantity: 1,
            brand: 'Glow Labs',
            stock: 8
          }
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCartItems(mockCartItems);

        // Actual implementation would be:
        // const cart = await fetchJson<Cart>('/cart');
        // const products = await fetchJson<Product[]>('/catalog/products');
        // const enrichedItems = cart.items.map(item => {
        //   const product = products.find(p => p._id === item.productId);
        //   return {
        //     productId: item.productId,
        //     title: product?.title || '',
        //     slug: product?.slug || '',
        //     image: product?.images[0] || '',
        //     price: product?.price || { currency: 'USD', amount: 0 },
        //     quantity: item.quantity,
        //     brand: product?.brand,
        //     stock: product?.stock
        //   };
        // });
        // setCartItems(enrichedItems);

      } catch (err) {
        setError('Failed to load cart. Please try again.');
        console.error('Error fetching cart:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    setIsUpdating(true);
    try {
      // TODO: Implement actual API call
      console.log('Updating quantity:', { productId, quantity });
      
      // await fetchJson('/cart/items', {
      //   method: 'POST',
      //   body: JSON.stringify({ productId, quantity })
      // });

      // Update local state
      setCartItems(prev => 
        prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity }
            : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      // TODO: Implement actual API call
      console.log('Removing item:', productId);
      
      // await fetchJson(`/cart/items/${productId}`, {
      //   method: 'DELETE'
      // });

      // Update local state
      setCartItems(prev => prev.filter(item => item.productId !== productId));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price.amount * item.quantity), 0);
  const shipping = subtotal >= 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
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
              currency="USD"
              itemCount={itemCount}
              onCheckout={handleCheckout}
              isLoading={false}
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
            <p className="text-sm text-gray-600">Free shipping on orders over $50</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center">
              <ReturnIcon />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Easy Returns</h3>
            <p className="text-sm text-gray-600">30-day hassle-free returns</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center">
              <SecurityIcon />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Secure Payment</h3>
            <p className="text-sm text-gray-600">Your payment information is safe</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

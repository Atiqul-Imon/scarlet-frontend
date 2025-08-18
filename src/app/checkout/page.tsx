"use client";
import * as React from 'react';
import { useRouter } from 'next/navigation';
import CheckoutForm from '../../components/checkout/CheckoutForm';
import { fetchJson } from '../../lib/api';

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  shippingMethod: string;
  paymentMethod: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardName?: string;
}

interface OrderSummaryItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  brand?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [orderItems, setOrderItems] = React.useState<OrderSummaryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  // Fetch cart items for order summary
  React.useEffect(() => {
    const fetchOrderSummary = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual cart API call
        const mockItems: OrderSummaryItem[] = [
          {
            productId: '1',
            title: 'Vitamin C Brightening Serum',
            image: '/products/serum-1.jpg',
            price: 29.99,
            quantity: 2,
            brand: 'Scarlet Beauty'
          },
          {
            productId: '2',
            title: 'Hydrating Night Cream',
            image: '/products/cream-1.jpg',
            price: 45.00,
            quantity: 1,
            brand: 'Glow Labs'
          }
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setOrderItems(mockItems);

        // Actual implementation:
        // const cart = await fetchJson('/cart');
        // const enrichedItems = await Promise.all(
        //   cart.items.map(async (item) => {
        //     const product = await fetchJson(`/catalog/products/${item.productId}`);
        //     return {
        //       productId: item.productId,
        //       title: product.title,
        //       image: product.images[0],
        //       price: product.price.amount,
        //       quantity: item.quantity,
        //       brand: product.brand
        //     };
        //   })
        // );
        // setOrderItems(enrichedItems);

      } catch (error) {
        console.error('Error fetching order summary:', error);
        router.push('/cart');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderSummary();
  }, [router]);

  const handleCheckoutSubmit = async (formData: CheckoutFormData) => {
    setSubmitting(true);
    
    try {
      // TODO: Implement actual order creation
      console.log('Processing order:', formData);
      
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Actual implementation:
      // const orderData = {
      //   ...formData,
      //   items: orderItems.map(item => ({
      //     productId: item.productId,
      //     quantity: item.quantity,
      //     price: item.price
      //   }))
      // };
      // 
      // const order = await fetchJson('/orders/create', {
      //   method: 'POST',
      //   body: JSON.stringify(orderData)
      // });
      
      // Redirect to success page
      router.push('/checkout/success?orderId=12345');
      
    } catch (error) {
      console.error('Checkout error:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orderItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
          <button
            onClick={() => router.push('/products')}
            className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div>
            <CheckoutForm
              onSubmit={handleCheckoutSubmit}
              isLoading={submitting}
            />
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {orderItems.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                      {/* Placeholder for product image */}
                      <div className="w-full h-full rounded-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-500">IMG</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 line-clamp-2">{item.title}</h3>
                      {item.brand && (
                        <p className="text-sm text-gray-500">{item.brand}</p>
                      )}
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                        <span className="font-medium text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-gray-900">{formatPrice(tax)}</span>
                </div>
                
                <div className="flex justify-between text-lg font-semibold pt-3 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <SecurityIcon />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  );
}

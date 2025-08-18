"use client";
import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';

interface OrderDetails {
  orderId: string;
  orderNumber: string;
  email: string;
  total: number;
  currency: string;
  estimatedDelivery: string;
  items: Array<{
    productId: string;
    title: string;
    quantity: number;
    price: number;
  }>;
}

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderDetails, setOrderDetails] = React.useState<OrderDetails | null>(null);
  const [loading, setLoading] = React.useState(true);

  const orderId = searchParams.get('orderId');

  React.useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual order details API call
        const mockOrderDetails: OrderDetails = {
          orderId: orderId,
          orderNumber: `SCR-${orderId}`,
          email: 'customer@example.com',
          total: 104.97,
          currency: 'USD',
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          items: [
            {
              productId: '1',
              title: 'Vitamin C Brightening Serum',
              quantity: 2,
              price: 29.99
            },
            {
              productId: '2',
              title: 'Hydrating Night Cream',
              quantity: 1,
              price: 45.00
            }
          ]
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrderDetails(mockOrderDetails);

        // Actual implementation:
        // const order = await fetchJson(`/orders/${orderId}`);
        // setOrderDetails(order);

      } catch (error) {
        console.error('Error fetching order details:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, router]);

  const formatPrice = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h1>
          <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
          <Button onClick={() => router.push('/')}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircleIcon />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Thank you for your order!
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Your order has been confirmed and is being processed.
          </p>
          <p className="text-sm text-gray-500">
            A confirmation email has been sent to {orderDetails.email}
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Order #{orderDetails.orderNumber}
              </h2>
              <p className="text-sm text-gray-600">
                Placed on {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 text-left sm:text-right">
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(orderDetails.total, orderDetails.currency)}
              </p>
              <p className="text-sm text-gray-600">Total paid</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {orderDetails.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatPrice(item.price * item.quantity, orderDetails.currency)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.price, orderDetails.currency)} each
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <TruckIcon />
              <h3 className="font-medium text-gray-900">Estimated Delivery</h3>
            </div>
            <p className="text-gray-700">
              Your order is expected to arrive by{' '}
              <span className="font-medium">{orderDetails.estimatedDelivery}</span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              You'll receive tracking information via email once your order ships.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push('/products')}
            variant="secondary"
            size="lg"
          >
            Continue Shopping
          </Button>
          <Button
            onClick={() => router.push('/account/orders')}
            size="lg"
          >
            View Order Status
          </Button>
        </div>

        {/* Additional Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-12 h-12 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center">
              <SupportIcon />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600">
              Contact our customer support team
            </p>
            <Link href="/contact" className="text-sm text-pink-600 hover:text-pink-700 font-medium">
              Get Support
            </Link>
          </div>
          
          <div>
            <div className="w-12 h-12 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center">
              <ReturnIcon />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Easy Returns</h3>
            <p className="text-sm text-gray-600">
              30-day hassle-free return policy
            </p>
            <Link href="/returns" className="text-sm text-pink-600 hover:text-pink-700 font-medium">
              Return Policy
            </Link>
          </div>
          
          <div>
            <div className="w-12 h-12 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center">
              <RewardIcon />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Earn Points</h3>
            <p className="text-sm text-gray-600">
              You earned points with this purchase
            </p>
            <Link href="/account/rewards" className="text-sm text-pink-600 hover:text-pink-700 font-medium">
              View Rewards
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
      <path d="M15 18H9"/>
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624L20.28 11.5a1 1 0 0 0-.78-.38H15"/>
      <circle cx="17" cy="18" r="2"/>
      <circle cx="7" cy="18" r="2"/>
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-600">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-600">
      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z"/>
      <path d="M8 21l4-4 4 4"/>
    </svg>
  );
}

function RewardIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-600">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}

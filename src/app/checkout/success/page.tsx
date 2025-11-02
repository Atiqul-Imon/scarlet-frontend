"use client";
import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { useToast } from '../../../lib/context';
import { useCart } from '../../../lib/context';
import OrderReceipt from '../../../components/orders/OrderReceipt';
import { generateReceiptPDF, generateDetailedReceiptPDF, generateSimpleReceiptPDF } from '../../../lib/receipt-generator';

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
    size?: string;
    color?: string;
  }>;
  // Additional fields for receipt
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    area: string;
    postalCode: string;
    phone: string;
  };
  subtotal?: number;
  shipping?: number;
  paymentMethod?: string;
  status?: string;
  trackingNumber?: string;
}

function OrderSuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { clearCart } = useCart();
  const [orderDetails, setOrderDetails] = React.useState<OrderDetails | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [cartCleared, setCartCleared] = React.useState(false);
  const receiptRef = React.useRef<HTMLDivElement>(null);

  const orderId = searchParams.get('orderId');

  // Clear cart when order success page loads (backup for COD orders)
  React.useEffect(() => {
    if (!cartCleared && orderId) {
      const clearCartOnOrderSuccess = async () => {
        try {
          await clearCart();
          console.log('✅ Cart cleared on order success page');
          setCartCleared(true);
          
          // Clear any pending order data
          sessionStorage.removeItem('scarlet_pending_order_id');
          sessionStorage.removeItem('scarlet_verified_guest_phone');
        } catch (error) {
          console.error('❌ Error clearing cart on success page:', error);
        }
      };
      
      clearCartOnOrderSuccess();
    }
  }, [orderId, clearCart, cartCleared]);

  React.useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        // Fetch actual order details from API (public endpoint)
        const response = await fetch(`/api/proxy/orders/public/${orderId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch order: ${response.status}`);
        }
        
        const orderData = await response.json();
        
        if (!orderData.success) {
          throw new Error(orderData.error?.message || 'Failed to load order');
        }
        
        const order = orderData.data;
        console.log('Order data from API:', order);
        
        // Transform API data to match component interface
        const orderDetails: OrderDetails = {
          orderId: order._id,
          orderNumber: order.orderNumber || `SCR-${order._id}`,
          email: order.shippingAddress?.email || 'customer@scarlet.com',
          total: order.total || 0,
          currency: order.currency || 'BDT',
          estimatedDelivery: order.estimatedDelivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          items: (order.items || []).map((item: any) => ({
            productId: item.productId,
            title: item.title || 'Product',
            quantity: item.quantity || 1,
            price: item.price || 0,
            size: item.size
          })),
          // Additional fields for receipt
          customerName: order.shippingAddress?.name || 'Customer',
          customerPhone: order.shippingAddress?.phone,
          shippingAddress: order.shippingAddress || {
            name: 'Customer',
            address: 'N/A',
            city: 'N/A',
            area: 'N/A',
            postalCode: 'N/A',
            phone: 'N/A'
          },
          subtotal: order.subtotal || order.total || 0,
          shipping: order.shipping || 0,
          paymentMethod: order.paymentMethod || 'Unknown',
          status: order.status || 'confirmed',
          trackingNumber: order.trackingNumber
        };

        setOrderDetails(orderDetails);

      } catch (error) {
        console.error('Error fetching order details:', error);
        console.error('Order ID:', orderId);
        console.error('Error details:', error);
        
        // Show error message instead of redirecting immediately
        addToast({
          type: 'error',
          title: 'Failed to Load Order',
          message: 'Could not load order details. Please check your order confirmation email.'
        });
        
        // Redirect to home after showing error
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, router]);

  const formatPrice = (amount: number | undefined, currency: string = 'BDT') => {
    const safeAmount = amount || 0;
    if (currency === 'BDT') {
      return `৳${safeAmount.toLocaleString('en-US')}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(safeAmount);
  };

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current || !orderDetails) return;

    try {
      await generateReceiptPDF(receiptRef.current, {
        orderId: orderDetails.orderId,
        orderNumber: orderDetails.orderNumber,
        orderDate: new Date().toISOString(),
        customerName: orderDetails.customerName || 'Customer',
        customerEmail: orderDetails.email,
        customerPhone: orderDetails.customerPhone,
        shippingAddress: orderDetails.shippingAddress || {
          name: 'Customer',
          address: 'N/A',
          city: 'N/A',
          area: 'N/A',
          postalCode: 'N/A',
          phone: 'N/A'
        },
        items: orderDetails.items,
        subtotal: orderDetails.subtotal || orderDetails.total,
        shipping: orderDetails.shipping || 0,
        total: orderDetails.total,
        currency: orderDetails.currency,
        paymentMethod: orderDetails.paymentMethod || 'Unknown',
        status: orderDetails.status || 'confirmed',
        estimatedDelivery: orderDetails.estimatedDelivery,
        trackingNumber: orderDetails.trackingNumber
      });

      addToast({
        type: 'success',
        title: 'Receipt Downloaded',
        message: 'Your order receipt has been downloaded successfully!'
      });
    } catch (error) {
      console.error('Error downloading receipt:', error);
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to download receipt. Please try again.'
      });
    }
  };

  const handleDownloadDetailedReceipt = () => {
    if (!orderDetails) return;

    try {
      generateDetailedReceiptPDF({
        orderId: orderDetails.orderId,
        orderNumber: orderDetails.orderNumber,
        orderDate: new Date().toISOString(),
        customerName: orderDetails.customerName || 'Customer',
        customerEmail: orderDetails.email,
        customerPhone: orderDetails.customerPhone,
        shippingAddress: orderDetails.shippingAddress || {
          name: 'Customer',
          address: 'N/A',
          city: 'N/A',
          area: 'N/A',
          postalCode: 'N/A',
          phone: 'N/A'
        },
        items: orderDetails.items,
        subtotal: orderDetails.subtotal || orderDetails.total,
        shipping: orderDetails.shipping || 0,
        total: orderDetails.total,
        currency: orderDetails.currency,
        paymentMethod: orderDetails.paymentMethod || 'Unknown',
        status: orderDetails.status || 'confirmed',
        estimatedDelivery: orderDetails.estimatedDelivery,
        trackingNumber: orderDetails.trackingNumber
      });

      addToast({
        type: 'success',
        title: 'Receipt Downloaded',
        message: 'Your detailed order receipt has been downloaded successfully!'
      });
    } catch (error) {
      console.error('Error downloading detailed receipt:', error);
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to download receipt. Please try again.'
      });
    }
  };

  const handleDownloadSimpleReceipt = () => {
    if (!orderDetails) return;

    try {
      generateSimpleReceiptPDF({
        orderId: orderDetails.orderId,
        orderNumber: orderDetails.orderNumber,
        orderDate: new Date().toISOString(),
        customerName: orderDetails.customerName || 'Customer',
        customerEmail: orderDetails.email,
        customerPhone: orderDetails.customerPhone,
        shippingAddress: orderDetails.shippingAddress || {
          name: 'Customer',
          address: 'N/A',
          city: 'N/A',
          area: 'N/A',
          postalCode: 'N/A',
          phone: 'N/A'
        },
        items: orderDetails.items,
        subtotal: orderDetails.subtotal || orderDetails.total,
        shipping: orderDetails.shipping || 0,
        total: orderDetails.total,
        currency: orderDetails.currency,
        paymentMethod: orderDetails.paymentMethod || 'Unknown',
        status: orderDetails.status || 'confirmed',
        estimatedDelivery: orderDetails.estimatedDelivery,
        trackingNumber: orderDetails.trackingNumber
      });

      addToast({
        type: 'success',
        title: 'Receipt Downloaded',
        message: 'Your order receipt has been downloaded successfully!'
      });
    } catch (error) {
      console.error('Error downloading simple receipt:', error);
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to download receipt. Please try again.'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-700 mx-auto mb-4"></div>
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
                A confirmation email has been sent to {orderDetails?.email}
              </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Order #{orderDetails?.orderNumber}
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
                {formatPrice(orderDetails?.total, orderDetails?.currency)}
              </p>
              <p className="text-sm text-gray-600">Total paid</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {(orderDetails?.items || []).map((item, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      {item.size && (
                        <span className="text-sm font-medium text-gray-700">Size: {item.size}</span>
                      )}
                      {item.color && (
                        <span className="text-sm font-medium text-gray-700 ml-2">Color: {item.color}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatPrice(item.price * item.quantity, orderDetails?.currency)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.price, orderDetails?.currency)} each
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

          {/* Debug Information (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-100 rounded-lg p-4 mt-6">
              <h4 className="font-medium text-gray-900 mb-2">Debug Information</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Order ID:</strong> {orderDetails.orderId}</p>
                <p><strong>Order Number:</strong> {orderDetails.orderNumber}</p>
                <p><strong>Total Items:</strong> {orderDetails.items.length}</p>
                <p><strong>Total Amount:</strong> {formatPrice(orderDetails.total, orderDetails.currency)}</p>
                <p><strong>Email:</strong> {orderDetails.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Receipt Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Order Receipt</h2>
            <div className="flex gap-3">
              <Button
                onClick={handleDownloadReceipt}
                variant="secondary"
                size="sm"
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
              <Button
                onClick={handleDownloadDetailedReceipt}
                variant="ghost"
                size="sm"
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Detailed PDF
              </Button>
              <Button
                onClick={handleDownloadSimpleReceipt}
                variant="ghost"
                size="sm"
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Simple PDF
              </Button>
            </div>
          </div>
          
          {/* Receipt Preview */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div ref={receiptRef}>
              <OrderReceipt
                orderId={orderDetails.orderId}
                orderNumber={orderDetails.orderNumber}
                orderDate={new Date().toISOString()}
                customerName={orderDetails.customerName || 'Customer'}
                customerEmail={orderDetails.email}
                customerPhone={orderDetails.customerPhone}
                shippingAddress={orderDetails.shippingAddress || {
                  name: 'Customer',
                  address: 'N/A',
                  city: 'N/A',
                  area: 'N/A',
                  postalCode: 'N/A',
                  phone: 'N/A'
                }}
                items={orderDetails.items}
                subtotal={orderDetails.subtotal || orderDetails.total}
                shipping={orderDetails.shipping || 0}
                total={orderDetails.total}
                currency={orderDetails.currency}
                paymentMethod={orderDetails.paymentMethod || 'Unknown'}
                status={orderDetails.status || 'confirmed'}
                estimatedDelivery={orderDetails.estimatedDelivery}
                trackingNumber={orderDetails.trackingNumber}
                showDownloadButton={false}
              />
            </div>
          </div>
        </div>

        {/* Account Created Message (for auto-created accounts) */}
        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-green-900">
                🎉 Your Account is Ready!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p className="mb-2">
                  We've created an account for you using your phone number: <strong>{orderDetails?.shippingAddress?.phone || orderDetails?.customerPhone}</strong>
                  {orderDetails?.email && (
                    <span> and email: <strong>{orderDetails.email}</strong></span>
                  )}
                </p>
                <p className="mb-3">
                  You can now track your order, view order history, and enjoy faster checkouts on your next purchase!
                </p>
                <div className="bg-white border border-green-200 rounded p-4 mb-3">
                  <p className="font-medium mb-2">To access your account:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Click "Set Your Password" below</li>
                    <li>Enter your phone number: <strong>{orderDetails?.shippingAddress?.phone || orderDetails?.customerPhone}</strong></li>
                    {orderDetails?.email && (
                      <li>Or use your email: <strong>{orderDetails.email}</strong></li>
                    )}
                    <li>You'll receive a password reset OTP via SMS</li>
                    <li>Set your password and start shopping!</li>
                  </ol>
                </div>
                <Link
                  href="/forgot-password"
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Set Your Password →
                </Link>
              </div>
            </div>
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
            onClick={() => router.push('/login')}
            size="lg"
          >
            Login to View Order
          </Button>
        </div>

        {/* Additional Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <SupportIcon />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600">
              Contact our customer support team
            </p>
            <Link href="/contact" className="text-sm text-red-700 hover:text-red-800 font-medium">
              Get Support
            </Link>
          </div>
          
          <div>
            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <ReturnIcon />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Easy Returns</h3>
            <p className="text-sm text-gray-600">
              30-day hassle-free return policy
            </p>
            <Link href="/returns" className="text-sm text-red-700 hover:text-red-800 font-medium">
              Return Policy
            </Link>
          </div>
          
          <div>
            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <RewardIcon />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Earn Points</h3>
            <p className="text-sm text-gray-600">
              You earned points with this purchase
            </p>
            <Link href="/account/rewards" className="text-sm text-red-700 hover:text-red-800 font-medium">
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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-700">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-700">
      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z"/>
      <path d="M8 21l4-4 4 4"/>
    </svg>
  );
}

function RewardIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-700">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSuccessPageContent />
    </Suspense>
  );
}

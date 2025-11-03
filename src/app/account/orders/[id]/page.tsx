"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AccountLayout from '../../../../components/account/AccountLayout';
import { Button } from '../../../../components/ui/button';
import OrderReceipt from '../../../../components/orders/OrderReceipt';
import CancelOrderModal from '../../../../components/orders/CancelOrderModal';
import { generateReceiptPDF, generateDetailedReceiptPDF, generateSimpleReceiptPDF } from '../../../../lib/receipt-generator';
import { useAuth, useToast } from '../../../../lib/context';
import { formatters } from '../../../../lib/utils';
import { orderApi } from '../../../../lib/api';

interface OrderDetails {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  total: number;
  currency: string;
  paymentMethod: string;
  paymentStatus?: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    area: string;
    postalCode: string;
    phone: string;
  };
  items: Array<{
    productId: string;
    title: string;
    quantity: number;
    price: number;
    image?: string;
    size?: string;
    color?: string;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  estimatedDelivery?: string | undefined;
  trackingNumber?: string | undefined;
  customerName: string;
  customerEmail?: string | undefined;
  customerPhone?: string | undefined;
}

export default function OrderDetailsPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [orderDetails, setOrderDetails] = React.useState<OrderDetails | null>(null);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/account/orders/${params['id']}`);
    }
  }, [user, authLoading, router, params]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);
  const receiptRef = React.useRef<HTMLDivElement>(null);

  const orderId = params['id'] as string;

  React.useEffect(() => {
    if (!orderId) {
      router.push('/account/orders');
      return;
    }

    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch order details from API using orderApi.getOrder()
        // This ensures we use the authenticated API client and proper error handling
        const order = await orderApi.getOrder(orderId);
        
        // Transform API data to match component interface
        const orderDetails: OrderDetails = {
          _id: order._id,
          orderNumber: order.orderNumber || `SCR-${order._id}`,
          createdAt: order.createdAt || new Date().toISOString(),
          status: order.status || 'pending',
          total: order.total || 0,
          currency: order.currency || 'BDT',
          paymentMethod: order.paymentInfo?.method || 'unknown',
          paymentStatus: order.paymentInfo?.status || 'pending',
          shippingAddress: {
            name: `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() || 'N/A',
            address: order.shippingAddress?.address || 'N/A',
          city: order.shippingAddress?.city || (order.shippingAddress as any)?.division || 'N/A',
          area: (order.shippingAddress as any)?.area || (order.shippingAddress as any)?.dhakaArea || (order.shippingAddress as any)?.district || 'N/A',
          postalCode: (order.shippingAddress as any)?.postalCode || 'N/A',
            phone: order.shippingAddress?.phone || 'N/A'
          },
          items: (order.items || []).map((item: any) => ({
            productId: item.productId || 'N/A',
            title: item.title || 'Unknown Product',
            quantity: item.quantity || 1,
            price: item.price || 0,
            image: item.image,
            size: item.size,
            color: item.color
          })),
          subtotal: order.subtotal || 0,
          shipping: order.shipping || 0,
          tax: order.tax || 0,
          estimatedDelivery: order.estimatedDelivery,
          trackingNumber: order.trackingNumber,
          customerName: `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() || 'N/A',
          customerEmail: (order.shippingAddress as any)?.email,
          customerPhone: order.shippingAddress?.phone
        };

        setOrderDetails(orderDetails);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order details');
        addToast({
          type: 'error',
          title: 'Failed to Load Order',
          message: 'Could not load order details. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, router, addToast]);

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current || !orderDetails) return;

    try {
      await generateReceiptPDF(receiptRef.current, {
        orderId: orderDetails._id,
        orderNumber: orderDetails.orderNumber,
        orderDate: orderDetails.createdAt,
        customerName: orderDetails.customerName,
        customerEmail: orderDetails.customerEmail,
        customerPhone: orderDetails.customerPhone,
        shippingAddress: orderDetails.shippingAddress,
        items: orderDetails.items,
        subtotal: orderDetails.subtotal,
        shipping: orderDetails.shipping,
        tax: orderDetails.tax,
        total: orderDetails.total,
        currency: orderDetails.currency,
        paymentMethod: orderDetails.paymentMethod,
        status: orderDetails.status,
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
        orderId: orderDetails._id,
        orderNumber: orderDetails.orderNumber,
        orderDate: orderDetails.createdAt,
        customerName: orderDetails.customerName,
        customerEmail: orderDetails.customerEmail,
        customerPhone: orderDetails.customerPhone,
        shippingAddress: orderDetails.shippingAddress,
        items: orderDetails.items,
        subtotal: orderDetails.subtotal,
        shipping: orderDetails.shipping,
        tax: orderDetails.tax,
        total: orderDetails.total,
        currency: orderDetails.currency,
        paymentMethod: orderDetails.paymentMethod,
        status: orderDetails.status,
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
        orderId: orderDetails._id,
        orderNumber: orderDetails.orderNumber,
        orderDate: orderDetails.createdAt,
        customerName: orderDetails.customerName,
        customerEmail: orderDetails.customerEmail,
        customerPhone: orderDetails.customerPhone,
        shippingAddress: orderDetails.shippingAddress,
        items: orderDetails.items,
        subtotal: orderDetails.subtotal,
        shipping: orderDetails.shipping,
        tax: orderDetails.tax,
        total: orderDetails.total,
        currency: orderDetails.currency,
        paymentMethod: orderDetails.paymentMethod,
        status: orderDetails.status,
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

  const getStatusColor = (status: string): string => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusText = (status: string): string => {
    const statusMap = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  // Check if order can be cancelled
  const canCancelOrder = (): boolean => {
    if (!orderDetails) return false;
    const cancellableStatuses = ['pending', 'confirmed', 'processing'];
    return cancellableStatuses.includes(orderDetails.status);
  };

  // Handle order cancellation
  const handleCancelOrder = async (reason: string) => {
    if (!orderDetails) return;
    
    setIsCancelling(true);
    try {
      await orderApi.cancelOrder(orderDetails._id, reason);
      
      addToast({
        type: 'success',
        title: 'Order Cancelled',
        message: `Order #${orderDetails.orderNumber} has been cancelled successfully.`
      });

      // Refresh order details
      const updatedOrder = await orderApi.getOrder(orderDetails._id);
      
      // Transform updated order data
      const updatedOrderDetails: OrderDetails = {
        _id: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber || `SCR-${updatedOrder._id}`,
        createdAt: updatedOrder.createdAt || new Date().toISOString(),
        status: updatedOrder.status || 'pending',
        total: updatedOrder.total || 0,
        currency: updatedOrder.currency || 'BDT',
        paymentMethod: updatedOrder.paymentInfo?.method || 'unknown',
        paymentStatus: updatedOrder.paymentInfo?.status || 'pending',
        shippingAddress: {
          name: `${updatedOrder.shippingAddress?.firstName || ''} ${updatedOrder.shippingAddress?.lastName || ''}`.trim() || 'N/A',
          address: updatedOrder.shippingAddress?.address || 'N/A',
          city: updatedOrder.shippingAddress?.city || (updatedOrder.shippingAddress as any)?.division || 'N/A',
          area: (updatedOrder.shippingAddress as any)?.area || (updatedOrder.shippingAddress as any)?.dhakaArea || (updatedOrder.shippingAddress as any)?.district || 'N/A',
          postalCode: (updatedOrder.shippingAddress as any)?.postalCode || 'N/A',
          phone: updatedOrder.shippingAddress?.phone || 'N/A'
        },
        items: updatedOrder.items.map(item => ({
          productId: item.productId,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          size: item.size || undefined,
          color: item.color || undefined
        })),
        subtotal: updatedOrder.subtotal || 0,
        shipping: updatedOrder.shipping || 0,
        tax: updatedOrder.tax || 0,
        estimatedDelivery: updatedOrder.estimatedDelivery,
        trackingNumber: updatedOrder.trackingNumber,
        customerName: `${updatedOrder.shippingAddress?.firstName || ''} ${updatedOrder.shippingAddress?.lastName || ''}`.trim() || 'N/A',
        customerEmail: (updatedOrder.shippingAddress as any)?.email,
        customerPhone: updatedOrder.shippingAddress?.phone
      };
      
      setOrderDetails(updatedOrderDetails);
      setShowCancelModal(false);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Cancellation Failed',
        message: error.message || 'Failed to cancel order. Please try again.'
      });
      throw error; // Re-throw so modal can handle it
    } finally {
      setIsCancelling(false);
    }
  };

  // Show loading or redirect - don't show skeleton if not authenticated
  if (authLoading || loading || !user) {
    if (!authLoading && !user) {
      return <></>; // Will redirect
    }
    return (
      <AccountLayout>
        <OrderDetailsSkeleton />
      </AccountLayout>
    );
  }

  if (error || !orderDetails) {
    return (
      <AccountLayout>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <ErrorIcon />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-600 mb-6">{error || 'We couldn\'t find the order you\'re looking for.'}</p>
          <Button onClick={() => router.push('/account/orders')}>
            Back to Orders
          </Button>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
            <p className="text-gray-600 mt-1">
              Order #{orderDetails.orderNumber}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderDetails.status)}`}>
              {getStatusText(orderDetails.status)}
            </span>
            {canCancelOrder() && (
              <Button 
                variant="danger" 
                size="sm"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Order
              </Button>
            )}
            <Link href="/account/orders">
              <Button variant="ghost" size="sm">
                Back to Orders
              </Button>
            </Link>
          </div>
        </div>

        {/* Order Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">#{orderDetails.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium">{formatters.formatDate(orderDetails.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${getStatusColor(orderDetails.status)}`}>
                    {getStatusText(orderDetails.status)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize">{orderDetails.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    orderDetails.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                    orderDetails.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    orderDetails.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                    orderDetails.paymentStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {orderDetails.paymentStatus || 'pending'}
                  </span>
                </div>
                {orderDetails.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracking:</span>
                    <span className="font-mono text-sm">{orderDetails.trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{orderDetails.customerName}</span>
                </div>
                {orderDetails.customerEmail && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{orderDetails.customerEmail}</span>
                  </div>
                )}
                {orderDetails.customerPhone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{orderDetails.customerPhone}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatters.formatPrice(orderDetails.subtotal, orderDetails.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">{formatters.formatPrice(orderDetails.shipping, orderDetails.currency)}</span>
                </div>
                {orderDetails.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">{formatters.formatPrice(orderDetails.tax, orderDetails.currency)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{formatters.formatPrice(orderDetails.total, orderDetails.currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
          <div className="space-y-4">
            {orderDetails.items.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-xs text-gray-500">IMG</span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-gray-600">SKU: {item.productId}</p>
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
                    {formatters.formatPrice(item.price * item.quantity, orderDetails.currency)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {item.quantity} × {formatters.formatPrice(item.price, orderDetails.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm space-y-1">
              <p className="font-medium">{orderDetails.shippingAddress.name}</p>
              <p>{orderDetails.shippingAddress.address}</p>
              <p>{orderDetails.shippingAddress.area}, {orderDetails.shippingAddress.city} - {orderDetails.shippingAddress.postalCode}</p>
              <p>Phone: {orderDetails.shippingAddress.phone}</p>
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        {orderDetails.estimatedDelivery && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Delivery:</span>
                  <span className="font-medium">{formatters.formatDate(orderDetails.estimatedDelivery)}</span>
                </div>
                {orderDetails.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracking Number:</span>
                    <span className="font-mono font-medium">{orderDetails.trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Receipt Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Order Receipt</h3>
            <div className="flex gap-2">
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
                orderId={orderDetails._id}
                orderNumber={orderDetails.orderNumber}
                orderDate={orderDetails.createdAt}
                customerName={orderDetails.customerName}
                customerEmail={orderDetails.customerEmail}
                customerPhone={orderDetails.customerPhone}
                shippingAddress={orderDetails.shippingAddress}
                items={orderDetails.items}
                subtotal={orderDetails.subtotal}
                shipping={orderDetails.shipping}
                tax={orderDetails.tax}
                total={orderDetails.total}
                currency={orderDetails.currency}
                paymentMethod={orderDetails.paymentMethod}
                status={orderDetails.status}
                estimatedDelivery={orderDetails.estimatedDelivery}
                trackingNumber={orderDetails.trackingNumber}
                showDownloadButton={false}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Cancel Order Modal */}
      {orderDetails && (
        <CancelOrderModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelOrder}
          orderNumber={orderDetails.orderNumber}
          isLoading={isCancelling}
        />
      )}
    </AccountLayout>
  );
}

function OrderDetailsSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>

      {/* Order Information Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index}>
              <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, itemIndex) => (
                  <div key={itemIndex} className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Items Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorIcon(): React.ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

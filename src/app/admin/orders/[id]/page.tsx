'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  PencilIcon,
  PrinterIcon,
  ArrowPathIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { BDTIcon } from '../../../../components/ui/BDTIcon';
import { useToast } from '@/lib/context';
import { adminApi } from '@/lib/api';
import type { AdminOrder } from '@/lib/admin-types';

interface OrderTimeline {
  id: string;
  status: string;
  title: string;
  description: string;
  timestamp: string;
  user: string;
  type: 'status_change' | 'payment' | 'note' | 'system';
}

interface OrderNote {
  id: string;
  message: string;
  isPrivate: boolean;
  createdBy: string;
  createdAt: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const { addToast } = useToast();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [timeline, setTimeline] = useState<OrderTimeline[]>([]);
  const [notes, setNotes] = useState<OrderNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [notePrivate, setNotePrivate] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Fetch order details from API
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const orderData = await adminApi.orders.getOrderById(params['id'] as string);
      
      // Transform backend order format to frontend AdminOrder format
      const transformedOrder: AdminOrder = {
        _id: orderData._id,
        orderNumber: orderData.orderNumber,
        status: orderData.status,
        paymentStatus: orderData.paymentInfo?.status || 'pending',
        paymentMethod: orderData.paymentInfo?.method || 'cod',
        customer: {
          _id: orderData.userId || orderData.guestId || 'unknown',
          name: `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName || ''}`.trim(),
          email: orderData.shippingAddress.email || 'N/A',
          phone: orderData.shippingAddress.phone,
        },
        items: orderData.items.map((item: any) => ({
          _id: `${orderData._id}-${item.productId}`,
          productId: item.productId,
          productName: item.title,
          productImage: item.image || '/api/placeholder/80/80',
          sku: item.sku || 'N/A',
          variant: item.variant || null,
          size: item.size || undefined,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        subtotal: orderData.subtotal,
        shippingCost: orderData.shipping,
        tax: orderData.tax,
        discount: orderData.discount,
        total: orderData.total,
        currency: orderData.currency,
        shippingAddress: {
          name: `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName || ''}`.trim(),
          phone: orderData.shippingAddress.phone,
          address: orderData.shippingAddress.address,
          city: orderData.shippingAddress.city,
          state: orderData.shippingAddress.area,
          postalCode: orderData.shippingAddress.postalCode,
          country: 'Bangladesh',
        },
        billingAddress: {
          name: `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName || ''}`.trim(),
          phone: orderData.shippingAddress.phone,
          address: orderData.shippingAddress.address,
          city: orderData.shippingAddress.city,
          state: orderData.shippingAddress.area,
          postalCode: orderData.shippingAddress.postalCode,
          country: 'Bangladesh',
        },
        notes: orderData.notes || '',
        trackingNumber: orderData.trackingNumber || null,
        estimatedDelivery: orderData.estimatedDelivery || null,
        createdAt: orderData.createdAt,
        updatedAt: orderData.updatedAt,
      };
      
      setOrder(transformedOrder);
      
      // Generate timeline from order data
      const generatedTimeline: OrderTimeline[] = [
        {
          id: '1',
          status: orderData.status,
          title: `Order ${orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}`,
          description: `Order status: ${orderData.status}`,
          timestamp: orderData.updatedAt || orderData.createdAt,
          user: 'System',
          type: 'status_change',
        },
        {
          id: '2',
          status: 'payment',
          title: 'Payment Processed',
          description: `Payment ${orderData.paymentInfo?.status || 'pending'} via ${orderData.paymentInfo?.method || 'N/A'}`,
          timestamp: orderData.createdAt,
          user: 'System',
          type: 'payment',
        },
        {
          id: '3',
          status: 'pending',
          title: 'Order Placed',
          description: 'Order received and awaiting confirmation',
          timestamp: orderData.createdAt,
          user: 'Customer',
          type: 'status_change',
        },
      ];
      
      setTimeline(generatedTimeline);
      
      // For now, we'll use empty notes array since we don't have a notes API yet
      setNotes([]);
      
    } catch (err: any) {
      console.error('Failed to fetch order details:', err);
      setError(err.message || 'Failed to load order details');
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load order details. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params['id']) {
      fetchOrderDetails();
    }
  }, [params['id']]);

  const handleStatusUpdate = async (status: string) => {
    if (!order) return;
    
    try {
      await adminApi.orders.updateOrderStatus(order._id, status as any);
      
      // Update local state
      setOrder(prev => prev ? { ...prev, status: status as any, updatedAt: new Date().toISOString() } : null);
      
      // Add to timeline
      const newTimelineItem: OrderTimeline = {
        id: Date.now().toString(),
        status,
        title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        description: `Order status updated to ${status}`,
        timestamp: new Date().toISOString(),
        user: 'Admin User',
        type: 'status_change',
      };
      setTimeline(prev => [newTimelineItem, ...prev]);
      setShowStatusModal(false);
      
      addToast({
        type: 'success',
        title: 'Status updated',
        message: `Order status updated to ${status}.`,
      });
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      addToast({
        type: 'error',
        title: 'Update failed',
        message: error.message || 'Failed to update order status. Please try again.',
      });
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    const note: OrderNote = {
      id: Date.now().toString(),
      message: newNote,
      isPrivate: notePrivate,
      createdBy: 'Admin User',
      createdAt: new Date().toISOString(),
    };
    
    setNotes(prev => [note, ...prev]);
    setNewNote('');
    setNotePrivate(false);
    
    addToast({
      type: 'success',
      title: 'Note added',
      message: 'Order note has been added successfully.',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ClockIcon },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircleIcon },
      processing: { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: ArrowPathIcon },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircleIcon },
      refunded: { bg: 'bg-gray-100', text: 'text-gray-800', icon: BDTIcon },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800' },
      completed: { bg: 'bg-green-100', text: 'text-green-800' },
      failed: { bg: 'bg-red-100', text: 'text-red-800' },
      refunded: { bg: 'bg-gray-100', text: 'text-gray-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Error loading order</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <div className="mt-6 space-x-3">
            <button
              onClick={fetchOrderDetails}
              className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Try Again
            </button>
            <Link
              href="/admin/orders"
              className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order && !loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
          <p className="text-gray-600 mt-2">The order you're looking for doesn't exist.</p>
          <Link
            href="/admin/orders"
            className="mt-4 inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return null; // This should not happen due to the loading/error states above
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/orders"
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
                <div className="flex items-center space-x-3 mt-1">
                  {getStatusBadge(order.status)}
                  {getPaymentStatusBadge(order.paymentStatus)}
                  <span className="text-sm text-gray-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchOrderDetails}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <PrinterIcon className="w-4 h-4 mr-2" />
                Print
              </button>
              <button
                onClick={() => setShowStatusModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Update Status
              </button>
              <Link
                href={`/admin/orders/${order._id}/edit`}
                className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.productName}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span>SKU: {item.sku}</span>
                          {item.size && <span className="font-medium text-gray-700">Size: {item.size}</span>}
                          {item.variant && <span>Variant: {item.variant}</span>}
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          ৳{item.total.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          ৳{item.price.toLocaleString()} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">৳{order.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-900">৳{order.shippingCost.toLocaleString()}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount</span>
                        <span className="text-green-600">-৳{order.discount.toLocaleString()}</span>
                      </div>
                    )}
                    {order.tax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span className="text-gray-900">৳{order.tax.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">৳{order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Shipping Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900">{order.customer.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    <a href={`mailto:${order.customer.email}`} className="text-blue-600 hover:text-blue-800">
                      {order.customer.email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="w-5 h-5 text-gray-400" />
                    <a href={`tel:${order.customer.phone}`} className="text-blue-600 hover:text-blue-800">
                      {order.customer.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="text-sm text-gray-700">
                      <div className="font-medium text-gray-900">{order.shippingAddress.name}</div>
                      <div className="mt-1">{order.shippingAddress.address}</div>
                      <div>{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                      <div>{order.shippingAddress.postalCode}, {order.shippingAddress.country}</div>
                      <div className="mt-2">
                        <a href={`tel:${order.shippingAddress.phone}`} className="text-blue-600 hover:text-blue-800">
                          {order.shippingAddress.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 print-hide">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Order Timeline</h3>
              </div>
              <div className="p-6">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {timeline.map((event, eventIdx) => (
                      <li key={event.id}>
                        <div className="relative pb-8">
                          {eventIdx !== timeline.length - 1 ? (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                event.type === 'status_change' ? 'bg-blue-500' :
                                event.type === 'payment' ? 'bg-green-500' :
                                event.type === 'note' ? 'bg-yellow-500' :
                                'bg-gray-500'
                              }`}>
                                {event.type === 'status_change' ? (
                                  <ArrowPathIcon className="w-4 h-4 text-white" />
                                ) : event.type === 'payment' ? (
                                  <CreditCardIcon className="w-4 h-4 text-white" />
                                ) : event.type === 'note' ? (
                                  <DocumentTextIcon className="w-4 h-4 text-white" />
                                ) : (
                                  <ExclamationTriangleIcon className="w-4 h-4 text-white" />
                                )}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div>
                                <div className="text-sm">
                                  <span className="font-medium text-gray-900">{event.title}</span>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-500">{event.description}</p>
                              </div>
                              <div className="mt-2 text-sm text-gray-500">
                                <time dateTime={event.timestamp}>
                                  {new Date(event.timestamp).toLocaleString()} by {event.user}
                                </time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 print-hide">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-3 text-gray-400" />
                  Update Status
                </button>
                <button 
                  onClick={() => {
                    addToast({
                      type: 'info',
                      title: 'Tracking Feature',
                      message: 'Tracking functionality has been removed as this store does not use courier services.'
                    });
                  }}
                  className="w-full flex items-center px-4 py-2 text-left text-gray-400 cursor-not-allowed rounded-lg"
                  disabled
                >
                  <TruckIcon className="w-4 h-4 mr-3 text-gray-300" />
                  <span className="line-through">Add Tracking</span>
                </button>
                <button 
                  onClick={() => {
                    if (order.status !== 'delivered' && order.status !== 'cancelled') {
                      addToast({
                        type: 'error',
                        title: 'Cannot Refund',
                        message: 'Only delivered or cancelled orders can be refunded.'
                      });
                      return;
                    }
                    if (confirm(`Process refund for order ${order.orderNumber}? This will change the order status to "refunded".`)) {
                      handleStatusUpdate('refunded');
                    }
                  }}
                  className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <BDTIcon className="w-4 h-4 mr-3 text-gray-400" />
                  Process Refund
                </button>
                <button 
                  onClick={() => window.print()}
                  className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <PrinterIcon className="w-4 h-4 mr-3 text-gray-400" />
                  Print Invoice
                </button>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Payment Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment Method</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment Status</span>
                  {getPaymentStatusBadge(order.paymentStatus)}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="text-sm font-bold text-gray-900">
                    ৳{order.total.toLocaleString()}
                  </span>
                </div>
                {order.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tracking Number</span>
                    <span className="text-sm font-mono text-blue-600">
                      {order.trackingNumber}
                    </span>
                  </div>
                )}
                {order.estimatedDelivery && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Est. Delivery</span>
                    <span className="text-sm text-gray-900">
                      {new Date(order.estimatedDelivery).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 print-hide">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Order Notes</h3>
              </div>
              <div className="p-6">
                {/* Add Note Form */}
                <div className="mb-6">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-gray-900 bg-white placeholder:text-gray-400"
                    placeholder="Add a note about this order..."
                  />
                  <div className="flex items-center justify-between mt-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notePrivate}
                        onChange={(e) => setNotePrivate(e.target.checked)}
                        className="w-4 h-4 text-red-700 bg-white border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Private note</span>
                    </label>
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className="inline-flex items-center px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PaperAirplaneIcon className="w-3 h-3 mr-1" />
                      Add Note
                    </button>
                  </div>
                </div>

                {/* Notes List */}
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className={`p-3 rounded-lg ${note.isPrivate ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{note.message}</p>
                          <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                            <span>{note.createdBy}</span>
                            <span>•</span>
                            <span>{new Date(note.createdAt).toLocaleString()}</span>
                            {note.isPrivate && (
                              <>
                                <span>•</span>
                                <span className="text-yellow-600 font-medium">Private</span>
                              </>
                            )}
                          </div>
                        </div>
                        <ChatBubbleLeftIcon className={`w-4 h-4 ml-2 ${note.isPrivate ? 'text-yellow-500' : 'text-gray-400'}`} />
                      </div>
                    </div>
                  ))}
                  
                  {order.notes && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{order.notes}</p>
                          <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                            <span>Customer</span>
                            <span>•</span>
                            <span>{new Date(order.createdAt).toLocaleString()}</span>
                            <span>•</span>
                            <span className="text-blue-600 font-medium">Customer Note</span>
                          </div>
                        </div>
                        <DocumentTextIcon className="w-4 h-4 ml-2 text-blue-500" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Order Status</h3>
              <div className="space-y-3">
                {['pending', 'confirmed', 'processing', 'delivered', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                      order.status === status
                        ? 'bg-red-50 border-red-200 text-red-900'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          /* Hide navigation and action buttons */
          nav,
          header,
          .no-print,
          button,
          [class*="sidebar"],
          [class*="AdminSidebar"],
          [class*="AdminHeader"] {
            display: none !important;
          }

          /* Hide timeline and notes sections */
          .print-hide {
            display: none !important;
          }

          /* Page setup */
          @page {
            margin: 1cm;
            size: A4;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          /* Make content full width */
          .lg\\:col-span-2 {
            grid-column: span 3 / span 3 !important;
          }

          /* Ensure proper page breaks */
          .bg-white {
            page-break-inside: avoid;
          }

          /* Show order header prominently */
          .print-header {
            border-bottom: 2px solid #000;
            padding-bottom: 1rem;
            margin-bottom: 2rem;
          }
        }
      `}</style>
    </div>
  );
}

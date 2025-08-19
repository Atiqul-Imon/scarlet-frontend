'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  CurrencyDollarIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@/lib/context';
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
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [timeline, setTimeline] = useState<OrderTimeline[]>([]);
  const [notes, setNotes] = useState<OrderNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [notePrivate, setNotePrivate] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    // Mock data for development
    const mockOrder: AdminOrder = {
      _id: params.id as string,
      orderNumber: 'ORD-2025-001',
      status: 'processing',
      paymentStatus: 'completed',
      paymentMethod: 'bkash',
      customer: {
        _id: 'cust-1',
        name: 'Fatima Rahman',
        email: 'fatima@example.com',
        phone: '+8801712345678',
      },
      items: [
        {
          _id: 'item-1',
          productId: 'prod-1',
          productName: 'Luxury Rose Gold Lipstick',
          productImage: '/api/placeholder/80/80',
          sku: 'LIP-RG-001',
          variant: 'Crimson Rose',
          quantity: 2,
          price: 2500,
          total: 5000,
        },
        {
          _id: 'item-2',
          productId: 'prod-2',
          productName: 'Hydrating Face Serum',
          productImage: '/api/placeholder/80/80',
          sku: 'SER-HYD-002',
          variant: null,
          quantity: 1,
          price: 3500,
          total: 3500,
        },
      ],
      subtotal: 8500,
      shippingCost: 100,
      tax: 0,
      discount: 500,
      total: 8100,
      currency: 'BDT',
      shippingAddress: {
        name: 'Fatima Rahman',
        phone: '+8801712345678',
        address: 'House 123, Road 15, Block C, Bashundhara R/A',
        city: 'Dhaka',
        state: 'Dhaka Division',
        postalCode: '1229',
        country: 'Bangladesh',
      },
      billingAddress: {
        name: 'Fatima Rahman',
        phone: '+8801712345678',
        address: 'House 123, Road 15, Block C, Bashundhara R/A',
        city: 'Dhaka',
        state: 'Dhaka Division',
        postalCode: '1229',
        country: 'Bangladesh',
      },
      notes: 'Please handle with care - gift items. Customer requested express delivery.',
      trackingNumber: 'TRK-2025-001',
      estimatedDelivery: '2025-01-25T00:00:00Z',
      createdAt: '2025-01-18T10:30:00Z',
      updatedAt: '2025-01-18T14:45:00Z',
    };

    const mockTimeline: OrderTimeline[] = [
      {
        id: '1',
        status: 'processing',
        title: 'Order Processing',
        description: 'Order is being prepared for shipment',
        timestamp: '2025-01-18T14:45:00Z',
        user: 'Admin User',
        type: 'status_change',
      },
      {
        id: '2',
        status: 'confirmed',
        title: 'Order Confirmed',
        description: 'Payment verified and order confirmed',
        timestamp: '2025-01-18T11:15:00Z',
        user: 'System',
        type: 'payment',
      },
      {
        id: '3',
        status: 'pending',
        title: 'Order Placed',
        description: 'Order received and awaiting confirmation',
        timestamp: '2025-01-18T10:30:00Z',
        user: 'Customer',
        type: 'status_change',
      },
    ];

    const mockNotes: OrderNote[] = [
      {
        id: '1',
        message: 'Customer called to confirm delivery address. Updated contact number.',
        isPrivate: true,
        createdBy: 'Admin User',
        createdAt: '2025-01-18T13:20:00Z',
      },
      {
        id: '2',
        message: 'Gift wrapping requested. Added special handling instructions.',
        isPrivate: false,
        createdBy: 'Staff User',
        createdAt: '2025-01-18T12:45:00Z',
      },
    ];

    setTimeout(() => {
      setOrder(mockOrder);
      setTimeline(mockTimeline);
      setNotes(mockNotes);
      setLoading(false);
    }, 1000);
  }, [params.id]);

  const handleStatusUpdate = async (status: string) => {
    if (!order) return;
    
    try {
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
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update failed',
        message: 'Failed to update order status. Please try again.',
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
      shipped: { bg: 'bg-purple-100', text: 'text-purple-800', icon: TruckIcon },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircleIcon },
      refunded: { bg: 'bg-gray-100', text: 'text-gray-800', icon: CurrencyDollarIcon },
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

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
          <p className="text-gray-600 mt-2">The order you're looking for doesn't exist.</p>
          <Link
            href="/admin/orders"
            className="mt-4 inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
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
                className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
          <div className="space-y-6">
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
                <button className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <TruckIcon className="w-4 h-4 mr-3 text-gray-400" />
                  Add Tracking
                </button>
                <button className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <CurrencyDollarIcon className="w-4 h-4 mr-3 text-gray-400" />
                  Process Refund
                </button>
                <button className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                    placeholder="Add a note about this order..."
                  />
                  <div className="flex items-center justify-between mt-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notePrivate}
                        onChange={(e) => setNotePrivate(e.target.checked)}
                        className="w-4 h-4 text-pink-600 bg-white border-gray-300 rounded focus:ring-pink-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Private note</span>
                    </label>
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className="inline-flex items-center px-3 py-1 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                      order.status === status
                        ? 'bg-pink-50 border-pink-200 text-pink-800'
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
    </div>
  );
}

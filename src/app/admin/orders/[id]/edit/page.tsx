'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/lib/context';
import type { AdminOrder } from '@/lib/admin-types';

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

    setTimeout(() => {
      setOrder(mockOrder);
      setLoading(false);
    }, 1000);
  }, [params.id]);

  const handleSave = async () => {
    if (!order) return;
    
    setSaving(true);
    try {
      // await adminApi.orders.update(order._id, order);
      addToast({
        type: 'success',
        title: 'Order updated',
        message: 'The order has been updated successfully.',
      });
      router.push(`/admin/orders/${order._id}`);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update failed',
        message: 'Failed to update order. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (!order || newQuantity < 1) return;
    
    setOrder(prev => {
      if (!prev) return prev;
      
      const updatedItems = prev.items.map(item => {
        if (item._id === itemId) {
          const newTotal = item.price * newQuantity;
          return { ...item, quantity: newQuantity, total: newTotal };
        }
        return item;
      });
      
      const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
      const total = subtotal + prev.shippingCost + prev.tax - prev.discount;
      
      return {
        ...prev,
        items: updatedItems,
        subtotal,
        total,
      };
    });
  };

  const handleRemoveItem = (itemId: string) => {
    if (!order) return;
    
    setOrder(prev => {
      if (!prev) return prev;
      
      const updatedItems = prev.items.filter(item => item._id !== itemId);
      const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
      const total = subtotal + prev.shippingCost + prev.tax - prev.discount;
      
      return {
        ...prev,
        items: updatedItems,
        subtotal,
        total,
      };
    });
  };

  const handleShippingCostChange = (newShippingCost: number) => {
    if (!order) return;
    
    setOrder(prev => {
      if (!prev) return prev;
      
      const total = prev.subtotal + newShippingCost + prev.tax - prev.discount;
      
      return {
        ...prev,
        shippingCost: newShippingCost,
        total,
      };
    });
  };

  const handleDiscountChange = (newDiscount: number) => {
    if (!order) return;
    
    setOrder(prev => {
      if (!prev) return prev;
      
      const total = prev.subtotal + prev.shippingCost + prev.tax - newDiscount;
      
      return {
        ...prev,
        discount: newDiscount,
        total,
      };
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
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
            className="mt-4 inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
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
                href={`/admin/orders/${order._id}`}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Order</h1>
                <p className="text-gray-600 mt-1">
                  {order.orderNumber} - {order.customer.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                href={`/admin/orders/${order._id}`}
                className="px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <Button
                onClick={handleSave}
                loading={saving}
                variant="primary"
                className="px-6"
              >
                Save Changes
              </Button>
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
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          disabled={item.quantity <= 1}
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          ৳{item.total.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          ৳{item.price.toLocaleString()} each
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item._id)}
                        className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">৳{order.subtotal.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <div className="flex items-center space-x-2">
                        <span>৳</span>
                        <input
                          type="number"
                          value={order.shippingCost}
                          onChange={(e) => handleShippingCostChange(Number(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-right text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Discount</span>
                      <div className="flex items-center space-x-2">
                        <span>৳</span>
                        <input
                          type="number"
                          value={order.discount}
                          onChange={(e) => handleDiscountChange(Number(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-right text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">৳{order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Customer Name"
                    value={order.customer.name}
                    onChange={(e) => setOrder(prev => prev ? {
                      ...prev,
                      customer: { ...prev.customer, name: e.target.value }
                    } : null)}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={order.customer.email}
                    onChange={(e) => setOrder(prev => prev ? {
                      ...prev,
                      customer: { ...prev.customer, email: e.target.value }
                    } : null)}
                  />
                  <Input
                    label="Phone"
                    value={order.customer.phone}
                    onChange={(e) => setOrder(prev => prev ? {
                      ...prev,
                      customer: { ...prev.customer, phone: e.target.value }
                    } : null)}
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Recipient Name"
                    value={order.shippingAddress.name}
                    onChange={(e) => setOrder(prev => prev ? {
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, name: e.target.value }
                    } : null)}
                  />
                  <Input
                    label="Phone"
                    value={order.shippingAddress.phone}
                    onChange={(e) => setOrder(prev => prev ? {
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, phone: e.target.value }
                    } : null)}
                  />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      rows={3}
                      value={order.shippingAddress.address}
                      onChange={(e) => setOrder(prev => prev ? {
                        ...prev,
                        shippingAddress: { ...prev.shippingAddress, address: e.target.value }
                      } : null)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>
                  <Input
                    label="City"
                    value={order.shippingAddress.city}
                    onChange={(e) => setOrder(prev => prev ? {
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, city: e.target.value }
                    } : null)}
                  />
                  <Input
                    label="State/Division"
                    value={order.shippingAddress.state}
                    onChange={(e) => setOrder(prev => prev ? {
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, state: e.target.value }
                    } : null)}
                  />
                  <Input
                    label="Postal Code"
                    value={order.shippingAddress.postalCode}
                    onChange={(e) => setOrder(prev => prev ? {
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, postalCode: e.target.value }
                    } : null)}
                  />
                  <Input
                    label="Country"
                    value={order.shippingAddress.country}
                    onChange={(e) => setOrder(prev => prev ? {
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, country: e.target.value }
                    } : null)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Order Status</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Status
                  </label>
                  <select
                    value={order.status}
                    onChange={(e) => setOrder(prev => prev ? {
                      ...prev,
                      status: e.target.value as any
                    } : null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={order.paymentStatus}
                    onChange={(e) => setOrder(prev => prev ? {
                      ...prev,
                      paymentStatus: e.target.value as any
                    } : null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={order.paymentMethod}
                    onChange={(e) => setOrder(prev => prev ? {
                      ...prev,
                      paymentMethod: e.target.value as any
                    } : null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="rocket">Rocket</option>
                    <option value="card">Card</option>
                    <option value="cod">Cash on Delivery</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tracking Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Tracking Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <Input
                  label="Tracking Number"
                  value={order.trackingNumber || ''}
                  onChange={(e) => setOrder(prev => prev ? {
                    ...prev,
                    trackingNumber: e.target.value || null
                  } : null)}
                  placeholder="Enter tracking number"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Delivery
                  </label>
                  <input
                    type="date"
                    value={order.estimatedDelivery ? order.estimatedDelivery.split('T')[0] : ''}
                    onChange={(e) => setOrder(prev => prev ? {
                      ...prev,
                      estimatedDelivery: e.target.value ? `${e.target.value}T00:00:00Z` : undefined
                    } : null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Order Notes</h3>
              </div>
              <div className="p-6">
                <textarea
                  rows={4}
                  value={order.notes || ''}
                  onChange={(e) => setOrder(prev => prev ? {
                    ...prev,
                    notes: e.target.value
                  } : null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-gray-900 bg-white placeholder:text-gray-400"
                  placeholder="Add notes about this order..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  PrinterIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  UserIcon,
  CalendarDaysIcon,
  DocumentArrowDownIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronDownIcon,
  BanknotesIcon,
  ShoppingBagIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/lib/context';
import type { AdminOrder } from '@/lib/admin-types';

interface OrderFilters {
  search: string;
  status: string;
  paymentStatus: string;
  dateRange: string;
  paymentMethod: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const ORDER_STATUSES = [
  { value: '', label: 'All Orders', color: 'gray' },
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'confirmed', label: 'Confirmed', color: 'blue' },
  { value: 'processing', label: 'Processing', color: 'indigo' },
  { value: 'shipped', label: 'Shipped', color: 'purple' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
  { value: 'refunded', label: 'Refunded', color: 'gray' },
];

const PAYMENT_STATUSES = [
  { value: '', label: 'All Payments', color: 'gray' },
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'processing', label: 'Processing', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'failed', label: 'Failed', color: 'red' },
  { value: 'refunded', label: 'Refunded', color: 'gray' },
];

const PAYMENT_METHODS = [
  { value: '', label: 'All Methods' },
  { value: 'bkash', label: 'bKash' },
  { value: 'nagad', label: 'Nagad' },
  { value: 'rocket', label: 'Rocket' },
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'cod', label: 'Cash on Delivery' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Order Date' },
  { value: 'total', label: 'Order Total' },
  { value: 'status', label: 'Status' },
  { value: 'customerName', label: 'Customer Name' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>({
    search: '',
    status: '',
    paymentStatus: '',
    dateRange: '',
    paymentMethod: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { addToast } = useToast();

  useEffect(() => {
    // Mock data for development
    const mockOrders: AdminOrder[] = [
      {
        _id: '1',
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
            productImage: '/api/placeholder/60/60',
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
            productImage: '/api/placeholder/60/60',
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
          address: 'House 123, Road 15, Block C',
          city: 'Dhaka',
          state: 'Dhaka Division',
          postalCode: '1207',
          country: 'Bangladesh',
        },
        billingAddress: {
          name: 'Fatima Rahman',
          phone: '+8801712345678',
          address: 'House 123, Road 15, Block C',
          city: 'Dhaka',
          state: 'Dhaka Division',
          postalCode: '1207',
          country: 'Bangladesh',
        },
        notes: 'Please handle with care - gift items',
        trackingNumber: 'TRK-2025-001',
        estimatedDelivery: '2025-01-25T00:00:00Z',
        createdAt: '2025-01-18T10:30:00Z',
        updatedAt: '2025-01-18T14:45:00Z',
      },
      {
        _id: '2',
        orderNumber: 'ORD-2025-002',
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'cod',
        customer: {
          _id: 'cust-2',
          name: 'Ayesha Khan',
          email: 'ayesha@example.com',
          phone: '+8801798765432',
        },
        items: [
          {
            _id: 'item-3',
            productId: 'prod-3',
            productName: 'Organic Body Butter',
            productImage: '/api/placeholder/60/60',
            sku: 'BB-ORG-003',
            variant: 'Lavender',
            quantity: 3,
            price: 1800,
            total: 5400,
          },
        ],
        subtotal: 5400,
        shippingCost: 120,
        tax: 0,
        discount: 0,
        total: 5520,
        currency: 'BDT',
        shippingAddress: {
          name: 'Ayesha Khan',
          phone: '+8801798765432',
          address: 'Flat 4B, Green Plaza',
          city: 'Chittagong',
          state: 'Chittagong Division',
          postalCode: '4000',
          country: 'Bangladesh',
        },
        billingAddress: {
          name: 'Ayesha Khan',
          phone: '+8801798765432',
          address: 'Flat 4B, Green Plaza',
          city: 'Chittagong',
          state: 'Chittagong Division',
          postalCode: '4000',
          country: 'Bangladesh',
        },
        notes: '',
        trackingNumber: null,
        estimatedDelivery: '2025-01-28T00:00:00Z',
        createdAt: '2025-01-18T16:20:00Z',
        updatedAt: '2025-01-18T16:20:00Z',
      },
      {
        _id: '3',
        orderNumber: 'ORD-2025-003',
        status: 'delivered',
        paymentStatus: 'completed',
        paymentMethod: 'nagad',
        customer: {
          _id: 'cust-3',
          name: 'Rashida Begum',
          email: 'rashida@example.com',
          phone: '+8801634567890',
        },
        items: [
          {
            _id: 'item-4',
            productId: 'prod-1',
            productName: 'Luxury Rose Gold Lipstick',
            productImage: '/api/placeholder/60/60',
            sku: 'LIP-RG-001',
            variant: 'Nude Pink',
            quantity: 1,
            price: 2500,
            total: 2500,
          },
        ],
        subtotal: 2500,
        shippingCost: 80,
        tax: 0,
        discount: 250,
        total: 2330,
        currency: 'BDT',
        shippingAddress: {
          name: 'Rashida Begum',
          phone: '+8801634567890',
          address: '25 New Market Road',
          city: 'Sylhet',
          state: 'Sylhet Division',
          postalCode: '3100',
          country: 'Bangladesh',
        },
        billingAddress: {
          name: 'Rashida Begum',
          phone: '+8801634567890',
          address: '25 New Market Road',
          city: 'Sylhet',
          state: 'Sylhet Division',
          postalCode: '3100',
          country: 'Bangladesh',
        },
        notes: '',
        trackingNumber: 'TRK-2025-003',
        estimatedDelivery: '2025-01-20T00:00:00Z',
        createdAt: '2025-01-15T09:15:00Z',
        updatedAt: '2025-01-20T11:30:00Z',
      },
    ];

    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         order.customer.email.toLowerCase().includes(filters.search.toLowerCase()) ||
                         order.customer.phone.includes(filters.search);
    
    const matchesStatus = !filters.status || order.status === filters.status;
    const matchesPaymentStatus = !filters.paymentStatus || order.paymentStatus === filters.paymentStatus;
    const matchesPaymentMethod = !filters.paymentMethod || order.paymentMethod === filters.paymentMethod;
    
    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesPaymentMethod;
  });

  const handleSelectOrder = useCallback((orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o._id));
    }
  }, [selectedOrders.length, filteredOrders]);

  const handleStatusUpdate = useCallback(async (orderId: string, newStatus: string) => {
    try {
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, status: newStatus as any, updatedAt: new Date().toISOString() } : order
      ));
      
      addToast({
        type: 'success',
        title: 'Status updated',
        message: `Order status updated to ${newStatus}.`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update failed',
        message: 'Failed to update order status. Please try again.',
      });
    }
  }, [addToast]);

  const handleBulkStatusUpdate = useCallback(async (newStatus: string) => {
    if (selectedOrders.length === 0) return;
    
    try {
      setOrders(prev => prev.map(order => 
        selectedOrders.includes(order._id) 
          ? { ...order, status: newStatus as any, updatedAt: new Date().toISOString() } 
          : order
      ));
      setSelectedOrders([]);
      
      addToast({
        type: 'success',
        title: 'Bulk update completed',
        message: `${selectedOrders.length} order(s) updated to ${newStatus}.`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Bulk update failed',
        message: 'Failed to update orders. Please try again.',
      });
    }
  }, [selectedOrders, addToast]);

  const getStatusBadge = (status: string) => {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
    const colorClasses = {
      gray: 'bg-gray-100 text-gray-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      purple: 'bg-purple-100 text-purple-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
    };
    
    const getStatusIcon = () => {
      switch (status) {
        case 'pending': return <ClockIcon className="w-3 h-3 mr-1" />;
        case 'confirmed': return <CheckCircleIcon className="w-3 h-3 mr-1" />;
        case 'processing': return <ArrowPathIcon className="w-3 h-3 mr-1" />;
        case 'shipped': return <TruckIcon className="w-3 h-3 mr-1" />;
        case 'delivered': return <CheckCircleIcon className="w-3 h-3 mr-1" />;
        case 'cancelled': return <XCircleIcon className="w-3 h-3 mr-1" />;
        case 'refunded': return <CurrencyDollarIcon className="w-3 h-3 mr-1" />;
        default: return null;
      }
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[statusConfig.color as keyof typeof colorClasses]}`}>
        {getStatusIcon()}
        {statusConfig.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = PAYMENT_STATUSES.find(s => s.value === status) || PAYMENT_STATUSES[0];
    const colorClasses = {
      gray: 'bg-gray-100 text-gray-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colorClasses[statusConfig.color as keyof typeof colorClasses]}`}>
        {statusConfig.label}
      </span>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodConfig = {
      bkash: { label: 'bKash', color: 'bg-pink-100 text-pink-800' },
      nagad: { label: 'Nagad', color: 'bg-orange-100 text-orange-800' },
      rocket: { label: 'Rocket', color: 'bg-purple-100 text-purple-800' },
      card: { label: 'Card', color: 'bg-blue-100 text-blue-800' },
      cod: { label: 'COD', color: 'bg-green-100 text-green-800' },
    };
    
    const config = methodConfig[method as keyof typeof methodConfig] || { label: method, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Management</h1>
            <p className="text-gray-600">
              Process orders, manage fulfillment, and track customer satisfaction
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => {/* Export orders */}}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => {/* Print selected */}}
              disabled={selectedOrders.length === 0}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PrinterIcon className="w-4 h-4 mr-2" />
              Print Selected
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingBagIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter(order => order.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-blue-600">
                  {orders.filter(order => order.status === 'processing').length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ArrowPathIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ৳{orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <BanknotesIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders, customers..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  showFilters 
                    ? 'border-pink-500 text-pink-700 bg-pink-50' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <FunnelIcon className="w-4 h-4 mr-2" />
                Filters
              </button>

              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-pink-50 text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <ListBulletIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 border-l border-gray-300 ${viewMode === 'card' ? 'bg-pink-50 text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-white"
                >
                  {ORDER_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-white"
                >
                  {PAYMENT_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-white"
                >
                  {PAYMENT_METHODS.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-white"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({
                    search: '',
                    status: '',
                    paymentStatus: '',
                    dateRange: '',
                    paymentMethod: '',
                    sortBy: 'createdAt',
                    sortOrder: 'desc',
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="p-4 bg-blue-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <p className="text-sm font-medium text-blue-900">
                  {selectedOrders.length} order(s) selected
                </p>
                <button
                  onClick={() => setSelectedOrders([])}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkStatusUpdate('confirmed')}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
                >
                  Confirm
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('processing')}
                  className="px-3 py-1 text-sm bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200"
                >
                  Process
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('shipped')}
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200"
                >
                  Ship
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('cancelled')}
                  className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Orders List/Grid */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-pink-600 bg-white border-gray-300 rounded focus:ring-pink-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order._id)}
                        onChange={() => handleSelectOrder(order._id)}
                        className="w-4 h-4 text-pink-600 bg-white border-gray-300 rounded focus:ring-pink-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items.length} item(s)
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-pink-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {order.customer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customer.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {getStatusBadge(order.status)}
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getPaymentMethodBadge(order.paymentMethod)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ৳{order.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="text-pink-600 hover:text-pink-900"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/orders/${order._id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => {/* Print order */}}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Print
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Card View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order._id)}
                      onChange={() => handleSelectOrder(order._id)}
                      className="w-4 h-4 text-pink-600 bg-white border-gray-300 rounded focus:ring-pink-500"
                    />
                    <h3 className="text-lg font-medium text-gray-900">
                      {order.orderNumber}
                    </h3>
                  </div>
                  <div className="relative">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                      <EllipsisVerticalIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{order.customer.name}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{order.customer.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{order.customer.phone}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{order.shippingAddress.city}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Status</span>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Payment</span>
                    <div className="flex items-center space-x-2">
                      {getPaymentStatusBadge(order.paymentStatus)}
                      {getPaymentMethodBadge(order.paymentMethod)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      ৳{order.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="p-2 text-pink-600 hover:text-pink-800 rounded-lg hover:bg-pink-50"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/orders/${order._id}/edit`}
                        className="p-2 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => {/* Print order */}}
                        className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-50"
                      >
                        <PrinterIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredOrders.length === 0 && !loading && (
        <div className="text-center py-12">
          <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filters.search || filters.status || filters.paymentStatus || filters.paymentMethod
              ? 'Try adjusting your search or filter criteria.'
              : 'Orders will appear here once customers start placing them.'
            }
          </p>
        </div>
      )}
    </div>
  );
}

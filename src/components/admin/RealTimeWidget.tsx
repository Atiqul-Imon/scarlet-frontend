'use client';

import React, { useState, useEffect } from 'react';
import {
  UsersIcon,
  ShoppingCartIcon,
  ClockIcon,
  FireIcon,
  BellIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { BDTIcon } from '../ui/BDTIcon';
import { format } from 'date-fns';

interface RealTimeData {
  activeUsers: number;
  currentOrders: number;
  revenueToday: number;
  ordersToday: number;
  topProductsToday: Array<{
    name: string;
    sales: number;
  }>;
  recentOrders: Array<{
    orderNumber: string;
    customer: string;
    amount: number;
    timestamp: string;
  }>;
  liveVisitors: Array<{
    page: string;
    visitors: number;
  }>;
}

export default function RealTimeWidget() {
  const [data, setData] = useState<RealTimeData | null>(null);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Mock real-time data
    const generateMockData = (): RealTimeData => ({
      activeUsers: Math.floor(Math.random() * 50) + 20,
      currentOrders: Math.floor(Math.random() * 10) + 5,
      revenueToday: Math.floor(Math.random() * 50000) + 25000,
      ordersToday: Math.floor(Math.random() * 30) + 15,
      topProductsToday: [
        { name: 'Luxury Rose Gold Lipstick', sales: Math.floor(Math.random() * 10) + 5 },
        { name: 'Hydrating Face Serum', sales: Math.floor(Math.random() * 8) + 3 },
        { name: 'Organic Body Butter', sales: Math.floor(Math.random() * 12) + 4 },
      ],
      recentOrders: [
        {
          orderNumber: 'ORD-2025-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
          customer: 'Fatima Rahman',
          amount: Math.floor(Math.random() * 5000) + 1000,
          timestamp: new Date().toISOString(),
        },
        {
          orderNumber: 'ORD-2025-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
          customer: 'Ayesha Khan',
          amount: Math.floor(Math.random() * 3000) + 800,
          timestamp: new Date(Date.now() - Math.random() * 300000).toISOString(),
        },
        {
          orderNumber: 'ORD-2025-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
          customer: 'Rashida Begum',
          amount: Math.floor(Math.random() * 4000) + 1200,
          timestamp: new Date(Date.now() - Math.random() * 600000).toISOString(),
        },
      ],
      liveVisitors: [
        { page: '/products', visitors: Math.floor(Math.random() * 15) + 5 },
        { page: '/products/luxury-rose-gold-lipstick', visitors: Math.floor(Math.random() * 8) + 2 },
        { page: '/cart', visitors: Math.floor(Math.random() * 6) + 1 },
        { page: '/checkout', visitors: Math.floor(Math.random() * 4) + 1 },
      ],
    });

    const updateData = () => {
      if (isLive) {
        setData(generateMockData());
      }
    };

    // Initial load
    updateData();

    // Update every 5 seconds
    const interval = setInterval(updateData, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-rose-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <h3 className="text-lg font-medium text-gray-900">Real-Time Analytics</h3>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              isLive 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {isLive ? 'LIVE' : 'PAUSED'}
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{data.activeUsers}</div>
            <div className="text-sm text-gray-500">Active Users</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
              <ShoppingCartIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{data.currentOrders}</div>
            <div className="text-sm text-gray-500">Current Orders</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
              <BDTIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ৳{data.revenueToday.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Today's Revenue</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-pink-100 rounded-lg mx-auto mb-2">
              <ArrowTrendingUpIcon className="w-6 h-6 text-pink-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{data.ordersToday}</div>
            <div className="text-sm text-gray-500">Today's Orders</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products Today */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <FireIcon className="w-5 h-5 text-orange-500" />
              <h4 className="font-medium text-gray-900">Hot Products Today</h4>
            </div>
            <div className="space-y-3">
              {data.topProductsToday.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-orange-100 rounded-full">
                      <span className="text-orange-600 font-medium text-xs">{index + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 line-clamp-1">
                      {product.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-orange-600">{product.sales}</span>
                    <span className="text-xs text-gray-500">sales</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BellIcon className="w-5 h-5 text-blue-500" />
              <h4 className="font-medium text-gray-900">Recent Orders</h4>
            </div>
            <div className="space-y-3">
              {data.recentOrders.map((order) => (
                <div key={order.orderNumber} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                    <div className="text-xs text-gray-500">{order.customer}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600">
                      ৳{order.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(order.timestamp), 'HH:mm')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Page Views */}
        <div className="mt-6">
          <div className="flex items-center space-x-2 mb-4">
            <EyeIcon className="w-5 h-5 text-indigo-500" />
            <h4 className="font-medium text-gray-900">Live Page Views</h4>
          </div>
          <div className="space-y-2">
            {data.liveVisitors.map((page) => (
              <div key={page.page} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-700 font-mono">{page.page}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-indigo-600">{page.visitors}</span>
                  <span className="text-xs text-gray-500">visitors</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <ClockIcon className="w-3 h-3" />
            <span>Last updated: {format(new Date(), 'HH:mm:ss')}</span>
            {isLive && <span className="text-green-600">• Auto-refreshing every 5s</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

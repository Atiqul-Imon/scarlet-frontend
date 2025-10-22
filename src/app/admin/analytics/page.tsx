'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays } from 'date-fns';
import {
  CalendarDaysIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  HeartIcon,
  StarIcon,
  MapPinIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { BDTIcon } from '../../../components/ui/BDTIcon';
import { useToast } from '@/lib/context';
import { analyticsApi } from '@/lib/api';
import type { SalesAnalytics, TrafficAnalytics, RealTimeAnalytics } from '@/lib/api';

interface AnalyticsData {
  sales: SalesAnalytics;
  traffic: TrafficAnalytics;
  realTime: RealTimeAnalytics;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalVisitors: number;
    conversionRate: number;
    averageOrderValue: number;
    bounceRate: number;
  };
}

type DateRange = '7d' | '30d' | '90d' | '1y' | 'custom';

const COLORS = {
  primary: '#dc2626',
  secondary: '#f43f5e',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  purple: '#8b5cf6',
  indigo: '#6366f1',
  red: '#dc2626',
  rose: '#f43f5e',
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.success,
  COLORS.warning,
  COLORS.info,
  COLORS.purple,
  COLORS.indigo,
  COLORS.red,
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { addToast } = useToast();

  const getDateRange = () => {
    const today = new Date();
    let startDate: string;
    
    switch (dateRange) {
      case '7d':
        startDate = subDays(today, 7).toISOString();
        break;
      case '30d':
        startDate = subDays(today, 30).toISOString();
        break;
      case '90d':
        startDate = subDays(today, 90).toISOString();
        break;
      case '1y':
        startDate = subDays(today, 365).toISOString();
        break;
      case 'custom':
        startDate = customStartDate || subDays(today, 30).toISOString();
        break;
      default:
        startDate = subDays(today, 30).toISOString();
    }
    
    return {
      startDate,
      endDate: customEndDate || today.toISOString()
    };
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();
      
      const [sales, traffic, realTime] = await Promise.all([
        analyticsApi.getSalesAnalytics(startDate, endDate),
        analyticsApi.getTrafficAnalytics(startDate, endDate),
        analyticsApi.getRealTimeAnalytics()
      ]);

      const summary = {
        totalRevenue: sales.totalRevenue,
        totalOrders: sales.totalOrders,
        totalVisitors: traffic.totalVisitors,
        conversionRate: sales.conversionRate,
        averageOrderValue: sales.averageOrderValue,
        bounceRate: traffic.bounceRate,
      };

      setData({
        sales,
        traffic,
        realTime,
        summary
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      addToast('Failed to load analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
    addToast('Analytics data refreshed', 'success');
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, customStartDate, customEndDate]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-500">Analytics data will appear here once you start receiving traffic.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time insights into your beauty store performance</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="custom">Custom range</option>
          </select>
          
          {dateRange === 'custom' && (
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          )}
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors duration-200 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BDTIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ৳{data.summary.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary.totalOrders.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Visitors</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary.totalVisitors.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary.conversionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Users</span>
              <span className="text-lg font-semibold text-gray-900">
                {data.realTime.activeUsers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Page Views (5min)</span>
              <span className="text-lg font-semibold text-gray-900">
                {data.realTime.currentPageViews}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Visitors</span>
              <span className="text-sm font-semibold text-gray-900">
                {data.realTime.conversionFunnel.visitors}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Add to Cart</span>
              <span className="text-sm font-semibold text-gray-900">
                {data.realTime.conversionFunnel.addToCart}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Checkout Start</span>
              <span className="text-sm font-semibold text-gray-900">
                {data.realTime.conversionFunnel.checkoutStart}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Checkout Complete</span>
              <span className="text-sm font-semibold text-gray-900">
                {data.realTime.conversionFunnel.checkoutComplete}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.sales.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Revenue']}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke={COLORS.primary} 
                strokeWidth={2}
                dot={{ fill: COLORS.primary }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.sales.topProducts.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill={COLORS.secondary} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.traffic.deviceBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ device, percentage }) => `${device} (${percentage.toFixed(1)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="visitors"
              >
                {data.traffic.deviceBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
          <div className="space-y-3">
            {data.traffic.topPages.slice(0, 5).map((page, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 truncate">{page.page}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900">{page.views}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${(page.views / data.traffic.topPages[0]?.views) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
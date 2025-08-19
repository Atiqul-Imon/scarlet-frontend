'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import {
  CalendarDaysIcon,
  CurrencyDollarIcon,
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
} from '@heroicons/react/24/outline';
import { useToast } from '@/lib/context';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    averageOrderValue: number;
    conversionRate: number;
    revenueGrowth: number;
    orderGrowth: number;
    customerGrowth: number;
  };
  revenueData: Array<{
    date: string;
    revenue: number;
    orders: number;
    customers: number;
  }>;
  productPerformance: Array<{
    name: string;
    sales: number;
    revenue: number;
    views: number;
    conversionRate: number;
    category: string;
  }>;
  customerInsights: {
    demographics: Array<{
      ageGroup: string;
      count: number;
      percentage: number;
    }>;
    geography: Array<{
      city: string;
      customers: number;
      revenue: number;
    }>;
    devices: Array<{
      device: string;
      sessions: number;
      percentage: number;
    }>;
  };
  salesFunnel: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    revenue: number;
    percentage: number;
  }>;
}

type DateRange = '7d' | '30d' | '90d' | '1y' | 'custom';

const COLORS = {
  primary: '#ec4899',
  secondary: '#f43f5e',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  purple: '#8b5cf6',
  indigo: '#6366f1',
  pink: '#ec4899',
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
  COLORS.pink,
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    // Mock analytics data
    const generateMockData = (): AnalyticsData => {
      const today = new Date();
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
      
      // Generate revenue data
      const revenueData = Array.from({ length: days }, (_, i) => {
        const date = subDays(today, days - 1 - i);
        const baseRevenue = 15000 + Math.random() * 10000;
        const seasonality = Math.sin((i / days) * Math.PI * 2) * 2000;
        const weekendBoost = [0, 6].includes(date.getDay()) ? 3000 : 0;
        
        return {
          date: format(date, 'MMM dd'),
          revenue: Math.round(baseRevenue + seasonality + weekendBoost),
          orders: Math.round((baseRevenue + seasonality + weekendBoost) / 2800),
          customers: Math.round((baseRevenue + seasonality + weekendBoost) / 3500),
        };
      });

      const totalRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0);
      const totalOrders = revenueData.reduce((sum, day) => sum + day.orders, 0);
      const totalCustomers = revenueData.reduce((sum, day) => sum + day.customers, 0);

      return {
        overview: {
          totalRevenue,
          totalOrders,
          totalCustomers,
          averageOrderValue: Math.round(totalRevenue / totalOrders),
          conversionRate: 3.2,
          revenueGrowth: 12.5,
          orderGrowth: 8.3,
          customerGrowth: 15.7,
        },
        revenueData,
        productPerformance: [
          {
            name: 'Luxury Rose Gold Lipstick',
            sales: 156,
            revenue: 390000,
            views: 2340,
            conversionRate: 6.7,
            category: 'Makeup',
          },
          {
            name: 'Hydrating Face Serum',
            sales: 89,
            revenue: 311500,
            views: 1876,
            conversionRate: 4.7,
            category: 'Skincare',
          },
          {
            name: 'Organic Body Butter',
            sales: 234,
            revenue: 421200,
            views: 3210,
            conversionRate: 7.3,
            category: 'Bath & Body',
          },
          {
            name: 'Vitamin C Brightening Cream',
            sales: 67,
            revenue: 268000,
            views: 1543,
            conversionRate: 4.3,
            category: 'Skincare',
          },
          {
            name: 'Natural Perfume Oil',
            sales: 123,
            revenue: 184500,
            views: 2876,
            conversionRate: 4.3,
            category: 'Fragrance',
          },
        ],
        customerInsights: {
          demographics: [
            { ageGroup: '18-24', count: 1234, percentage: 28.5 },
            { ageGroup: '25-34', count: 1876, percentage: 43.2 },
            { ageGroup: '35-44', count: 876, percentage: 20.2 },
            { ageGroup: '45-54', count: 234, percentage: 5.4 },
            { ageGroup: '55+', count: 123, percentage: 2.8 },
          ],
          geography: [
            { city: 'Dhaka', customers: 2340, revenue: 1250000 },
            { city: 'Chittagong', customers: 876, revenue: 450000 },
            { city: 'Sylhet', customers: 543, revenue: 280000 },
            { city: 'Rajshahi', customers: 432, revenue: 220000 },
            { city: 'Khulna', customers: 321, revenue: 165000 },
            { city: 'Barisal', customers: 234, revenue: 120000 },
          ],
          devices: [
            { device: 'Mobile', sessions: 3456, percentage: 67.8 },
            { device: 'Desktop', sessions: 1234, percentage: 24.2 },
            { device: 'Tablet', sessions: 408, percentage: 8.0 },
          ],
        },
        salesFunnel: [
          { stage: 'Visitors', count: 15420, percentage: 100 },
          { stage: 'Product Views', count: 8765, percentage: 56.8 },
          { stage: 'Add to Cart', count: 2340, percentage: 15.2 },
          { stage: 'Checkout Started', count: 1456, percentage: 9.4 },
          { stage: 'Orders Completed', count: 987, percentage: 6.4 },
        ],
        paymentMethods: [
          { method: 'bKash', count: 432, revenue: 1250000, percentage: 43.8 },
          { method: 'Cash on Delivery', count: 321, revenue: 890000, percentage: 32.5 },
          { method: 'Nagad', count: 156, revenue: 450000, percentage: 15.8 },
          { method: 'Rocket', count: 67, revenue: 190000, percentage: 6.8 },
          { method: 'Card', count: 11, revenue: 35000, percentage: 1.1 },
        ],
      };
    };

    setTimeout(() => {
      setData(generateMockData());
      setLoading(false);
    }, 1000);
  }, [dateRange]);

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Beauty Analytics</h1>
            <p className="text-gray-600">
              Comprehensive insights into your Scarlet business performance
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            {/* Date Range Selector */}
            <div className="flex items-center space-x-2">
              <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRange)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
            
            <button
              onClick={() => setLoading(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh
            </button>
            
            <button
              onClick={() => {/* Export functionality */}}
              className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.overview.totalRevenue)}
              </p>
              <div className={`flex items-center mt-2 text-sm ${getGrowthColor(data.overview.revenueGrowth)}`}>
                {getGrowthIcon(data.overview.revenueGrowth)}
                <span className="ml-1">{formatPercentage(data.overview.revenueGrowth)}</span>
                <span className="text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.totalOrders.toLocaleString()}
              </p>
              <div className={`flex items-center mt-2 text-sm ${getGrowthColor(data.overview.orderGrowth)}`}>
                {getGrowthIcon(data.overview.orderGrowth)}
                <span className="ml-1">{formatPercentage(data.overview.orderGrowth)}</span>
                <span className="text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.totalCustomers.toLocaleString()}
              </p>
              <div className={`flex items-center mt-2 text-sm ${getGrowthColor(data.overview.customerGrowth)}`}>
                {getGrowthIcon(data.overview.customerGrowth)}
                <span className="ml-1">{formatPercentage(data.overview.customerGrowth)}</span>
                <span className="text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.overview.averageOrderValue)}
              </p>
              <div className={`flex items-center mt-2 text-sm ${getGrowthColor(data.overview.conversionRate)}`}>
                <StarIcon className="w-4 h-4 text-yellow-500" />
                <span className="ml-1">{formatPercentage(data.overview.conversionRate)}</span>
                <span className="text-gray-500 ml-1">conversion rate</span>
              </div>
            </div>
            <div className="p-3 bg-pink-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Revenue Trend</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
                Revenue
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Orders
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number, name: string) => [
                  name === 'revenue' ? formatCurrency(value) : value,
                  name === 'revenue' ? 'Revenue' : 'Orders'
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={COLORS.primary}
                fill={`${COLORS.primary}20`}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="orders"
                stroke={COLORS.info}
                fill={`${COLORS.info}20`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Top Products</h3>
            <select className="border border-gray-300 rounded px-3 py-1 text-sm">
              <option>By Revenue</option>
              <option>By Sales</option>
              <option>By Views</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.productPerformance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#666" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#666" fontSize={12} width={120} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              />
              <Bar dataKey="revenue" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Demographics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Customer Demographics</h3>
            <UserGroupIcon className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.customerInsights.demographics}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="count"
              >
                {data.customerInsights.demographics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number, name: string, props: any) => [
                  `${value.toLocaleString()} (${props.payload.percentage}%)`,
                  'Customers'
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
            <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {data.paymentMethods.map((method, index) => (
              <div key={method.method} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  ></div>
                  <span className="font-medium text-gray-900">{method.method}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {formatCurrency(method.revenue)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {method.count} orders ({formatPercentage(method.percentage)})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Funnel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Sales Funnel</h3>
            <ArrowTrendingDownIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {data.salesFunnel.map((stage, index) => (
              <div key={stage.stage} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{stage.stage}</span>
                  <span className="text-sm text-gray-500">
                    {stage.count.toLocaleString()} ({formatPercentage(stage.percentage)})
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stage.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Top Cities</h3>
            <MapPinIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {data.customerInsights.geography.slice(0, 6).map((city, index) => (
              <div key={city.city} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">{city.city}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {city.customers} customers
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(city.revenue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Analytics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Device Usage</h3>
            <DevicePhoneMobileIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {data.customerInsights.devices.map((device, index) => {
              const Icon = device.device === 'Mobile' ? DevicePhoneMobileIcon :
                          device.device === 'Desktop' ? ComputerDesktopIcon : GlobeAltIcon;
              
              return (
                <div key={device.device} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900">{device.device}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPercentage(device.percentage)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {device.sessions.toLocaleString()} sessions
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Product Performance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Product Performance Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.productPerformance.map((product, index) => (
                <tr key={product.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-pink-600 font-medium text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {product.sales.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(product.revenue)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {product.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-pink-500 h-2 rounded-full"
                          style={{ width: `${Math.min(product.conversionRate * 10, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {formatPercentage(product.conversionRate)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { format, subMinutes } from 'date-fns';
import {
  UsersIcon,
  ShoppingCartIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  MapPinIcon,
  ClockIcon,
  ArrowPathIcon,
  EyeIcon,
  HeartIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { BDTIcon } from '../../../../components/ui/BDTIcon';
import RealTimeWidget from '@/components/admin/RealTimeWidget';

interface RealTimeMetrics {
  timestamp: string;
  activeUsers: number;
  pageViews: number;
  revenue: number;
  orders: number;
  bounceRate: number;
  avgSessionDuration: number;
}

interface LiveTraffic {
  source: string;
  visitors: number;
  percentage: number;
  change: number;
}

interface ActivePages {
  page: string;
  activeUsers: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

interface GeographicData {
  country: string;
  city: string;
  activeUsers: number;
  sessions: number;
}

interface DeviceBreakdown {
  device: string;
  activeUsers: number;
  percentage: number;
  avgSessionDuration: number;
}

export default function RealTimeAnalyticsPage() {
  const [metrics, setMetrics] = useState<RealTimeMetrics[]>([]);
  const [liveTraffic, setLiveTraffic] = useState<LiveTraffic[]>([]);
  const [activePages, setActivePages] = useState<ActivePages[]>([]);
  const [geographic, setGeographic] = useState<GeographicData[]>([]);
  const [devices, setDevices] = useState<DeviceBreakdown[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const generateMetrics = (): RealTimeMetrics => {
      const now = new Date();
      return {
        timestamp: now.toISOString(),
        activeUsers: Math.floor(Math.random() * 50) + 30,
        pageViews: Math.floor(Math.random() * 200) + 100,
        revenue: Math.floor(Math.random() * 5000) + 2000,
        orders: Math.floor(Math.random() * 10) + 5,
        bounceRate: Math.random() * 20 + 30,
        avgSessionDuration: Math.random() * 300 + 180,
      };
    };

    const generateLiveTraffic = (): LiveTraffic[] => [
      {
        source: 'Organic Search',
        visitors: Math.floor(Math.random() * 30) + 20,
        percentage: 45.2,
        change: Math.random() * 20 - 10,
      },
      {
        source: 'Direct',
        visitors: Math.floor(Math.random() * 20) + 15,
        percentage: 28.7,
        change: Math.random() * 15 - 7,
      },
      {
        source: 'Social Media',
        visitors: Math.floor(Math.random() * 15) + 8,
        percentage: 18.3,
        change: Math.random() * 25 - 12,
      },
      {
        source: 'Email',
        visitors: Math.floor(Math.random() * 8) + 3,
        percentage: 5.1,
        change: Math.random() * 30 - 15,
      },
      {
        source: 'Paid Ads',
        visitors: Math.floor(Math.random() * 5) + 2,
        percentage: 2.7,
        change: Math.random() * 40 - 20,
      },
    ];

    const generateActivePages = (): ActivePages[] => [
      {
        page: '/products',
        activeUsers: Math.floor(Math.random() * 15) + 8,
        avgTimeOnPage: Math.random() * 180 + 120,
        bounceRate: Math.random() * 30 + 20,
      },
      {
        page: '/products/luxury-rose-gold-lipstick',
        activeUsers: Math.floor(Math.random() * 12) + 5,
        avgTimeOnPage: Math.random() * 240 + 180,
        bounceRate: Math.random() * 25 + 15,
      },
      {
        page: '/',
        activeUsers: Math.floor(Math.random() * 10) + 6,
        avgTimeOnPage: Math.random() * 120 + 60,
        bounceRate: Math.random() * 40 + 30,
      },
      {
        page: '/cart',
        activeUsers: Math.floor(Math.random() * 8) + 3,
        avgTimeOnPage: Math.random() * 300 + 200,
        bounceRate: Math.random() * 20 + 10,
      },
      {
        page: '/checkout',
        activeUsers: Math.floor(Math.random() * 5) + 2,
        avgTimeOnPage: Math.random() * 400 + 300,
        bounceRate: Math.random() * 15 + 5,
      },
    ];

    const generateGeographic = (): GeographicData[] => [
      {
        country: 'Bangladesh',
        city: 'Dhaka',
        activeUsers: Math.floor(Math.random() * 20) + 15,
        sessions: Math.floor(Math.random() * 30) + 20,
      },
      {
        country: 'Bangladesh',
        city: 'Chittagong',
        activeUsers: Math.floor(Math.random() * 10) + 5,
        sessions: Math.floor(Math.random() * 15) + 8,
      },
      {
        country: 'Bangladesh',
        city: 'Sylhet',
        activeUsers: Math.floor(Math.random() * 8) + 3,
        sessions: Math.floor(Math.random() * 12) + 5,
      },
      {
        country: 'Bangladesh',
        city: 'Rajshahi',
        activeUsers: Math.floor(Math.random() * 6) + 2,
        sessions: Math.floor(Math.random() * 10) + 4,
      },
    ];

    const generateDevices = (): DeviceBreakdown[] => {
      const total = Math.floor(Math.random() * 50) + 40;
      const mobile = Math.floor(total * (0.6 + Math.random() * 0.2));
      const desktop = Math.floor((total - mobile) * (0.7 + Math.random() * 0.2));
      const tablet = total - mobile - desktop;

      return [
        {
          device: 'Mobile',
          activeUsers: mobile,
          percentage: (mobile / total) * 100,
          avgSessionDuration: Math.random() * 200 + 150,
        },
        {
          device: 'Desktop',
          activeUsers: desktop,
          percentage: (desktop / total) * 100,
          avgSessionDuration: Math.random() * 400 + 300,
        },
        {
          device: 'Tablet',
          activeUsers: tablet,
          percentage: (tablet / total) * 100,
          avgSessionDuration: Math.random() * 250 + 200,
        },
      ];
    };

    const updateData = () => {
      if (!isLive) return;

      // Add new metric point
      setMetrics(prev => {
        const newMetrics = [...prev, generateMetrics()].slice(-20); // Keep last 20 points
        return newMetrics;
      });

      // Update other data
      setLiveTraffic(generateLiveTraffic());
      setActivePages(generateActivePages());
      setGeographic(generateGeographic());
      setDevices(generateDevices());
      setLastUpdate(new Date());
    };

    // Initial load
    updateData();

    // Update every 10 seconds
    const interval = setInterval(updateData, 10000);

    return () => clearInterval(interval);
  }, [isLive]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const currentMetrics = metrics[metrics.length - 1] || {
    activeUsers: 0,
    pageViews: 0,
    revenue: 0,
    orders: 0,
    bounceRate: 0,
    avgSessionDuration: 0,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Real-Time Analytics</h1>
            <p className="text-gray-600">
              Live insights into your Scarlet website performance
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span>Last updated: {format(lastUpdate, 'HH:mm:ss')}</span>
            </div>
            <button
              onClick={() => setIsLive(!isLive)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isLive 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {isLive ? 'LIVE' : 'PAUSED'}
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Widget */}
      <div className="mb-8">
        <RealTimeWidget />
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-blue-600">{currentMetrics.activeUsers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Page Views</p>
              <p className="text-3xl font-bold text-purple-600">{currentMetrics.pageViews}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <EyeIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Live Revenue</p>
              <p className="text-3xl font-bold text-green-600">৳{currentMetrics.revenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <BDTIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Live Orders</p>
              <p className="text-3xl font-bold text-red-700">{currentMetrics.orders}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <ShoppingCartIcon className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Live Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Active Users Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Active Users (Last 20 minutes)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                stroke="#666" 
                fontSize={12} 
              />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip
                labelFormatter={(value) => format(new Date(value), 'HH:mm:ss')}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="activeUsers" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue (Last 20 minutes)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                stroke="#666" 
                fontSize={12} 
              />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip
                labelFormatter={(value) => format(new Date(value), 'HH:mm:ss')}
                formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Revenue']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                fill="rgba(16, 185, 129, 0.2)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Sources */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <GlobeAltIcon className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-medium text-gray-900">Live Traffic Sources</h3>
          </div>
          <div className="space-y-4">
            {liveTraffic.map((source) => (
              <div key={source.source} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{source.source}</div>
                  <div className="text-sm text-gray-500">{source.percentage.toFixed(1)}%</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{source.visitors}</div>
                  <div className={`text-sm ${source.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {source.change >= 0 ? '+' : ''}{source.change.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Pages */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <EyeIcon className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-medium text-gray-900">Active Pages</h3>
          </div>
          <div className="space-y-4">
            {activePages.map((page) => (
              <div key={page.page} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-sm text-gray-700 truncate flex-1 mr-2">
                    {page.page}
                  </div>
                  <div className="font-bold text-purple-600">{page.activeUsers}</div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Avg time: {formatDuration(page.avgTimeOnPage)}</span>
                  <span>Bounce: {page.bounceRate.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <DevicePhoneMobileIcon className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-medium text-gray-900">Device Breakdown</h3>
          </div>
          <div className="space-y-4">
            {devices.map((device) => {
              const Icon = device.device === 'Mobile' ? DevicePhoneMobileIcon :
                          device.device === 'Desktop' ? ComputerDesktopIcon : GlobeAltIcon;
              
              return (
                <div key={device.device} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{device.device}</span>
                    </div>
                    <div className="font-bold text-green-600">{device.activeUsers}</div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{device.percentage.toFixed(1)}%</span>
                    <span>Avg session: {formatDuration(device.avgSessionDuration)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-green-500 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${device.percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Geographic Data */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MapPinIcon className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900">Geographic Distribution</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {geographic.map((location) => (
            <div key={location.city} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="font-bold text-2xl text-red-600">{location.activeUsers}</div>
              <div className="font-medium text-gray-900">{location.city}</div>
              <div className="text-sm text-gray-500">{location.sessions} sessions</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

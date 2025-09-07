'use client';

import { useState, useEffect } from 'react';
import { 
  UsersIcon,
  ShoppingCartIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { BDTIcon } from '../../components/ui/BDTIcon';
import { adminApi } from '@/lib/api';
import type { AdminStats } from '@/lib/admin-types';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ComponentType<{ className?: string }>;
  color: 'pink' | 'blue' | 'green' | 'purple' | 'orange' | 'red';
  subtitle?: string;
}

function StatCard({ title, value, change, changeType, icon: Icon, color, subtitle }: StatCardProps) {
  const colorClasses = {
    pink: {
      bg: 'from-pink-500 to-rose-500',
      text: 'text-pink-600',
      lightBg: 'from-pink-50 to-rose-50',
      border: 'border-pink-100'
    },
    blue: {
      bg: 'from-blue-500 to-indigo-500',
      text: 'text-blue-600',
      lightBg: 'from-blue-50 to-indigo-50',
      border: 'border-blue-100'
    },
    green: {
      bg: 'from-green-500 to-emerald-500',
      text: 'text-green-600',
      lightBg: 'from-green-50 to-emerald-50',
      border: 'border-green-100'
    },
    purple: {
      bg: 'from-purple-500 to-violet-500',
      text: 'text-purple-600',
      lightBg: 'from-purple-50 to-violet-50',
      border: 'border-purple-100'
    },
    orange: {
      bg: 'from-orange-500 to-amber-500',
      text: 'text-orange-600',
      lightBg: 'from-orange-50 to-amber-50',
      border: 'border-orange-100'
    },
    red: {
      bg: 'from-red-500 to-rose-500',
      text: 'text-red-600',
      lightBg: 'from-red-50 to-rose-50',
      border: 'border-red-100'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className={`bg-gradient-to-r ${classes.lightBg} rounded-2xl p-6 border ${classes.border} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-gray-500 text-xs">{subtitle}</p>
          )}
          {change && (
            <div className="flex items-center mt-2">
              {changeType === 'increase' ? (
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                {change}
              </span>
              <span className="text-gray-500 text-sm ml-1">vs yesterday</span>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 bg-gradient-to-r ${classes.bg} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await adminApi.dashboard.getStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-pink-200 rounded-lg w-64 mb-2"></div>
          <div className="h-4 bg-pink-100 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          ✨ Beauty Dashboard ✨
        </h1>
        <p className="text-gray-600 text-lg">
          Your cosmetics empire at a glance
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Customers"
          value={stats?.totalUsers.toLocaleString() || '0'}
          change="+12.5%"
          changeType="increase"
          icon={UsersIcon}
          color="pink"
          subtitle="Beauty lovers"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders.toLocaleString() || '0'}
          change="+8.2%"
          changeType="increase"
          icon={ShoppingCartIcon}
          color="blue"
          subtitle="Happy purchases"
        />
        <StatCard
          title="Total Revenue"
          value={`৳${stats?.totalRevenue.toLocaleString() || '0'}`}
          change="+15.3%"
          changeType="increase"
          icon={BDTIcon}
          color="green"
          subtitle="Beauty sales"
        />
        <StatCard
          title="Products"
          value={stats?.totalProducts.toLocaleString() || '0'}
          change="+2.1%"
          changeType="increase"
          icon={CubeIcon}
          color="purple"
          subtitle="Beauty items"
        />
      </div>

      {/* Today's Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Today's Sales"
          value={`৳${stats?.revenueToday.toLocaleString() || '0'}`}
          change="+23.1%"
          changeType="increase"
          icon={SparklesIcon}
          color="pink"
          subtitle="Looking gorgeous!"
        />
        <StatCard
          title="New Customers"
          value={stats?.newUsersToday.toLocaleString() || '0'}
          change="+5.7%"
          changeType="increase"
          icon={HeartIcon}
          color="orange"
          subtitle="Welcome beauties!"
        />
        <StatCard
          title="Orders Today"
          value={stats?.ordersToday.toLocaleString() || '0'}
          change="+18.9%"
          changeType="increase"
          icon={StarIcon}
          color="blue"
          subtitle="Busy day!"
        />
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders.toLocaleString() || '0'}
          icon={ExclamationTriangleIcon}
          color="orange"
          subtitle="Need attention"
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.lowStockProducts.toLocaleString() || '0'}
          icon={CubeIcon}
          color="red"
          subtitle="Restock needed"
        />
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">✨ Top Selling Products</h2>
          <button className="text-pink-600 hover:text-pink-700 font-medium text-sm">
            View All →
          </button>
        </div>
        
        <div className="space-y-4">
          {stats?.topSellingProducts.map((product, index) => (
            <div key={product.productId} className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
              <div className="flex items-center space-x-4">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                  ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                    'bg-gradient-to-r from-pink-400 to-rose-500'}
                `}>
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.sales} units sold</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">৳{product.revenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Revenue</p>
              </div>
            </div>
          )) || (
            <p className="text-center text-gray-500 py-8">No sales data available</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold mb-2">Add New Product</h3>
          <p className="text-pink-100 mb-4">Expand your beauty collection</p>
          <button className="bg-white text-pink-600 px-4 py-2 rounded-lg font-medium hover:bg-pink-50 transition-colors duration-200">
            Add Product
          </button>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold mb-2">Process Orders</h3>
          <p className="text-blue-100 mb-4">Fulfill customer dreams</p>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200">
            View Orders
          </button>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold mb-2">Analytics Report</h3>
          <p className="text-green-100 mb-4">Track your success</p>
          <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors duration-200">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
}

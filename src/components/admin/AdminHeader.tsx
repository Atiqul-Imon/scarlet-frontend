'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/context';
import type { User } from '@/lib/types';
import { adminApi } from '@/lib/api';
import type { AdminStats } from '@/lib/admin-types';

interface AdminHeaderProps {
  onMenuClick: () => void;
  user: User;
}

export function AdminHeader({ onMenuClick, user }: AdminHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickStats, setQuickStats] = useState<Pick<AdminStats, 'revenueToday' | 'ordersToday'> | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const router = useRouter();

  // Close user menu when clicking outside + load quick stats
  useEffect(() => {
    let isMounted = true;

    async function fetchQuickStats() {
      try {
        setStatsLoading(true);
        const stats = await adminApi.dashboard.getStats();
        if (!isMounted) return;
        setQuickStats({
          revenueToday: stats.revenueToday,
          ordersToday: stats.ordersToday
        });
      } catch (error) {
        console.error('Failed to load quick stats:', error);
      } finally {
        if (isMounted) {
          setStatsLoading(false);
        }
      }
    }

    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    fetchQuickStats();
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      isMounted = false;
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-white shadow-sm border-b border-red-100 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
              onClick={onMenuClick}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            {/* Welcome message */}
            <div className="hidden sm:block ml-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Welcome back, <span className="text-red-700">{user.firstName}</span>!
              </h1>
              <p className="text-sm text-gray-600">
                {currentDate} • {currentTime}
              </p>
            </div>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-red-200 rounded-full leading-5 bg-red-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent sm:text-sm transition-all duration-200"
                placeholder="Search products, orders, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Quick stats */}
            <div className="hidden md:flex items-center space-x-4 text-sm">
              <div className="text-center px-3 py-1 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-100">
                <div className="text-red-700 font-semibold">
                  {statsLoading
                    ? <span className="animate-pulse text-xs">Loading…</span>
                    : `৳${(quickStats?.revenueToday ?? 0).toLocaleString()}`}
                </div>
                <div className="text-gray-600 text-xs">Today's Sales</div>
              </div>
              <div className="text-center px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <div className="text-green-600 font-semibold">
                  {statsLoading
                    ? <span className="animate-pulse text-xs">…</span>
                    : (quickStats?.ordersToday ?? 0).toLocaleString()}
                </div>
                <div className="text-gray-600 text-xs">New Orders</div>
              </div>
            </div>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                className="flex items-center space-x-3 p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user.firstName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-600 capitalize">
                    {user.role} • Online
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-red-100 py-2 z-50">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-red-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.firstName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {user.email || user.phone}
                        </div>
                        <div className="text-xs text-red-700 font-medium capitalize">
                          {user.role} Access
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    <button
                      onClick={() => router.push('/account/profile')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                    >
                      <UserCircleIcon className="w-5 h-5 mr-3" />
                      My Profile
                    </button>
                    <button
                      onClick={() => router.push('/admin/settings')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                    >
                      <CogIcon className="w-5 h-5 mr-3" />
                      Settings
                    </button>
                    <button
                      onClick={() => router.push('/admin/help')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                    >
                      <SparklesIcon className="w-5 h-5 mr-3" />
                      Help & Support
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-red-50 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

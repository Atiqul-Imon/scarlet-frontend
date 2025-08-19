'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon,
  UsersIcon,
  ShoppingBagIcon,
  CubeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  HeartIcon,
  StarIcon,
  GiftIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BellIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import type { AdminNavItem } from '@/lib/admin-types';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems: AdminNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/admin',
    icon: HomeIcon,
  },
  {
    id: 'users',
    label: 'Customer Management',
    href: '/admin/users',
    icon: UserGroupIcon,
  },
  {
    id: 'products',
    label: 'Product Catalog',
    href: '/admin/products',
    icon: SparklesIcon,
    badge: 3, // Low stock items
  },
  {
    id: 'orders',
    label: 'Order Management',
    href: '/admin/orders',
    icon: ShoppingCartIcon,
    badge: 12, // Pending orders
  },
  {
    id: 'analytics',
    label: 'Beauty Analytics',
    href: '/admin/analytics',
    icon: ChartBarIcon,
  },
  {
    id: 'inventory',
    label: 'Inventory',
    href: '/admin/inventory',
    icon: CubeIcon,
  },
  {
    id: 'promotions',
    label: 'Promotions',
    href: '/admin/promotions',
    icon: GiftIcon,
  },
  {
    id: 'reviews',
    label: 'Reviews & Ratings',
    href: '/admin/reviews',
    icon: StarIcon,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/admin/settings',
    icon: Cog6ToothIcon,
  },
  {
    id: 'logs',
    label: 'Activity Logs',
    href: '/admin/logs',
    icon: DocumentTextIcon,
  },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white shadow-xl border-r border-pink-100">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 py-6 bg-gradient-to-r from-pink-500 to-rose-500">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-pink-500" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-white">Scarlet Admin</h1>
                <p className="text-pink-100 text-sm">Beauty Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col flex-grow pt-6 pb-4 overflow-y-auto">
            <nav className="px-3 space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`
                      group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative
                      ${isActive 
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25' 
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:text-pink-600'
                      }
                    `}
                  >
                    <item.icon 
                      className={`
                        flex-shrink-0 w-5 h-5 mr-3 transition-colors duration-200
                        ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-pink-500'}
                      `} 
                    />
                    <span className="flex-1">{item.label}</span>
                    
                    {/* Badge */}
                    {item.badge && (
                      <span className={`
                        inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full
                        ${isActive 
                          ? 'bg-white text-pink-600' 
                          : 'bg-pink-500 text-white'
                        }
                      `}>
                        {item.badge}
                      </span>
                    )}

                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom section */}
            <div className="mt-auto px-3 pt-6 border-t border-pink-100">
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
                <div className="flex items-center">
                  <HeartIcon className="w-8 h-8 text-pink-500" />
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-gray-900">Beauty Tips</h3>
                    <p className="text-xs text-gray-600">Manage your store with love</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar for mobile */}
      <div className={`
        lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between flex-shrink-0 px-6 py-6 bg-gradient-to-r from-pink-500 to-rose-500">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-pink-500" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-white">Scarlet Admin</h1>
                <p className="text-pink-100 text-sm">Beauty Dashboard</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-pink-100 hover:text-white transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <div className="flex flex-col flex-grow pt-6 pb-4 overflow-y-auto">
            <nav className="px-3 space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onClose}
                    className={`
                      group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative
                      ${isActive 
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25' 
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:text-pink-600'
                      }
                    `}
                  >
                    <item.icon 
                      className={`
                        flex-shrink-0 w-5 h-5 mr-3 transition-colors duration-200
                        ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-pink-500'}
                      `} 
                    />
                    <span className="flex-1">{item.label}</span>
                    
                    {/* Badge */}
                    {item.badge && (
                      <span className={`
                        inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full
                        ${isActive 
                          ? 'bg-white text-pink-600' 
                          : 'bg-pink-500 text-white'
                        }
                      `}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom section */}
            <div className="mt-auto px-3 pt-6 border-t border-pink-100">
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
                <div className="flex items-center">
                  <HeartIcon className="w-8 h-8 text-pink-500" />
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-gray-900">Beauty Tips</h3>
                    <p className="text-xs text-gray-600">Manage your store with love</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

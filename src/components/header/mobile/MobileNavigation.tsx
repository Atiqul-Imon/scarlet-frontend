"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth, useCart } from '@/lib/context';
import type { MegaItem } from '../MegaMenu';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  categories: MegaItem[];
}

export default function MobileNavigation({ isOpen, onClose, categories }: MobileNavigationProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cart, itemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query.length > 0) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  // Handle category toggle
  const toggleCategory = (index: number) => {
    setExpandedCategory(expandedCategory === index ? null : index);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    onClose();
    router.push('/');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Mobile Menu */}
      <div className="fixed inset-0 z-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo/scarletlogo.png"
              alt="Scarlet"
              width={100}
              height={32}
              className="h-6 w-auto object-contain"
              priority
            />
            {user && (
              <span className="text-sm text-gray-600">
                Hi, {user.firstName || user.email}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              aria-label="Search"
            >
              <SearchIcon />
            </button>
          </form>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          {/* Quick Actions */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/cart"
                onClick={onClose}
                className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <div className="relative">
                  <CartIcon />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-900">Cart ({itemCount})</span>
              </Link>
              
              <Link
                href="/wishlist"
                onClick={onClose}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <HeartIcon />
                <span className="text-sm font-medium text-gray-900">Wishlist</span>
              </Link>
            </div>
          </div>

          {/* User Account Section */}
          {user ? (
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="space-y-2">
                <Link
                  href="/account"
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <UserIcon />
                  <span className="text-sm font-medium">My Account</span>
                </Link>
                <Link
                  href="/account/orders"
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <OrderIcon />
                  <span className="text-sm font-medium">My Orders</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
                >
                  <LogoutIcon />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="space-y-2">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="block w-full text-center py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={onClose}
                  className="block w-full text-center py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}

          {/* Categories */}
          <div className="px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map((category, index) => (
                <div key={category.label}>
                  <button
                    onClick={() => category.columns ? toggleCategory(index) : (() => {
                      router.push(category.href || '#');
                      onClose();
                    })()}
                    className="w-full flex items-center justify-between p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="text-sm font-medium">{category.label}</span>
                    {category.columns && (
                      <ChevronIcon 
                        className={`w-4 h-4 transition-transform ${
                          expandedCategory === index ? 'rotate-180' : ''
                        }`} 
                      />
                    )}
                  </button>
                  
                  {/* Subcategories */}
                  {category.columns && expandedCategory === index && (
                    <div className="ml-4 mt-2 space-y-1">
                      {category.columns.map((column, colIndex) => (
                        <div key={colIndex}>
                          {column.title && (
                            <h4 className="text-xs font-semibold text-pink-600 uppercase tracking-wide mb-2">
                              {column.title}
                            </h4>
                          )}
                          <div className="space-y-1">
                            {column.items.map((item, itemIndex) => (
                              <Link
                                key={itemIndex}
                                href={item.href}
                                onClick={onClose}
                                className="block p-2 text-sm text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded transition-colors"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Icon Components
function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 12.39A2 2 0 0 0 9.63 15H19a2 2 0 0 0 2-1.59l1.38-7.59H6"/>
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21a8 8 0 1 0-16 0"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function OrderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16,17 21,12 16,7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M6 9l6 6 6-6"/>
    </svg>
  );
}

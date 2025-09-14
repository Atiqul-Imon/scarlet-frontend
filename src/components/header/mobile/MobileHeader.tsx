"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth, useCart } from '@/lib/context';
import MobileMenuButton from './MobileMenuButton';

interface MobileHeaderProps {
  onMenuOpen: () => void;
}

export default function MobileHeader({ onMenuOpen }: MobileHeaderProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, itemCount, loading: cartLoading } = useCart();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side to prevent hydration issues
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query.length > 0) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowSearch(false);
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    // If user is on homepage, reload the page
    if (window.location.pathname === '/') {
      e.preventDefault();
      window.location.reload();
    }
    // Otherwise, let the Link navigate normally
  };

  return (
    <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-[9999]">
      {/* Mobile Search Overlay */}
      {showSearch && (
        <div className="absolute inset-0 bg-white z-50 flex items-center gap-2 px-4 py-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
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
          <button
            onClick={() => setShowSearch(false)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close search"
          >
            <CloseIcon />
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left: Menu Button */}
        <MobileMenuButton
          isOpen={false}
          onClick={onMenuOpen}
        />

        {/* Center: Logo */}
        <Link href="/" className="flex-1 flex justify-center" onClick={handleLogoClick}>
          <Image
            src="/logo/scarletlogo.png"
            alt="Scarlet"
            width={120}
            height={40}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Search */}
          <button
            onClick={() => setShowSearch(true)}
            className="p-2 text-gray-700 hover:text-pink-600 transition-colors"
            aria-label="Search"
          >
            <SearchIcon />
          </button>

          {/* User Account */}
          {!isClient || authLoading ? (
            <div className="p-2">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-pink-600 rounded-full animate-spin"></div>
            </div>
          ) : user ? (
            <Link
              href="/account"
              className="p-2 text-gray-700 hover:text-pink-600 transition-colors"
              aria-label="Account"
            >
              <UserIcon />
            </Link>
          ) : (
            <Link
              href="/login"
              className="p-2 text-gray-700 hover:text-pink-600 transition-colors"
              aria-label="Sign in"
            >
              <UserIcon />
            </Link>
          )}

          {/* Cart */}
          <Link
            href="/cart"
            className="p-2 text-gray-700 hover:text-pink-600 transition-colors relative"
            aria-label="Cart"
          >
            <CartIcon />
            {isClient && !cartLoading && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}

// Icon Components
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
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

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 12.39A2 2 0 0 0 9.63 15H19a2 2 0 0 0 2-1.59l1.38-7.59H6"/>
    </svg>
  );
}

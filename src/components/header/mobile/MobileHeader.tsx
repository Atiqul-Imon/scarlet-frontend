"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, useCart } from '@/lib/context';
import MobileMenuButton from './MobileMenuButton';
import MobileSearchOverlay from '../../search/MobileSearchOverlay';
import { useMobileSearch } from '../../../hooks/useMobileSearch';

interface MobileHeaderProps {
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}

export default function MobileHeader({ isMenuOpen, onMenuToggle }: MobileHeaderProps) {
  const { user, loading: authLoading } = useAuth();
  const { itemCount, loading: cartLoading } = useCart();
  const { isOpen: isSearchOpen, openSearch, closeSearch } = useMobileSearch();
  const [isClient, setIsClient] = useState(false);

  // Debug logging
  React.useEffect(() => {
    console.log('Mobile search state:', { isSearchOpen });
  }, [isSearchOpen]);

  // Ensure we're on the client side to prevent hydration issues
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    // If user is on homepage, reload the page
    if (window.location.pathname === '/') {
      e.preventDefault();
      window.location.reload();
    }
    // Otherwise, let the Link navigate normally
  };

  return (
    <>
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-[9999]">

      {/* Main Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left: Menu Button */}
        <MobileMenuButton
          isOpen={isMenuOpen}
          onClick={onMenuToggle}
        />

        {/* Center: Logo */}
        <Link href="/" className="flex-1 flex justify-center" onClick={handleLogoClick}>
          <Image
            src="https://res.cloudinary.com/db5yniogx/image/upload/v1760152223/scarletlogopng001_tebeai_10b44a.png"
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
            onClick={() => {
              console.log('Search button clicked');
              openSearch();
            }}
            className="p-2 text-gray-700 hover:text-red-700 transition-colors"
            aria-label="Search"
          >
            <SearchIcon />
          </button>

          {/* User Account */}
          {!isClient || authLoading ? (
            <div className="p-2">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-red-700 rounded-full animate-spin"></div>
            </div>
          ) : user ? (
            <Link
              href="/account"
              className="p-2 text-gray-700 hover:text-red-700 transition-colors"
              aria-label="Account"
            >
              <UserIcon />
            </Link>
          ) : (
            <Link
              href="/login"
              className="p-2 text-gray-700 hover:text-red-700 transition-colors"
              aria-label="Sign in"
            >
              <UserIcon />
            </Link>
          )}

          {/* Cart */}
          <Link
            href="/cart"
            className="p-2 text-gray-700 hover:text-red-700 transition-colors relative"
            aria-label="Cart"
          >
            <CartIcon />
            {isClient && !cartLoading && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
      </div>
      
      {/* Mobile Search Overlay */}
      <MobileSearchOverlay isOpen={isSearchOpen} onClose={closeSearch} />
    </>
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

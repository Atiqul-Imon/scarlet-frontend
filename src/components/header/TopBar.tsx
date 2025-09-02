"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useAuth, useCart } from '@/lib/context';

export default function TopBar() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const { cart, itemCount, loading: cartLoading } = useCart();
  const [q, setQ] = React.useState("");
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showMobileSearch, setShowMobileSearch] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  // Ensure we're on the client side to prevent hydration issues
  React.useEffect(() => {
    setIsClient(true);
  }, []);
  

  const userMenuRef = React.useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (query.length > 0) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowMobileSearch(false); // Close mobile search after submission
    }
  }

  return (
    <div className="w-full bg-white relative">
      <div className="container-herlan">
        {/* Mobile Search Expanded View */}
        {showMobileSearch && (
          <div className="md:hidden h-[80px] flex items-center gap-2 px-2">
            <form onSubmit={onSubmit} className="flex-1 flex">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
                className="h-10 flex-1 border-2 border-pink-500 bg-white px-4 text-sm outline-none focus:border-pink-600 focus:ring-0 rounded-l-full"
                autoFocus
              />
              <button 
                type="submit" 
                aria-label="Search" 
                className="h-10 px-4 bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 transition-colors rounded-r-full border-2 border-pink-600 hover:border-pink-700 flex items-center justify-center min-w-[48px]"
              >
                <SearchIcon />
              </button>
            </form>
            <button
              onClick={() => setShowMobileSearch(false)}
              className="p-2 text-gray-500 hover:text-gray-700 min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Close search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}

        {/* Normal View */}
        {!showMobileSearch && (
          <div className="h-[80px] grid grid-cols-[1fr_1fr] md:grid-cols-[200px_1fr_200px] lg:grid-cols-[250px_1fr_250px] items-center gap-2 md:gap-4 lg:gap-6">
            {/* Logo */}
            <Link href="/" className="block select-none">
              <div className="flex items-center">
                <span className="text-2xl md:text-3xl font-bold text-pink-600 tracking-tight leading-none">Scarlet</span>
              </div>
            </Link>

            {/* Desktop Search */}
            <form onSubmit={onSubmit} className="relative hidden md:flex justify-self-center w-full">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
                className="h-8 md:h-10 w-full border-2 border-pink-500 bg-white px-2 md:px-4 pr-10 md:pr-14 text-[12px] md:text-[14px] outline-none focus:border-pink-600 focus:ring-0 rounded-l-full"
              />
              <button 
                type="submit" 
                aria-label="Search" 
                className="h-8 md:h-10 px-3 md:px-5 bg-pink-600 text-white text-xs md:text-sm font-medium hover:bg-pink-700 transition-colors rounded-r-full border-2 border-pink-600 hover:border-pink-700 flex items-center"
              >
                <SearchIcon />
              </button>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-3 lg:gap-6 text-sm justify-end">
              {/* Search Icon */}
              <button
                onClick={() => {
                  // Only trigger mobile search on mobile screens
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setShowMobileSearch(true);
                  }
                }}
                className="hover:text-pink-600 inline-flex items-center justify-center transition-colors p-2 min-w-[32px] min-h-[32px]"
                aria-label="Search"
              >
                <SearchIcon />
              </button>

              {/* Wishlist */}
              <Link href="/wishlist" className="hover:text-pink-600 inline-flex items-center justify-center transition-colors group p-2 min-w-[32px] min-h-[32px]" aria-label="Wishlist">
                <div className="relative">
                  <HeartIcon />
                </div>
              </Link>
              
              {/* User Account - Show loading state or content */}
              {!isClient || authLoading ? (
                <div className="inline-flex items-center justify-center p-2 min-w-[32px] min-h-[32px]">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-pink-600 rounded-full animate-spin"></div>
                </div>
              ) : user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="hover:text-pink-600 inline-flex items-center justify-center transition-colors p-2 min-w-[32px] min-h-[32px]"
                    aria-label="Account menu"
                  >
                    <UserIcon />
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user.email || user.phone}</p>
                      </div>
                      
                      <Link
                        href="/account"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Account
                      </Link>
                      
                      <Link
                        href="/account/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Orders
                      </Link>
                      
                      <Link
                        href="/account/wishlist"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Wishlist
                      </Link>
                      
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                          router.push('/');
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 md:gap-3">
                  <Link
                    href="/login"
                    className="text-xs md:text-sm text-gray-700 hover:text-pink-600 transition-colors px-2 py-1"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="text-xs md:text-sm bg-pink-600 text-white px-2 py-1 md:px-3 rounded-md hover:bg-pink-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
              
              {/* Cart */}
              <Link href="/cart" className="hover:text-pink-600 inline-flex items-center justify-center relative transition-colors group p-2 min-w-[32px] min-h-[32px]" aria-label="Cart">
                <div className="relative">
                  <CartIcon />
                  {isClient && !cartLoading && itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </div>
                
                {/* Mini Cart Preview on Hover - Desktop Only */}
                {isClient && !cartLoading && itemCount > 0 && (
                  <div className="hidden md:block absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">Cart ({itemCount} items)</h3>
                        <span className="text-sm text-pink-600 font-medium">View All</span>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {cart?.items?.slice(0, 3).map((item, index) => (
                          <div key={item.productId || index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                              {item.product?.images?.[0] ? (
                                <img 
                                  src={item.product.images[0]} 
                                  alt={item.product.title}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <span className="text-xs text-gray-500">📦</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.product?.title || `Product ${item.productId}`}
                              </p>
                              <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                              {item.product?.price && (
                                <p className="text-xs text-pink-600 font-medium">
                                  ৳{item.product.price.amount}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                        {cart?.items && cart.items.length > 3 && (
                          <div className="text-center py-2">
                            <span className="text-sm text-gray-500">
                              +{cart.items.length - 3} more items
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between text-sm font-medium">
                          <span>Total Items:</span>
                          <span>{itemCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  );
}


function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700 hover:text-pink-600 flex-shrink-0">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700 hover:text-pink-600 flex-shrink-0">
      <path d="M20 21a8 8 0 1 0-16 0"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700 hover:text-pink-600 flex-shrink-0">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 12.39A2 2 0 0 0 9.63 15H19a2 2 0 0 0 2-1.59l1.38-7.59H6"/>
    </svg>
  );
}

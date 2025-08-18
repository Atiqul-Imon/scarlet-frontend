"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';

export default function TopBar() {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [cartCount, setCartCount] = React.useState(0);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (query.length > 0) router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="w-full bg-white">
      <div className="mx-auto max-w-[1280px] px-4">
        <div className="h-[80px] grid grid-cols-[280px_1fr_300px] items-center gap-6">
          {/* Logo */}
          <Link href="/" className="block w-[280px] select-none">
            <div className="flex items-center">
              <span className="text-3xl font-bold text-pink-600 tracking-tight leading-none">Scarlet</span>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={onSubmit} className="relative flex justify-self-center max-w-[600px] w-full">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for products, brands, and more"
              className="h-10 w-full border-2 border-pink-500 bg-white px-4 pr-14 text-[14px] outline-none focus:border-pink-600 focus:ring-0 rounded-l-full"
            />
            <button 
              type="submit" 
              aria-label="Search" 
              className="h-10 px-5 bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 transition-colors rounded-r-full border-2 border-pink-600 hover:border-pink-700 flex items-center"
            >
              <SearchIcon />
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-6 text-sm min-w-[300px] justify-end">
            <Link href="/wishlist" className="hover:text-pink-600 inline-flex items-center transition-colors group" aria-label="Wishlist">
              <div className="relative">
                <HeartIcon />
              </div>
            </Link>
            
            <Link href="/account" className="hover:text-pink-600 inline-flex items-center transition-colors" aria-label="Account">
              <UserIcon />
            </Link>
            
            <Link href="/cart" className="hover:text-pink-600 inline-flex items-center relative transition-colors group" aria-label="Cart">
              <div className="relative">
                <CartIcon />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
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

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 12.39A2 2 0 0 0 9.63 15H19a2 2 0 0 0 2-1.59l1.38-7.59H6"/>
    </svg>
  );
}

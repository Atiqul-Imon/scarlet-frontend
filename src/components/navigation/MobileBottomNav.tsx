"use client";
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/lib/context';
import { useAuth } from '@/lib/context';

interface BottomNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  badge?: number;
  requiresAuth?: boolean;
}

const bottomNavItems: BottomNavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Cart',
    href: '/cart',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
      </svg>
    ),
  },
  {
    label: 'Consultation',
    href: '/skincare-consultation',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    label: 'Account',
    href: '/account',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    requiresAuth: true,
  },
];

// Custom hook to safely access cart context during SSR
function useSafeCart() {
  const [isClient, setIsClient] = React.useState(false);
  const [safeItemCount, setSafeItemCount] = React.useState(0);
  
  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  const cartContext = useCart();
  
  React.useEffect(() => {
    if (isClient) {
      setSafeItemCount(cartContext.itemCount);
    }
  }, [isClient, cartContext.itemCount]);
  
  return { itemCount: safeItemCount, isClient };
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, isClient } = useSafeCart();
  const { user } = useAuth();

  const handleNavClick = (item: BottomNavItem) => {
    // If the item requires authentication and user is not logged in, redirect to login
    if (item.requiresAuth && !user) {
      router.push('/login');
      return;
    }
    // Otherwise, navigate normally
    router.push(item.href);
  };

  // Update cart item with badge count - only show badge after client hydration
  const navItems = React.useMemo(() => {
    return bottomNavItems.map(item => ({
      ...item,
      badge: item.label === 'Cart' && isClient && itemCount > 0 ? itemCount : 0,
    }));
  }, [isClient, itemCount]);

  // If not on client yet, render without any cart-related logic
  if (!isClient) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-[10001] bg-white border-t border-gray-200 lg:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <button
                key={item.href}
                onClick={() => handleNavClick(item)}
                className={`flex flex-col items-center justify-center px-2 py-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                  isActive
                    ? 'text-red-600 bg-red-50'
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <div className="relative">
                  {isActive && item.activeIcon ? item.activeIcon : item.icon}
                </div>
                
                <span className="text-xs font-medium mt-1 truncate text-center">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[10001] bg-white border-t border-gray-200 lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <button
              key={item.href}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center justify-center px-2 py-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                isActive
                  ? 'text-red-600 bg-red-50'
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <div className="relative">
                {isActive && item.activeIcon ? item.activeIcon : item.icon}
                
                {/* Badge */}
                {item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              
              <span className="text-xs font-medium mt-1 truncate text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

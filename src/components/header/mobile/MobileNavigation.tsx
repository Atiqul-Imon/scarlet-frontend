"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth, useCart } from '@/lib/context';
import type { MegaItem } from '../MegaMenu';
import type { CategoryTree } from '@/lib/types';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  categories: MegaItem[];
  categoryTree: CategoryTree[];
}

export default function MobileNavigation({ isOpen, onClose, categoryTree }: MobileNavigationProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedSubCategory, setExpandedSubCategory] = useState<string | null>(null);

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
  const toggleCategory = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
      setExpandedSubCategory(null);
    } else {
      setExpandedCategory(categoryId);
      setExpandedSubCategory(null); // Reset subcategory when parent changes
    }
  };

  // Handle subcategory toggle
  const toggleSubCategory = (subCategoryId: string) => {
    setExpandedSubCategory(expandedSubCategory === subCategoryId ? null : subCategoryId);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    onClose();
    router.push('/');
  };

  // Handle logo click
  const handleLogoClick = (e: React.MouseEvent) => {
    // If user is on homepage, reload the page
    if (window.location.pathname === '/') {
      e.preventDefault();
      window.location.reload();
    }
    // Otherwise, let the Link navigate normally and close the menu
    onClose();
  };

  if (!isOpen) return null;

  // Handle backdrop click - close menu
  const handleBackdropClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle any link/button click inside menu - close menu
  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 cursor-pointer"
        onClick={handleBackdropClick}
        onTouchStart={handleBackdropClick}
        aria-label="Close menu"
      />
      
      {/* Mobile Menu */}
      <div 
        className="fixed inset-0 z-50 flex flex-col"
        onClick={(e) => {
          // Only stop propagation for clicks inside the menu panel
          // Allow backdrop clicks to bubble up and close the menu
          const target = e.target as HTMLElement;
          const menuPanel = target.closest('.mobile-menu-panel');
          if (menuPanel) {
            e.stopPropagation();
          }
        }}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" onClick={handleLogoClick} className="cursor-pointer">
              <Image
                src="https://res.cloudinary.com/db5yniogx/image/upload/v1760152223/scarletlogopng001_tebeai_10b44a.png"
                alt="Scarlet"
                width={100}
                height={32}
                className="h-6 w-auto object-contain"
                priority
              />
            </Link>
            {user && (
              <span className="text-sm text-gray-600">
                Hi, {user.firstName || user.email}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1"
            aria-label="Close menu"
            title="Close menu"
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
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
              aria-label="Search"
            >
              <SearchIcon />
            </button>
          </form>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto bg-white mobile-menu-panel">
          {/* User Account Section */}
          {user ? (
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="space-y-2">
                <Link
                  href="/account"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <UserIcon />
                  <span className="text-sm font-medium">My Account</span>
                </Link>
                <Link
                  href="/account/orders"
                  onClick={handleLinkClick}
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
                  onClick={handleLinkClick}
                  className="block w-full text-center py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={handleLinkClick}
                  className="block w-full text-center py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}

          {/* Categories - Show only top-level with nested children */}
          <div className="px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
            <div className="space-y-1">
              {categoryTree.map((category) => {
                const hasChildren = category.children && category.children.length > 0;
                const isExpanded = expandedCategory === category._id;
                
                return (
                  <div key={category._id || category.slug}>
                    {/* Top-level Category */}
                    <div className="flex items-center">
                      {hasChildren ? (
                        <button
                          onClick={() => toggleCategory(category._id || '')}
                          className="flex-1 flex items-center justify-between p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <span className="text-sm font-medium">{category.name}</span>
                          <ChevronIcon 
                            className={`w-4 h-4 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`} 
                          />
                        </button>
                      ) : (
                                <Link
                                  href={`/products?category=${category.slug}`}
                                  onClick={handleLinkClick}
                                  className="flex-1 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                  <span className="text-sm font-medium">{category.name}</span>
                                </Link>
                      )}
                    </div>
                    
                    {/* Children (Subcategories) */}
                    {hasChildren && isExpanded && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
                        {category.children!.map((child) => {
                          const hasGrandchildren = child.children && child.children.length > 0;
                          const isChildExpanded = expandedSubCategory === child._id;
                          
                          return (
                            <div key={child._id || child.slug} className="py-1">
                              {/* Child Category */}
                              {hasGrandchildren ? (
                                <>
                                  <button
                                    onClick={() => toggleSubCategory(child._id || '')}
                                    className="w-full flex items-center justify-between p-2 text-left text-gray-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                  >
                                    <span className="text-sm">{child.name}</span>
                                    <ChevronIcon 
                                      className={`w-3 h-3 transition-transform ${
                                        isChildExpanded ? 'rotate-180' : ''
                                      }`} 
                                    />
                                  </button>
                                  
                                  {/* Grandchildren */}
                                  {isChildExpanded && (
                                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
                                      {child.children!.map((grandchild) => (
                                        <Link
                                          key={grandchild._id || grandchild.slug}
                                          href={`/products?category=${grandchild.slug}`}
                                          onClick={handleLinkClick}
                                          className="block p-2 text-xs text-gray-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                        >
                                          {grandchild.name}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <Link
                                  href={`/products?category=${child.slug}`}
                                  onClick={handleLinkClick}
                                  className="block p-2 text-sm text-gray-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                >
                                  {child.name}
                                </Link>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
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
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      className="text-gray-700 hover:text-gray-900"
    >
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

function BlogIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  );
}

function ConsultationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 22.5l-.394-1.933a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

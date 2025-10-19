import useSWR from 'swr';
import { api } from './api';

// ============================================
// SMART CACHING STRATEGIES FOR E-COMMERCE
// ============================================

// CRITICAL: Always fresh (prices, stock, cart, orders)
const CRITICAL_CONFIG = {
  refreshInterval: 10000,        // Auto-refresh every 10 seconds
  revalidateOnFocus: true,       // Check when user returns to tab
  revalidateOnMount: true,       // Always check when component mounts
  revalidateOnReconnect: true,   // Check when internet reconnects
  dedupingInterval: 5000,        // Only dedupe for 5 seconds
  errorRetryCount: 3,
  errorRetryInterval: 5000,
};

// NORMAL: Can be 1-2 min old (product lists, categories)
const NORMAL_CONFIG = {
  refreshInterval: 120000,       // Auto-refresh every 2 minutes
  revalidateOnFocus: false,      // Don't check on focus
  revalidateOnMount: true,       // Check when component mounts
  revalidateOnReconnect: true,   // Check when internet reconnects
  dedupingInterval: 60000,       // Dedupe for 1 minute
  errorRetryCount: 3,
  errorRetryInterval: 5000,
};

// STATIC: Can be 5-10 min old (categories, brands, blog)
const STATIC_CONFIG = {
  refreshInterval: 600000,       // Auto-refresh every 10 minutes
  revalidateOnFocus: false,      // Don't check on focus
  revalidateOnMount: false,      // Don't check on mount
  revalidateOnReconnect: true,   // Check when internet reconnects
  dedupingInterval: 300000,      // Dedupe for 5 minutes
  errorRetryCount: 3,
  errorRetryInterval: 5000,
};

// Generic fetcher function
const fetcher = async (url: string) => {
  const response = await api.get(url);
  return response.data;
};

// ============================================
// PRODUCT-RELATED HOOKS
// ============================================

// Product lists - NORMAL caching (2 min)
export function useProducts(params?: Record<string, any>) {
  const queryString = params ? new URLSearchParams(params).toString() : '';
  const url = queryString ? `/products?${queryString}` : '/products';
  
  return useSWR(url, fetcher, NORMAL_CONFIG);
}

// Single product - CRITICAL caching (always fresh for price/stock)
export function useProduct(slug: string) {
  return useSWR(
    slug ? `/products/${slug}` : null,
    fetcher,
    CRITICAL_CONFIG
  );
}

// Categories - STATIC caching (10 min - rarely changes)
export function useCategories() {
  return useSWR('/categories', fetcher, STATIC_CONFIG);
}

// Brands - STATIC caching (10 min - rarely changes)
export function useBrands() {
  return useSWR('/brands', fetcher, STATIC_CONFIG);
}

// ============================================
// USER-RELATED HOOKS
// ============================================

// User profile - CRITICAL caching (always fresh)
export function useUserProfile() {
  return useSWR('/users/profile', fetcher, CRITICAL_CONFIG);
}

// User orders - CRITICAL caching (always fresh for order status)
export function useUserOrders() {
  return useSWR('/users/orders', fetcher, CRITICAL_CONFIG);
}

// ============================================
// CART-RELATED HOOKS (MOST CRITICAL!)
// ============================================

// Cart - CRITICAL caching with aggressive refresh
export function useCart() {
  return useSWR('/cart', fetcher, {
    ...CRITICAL_CONFIG,
    refreshInterval: 5000, // Even more aggressive - 5 seconds!
  });
}

// ============================================
// ADMIN-RELATED HOOKS
// ============================================

// Admin stats - CRITICAL with auto-refresh for real-time dashboard
export function useAdminStats() {
  return useSWR('/admin/stats', fetcher, {
    ...CRITICAL_CONFIG,
    refreshInterval: 30000, // Refresh every 30 seconds for live stats
  });
}

// Admin products - NORMAL caching
export function useAdminProducts(params?: Record<string, any>) {
  const queryString = params ? new URLSearchParams(params).toString() : '';
  const url = queryString ? `/admin/products?${queryString}` : '/admin/products';
  
  return useSWR(url, fetcher, NORMAL_CONFIG);
}

// Admin orders - CRITICAL caching (orders update frequently)
export function useAdminOrders(params?: Record<string, any>) {
  const queryString = params ? new URLSearchParams(params).toString() : '';
  const url = queryString ? `/admin/orders?${queryString}` : '/admin/orders';
  
  return useSWR(url, fetcher, CRITICAL_CONFIG);
}

// ============================================
// BLOG-RELATED HOOKS
// ============================================

// Blog posts - STATIC caching (blog content rarely changes)
export function useBlogPosts(params?: Record<string, any>) {
  const queryString = params ? new URLSearchParams(params).toString() : '';
  const url = queryString ? `/blog?${queryString}` : '/blog';
  
  return useSWR(url, fetcher, STATIC_CONFIG);
}

// Single blog post - STATIC caching
export function useBlogPost(slug: string) {
  return useSWR(
    slug ? `/blog/${slug}` : null,
    fetcher,
    STATIC_CONFIG
  );
}

// ============================================
// SEARCH HOOK
// ============================================

// Search - NORMAL caching (search results can be briefly cached)
export function useSearch(query: string, params?: Record<string, any>) {
  const searchParams = { q: query, ...params };
  const queryString = new URLSearchParams(searchParams).toString();
  const url = queryString ? `/search?${queryString}` : null;
  
  return useSWR(url, fetcher, NORMAL_CONFIG);
}

// ============================================
// MANUAL CACHE CONTROL
// ============================================

// Export mutate for manual cache updates
// Use this after mutations (add to cart, update order, etc.)
export { mutate } from 'swr';

// Helper function to clear all SWR cache
export function clearAllCache() {
  if (typeof window !== 'undefined') {
    // Clear SWR cache
    const { cache } = require('swr');
    if (cache && typeof cache.clear === 'function') {
      cache.clear();
    }
  }
}

// Helper function to refresh specific data
export async function refreshData(key: string) {
  const { mutate } = await import('swr');
  return mutate(key);
}

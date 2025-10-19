import useSWR from 'swr';
import { api } from './api';

// SWR configuration
export const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 60000, // 1 minute
  errorRetryCount: 3,
  errorRetryInterval: 5000,
};

// Generic fetcher function
const fetcher = async (url: string) => {
  const response = await api.get(url);
  return response.data;
};

// Product-related hooks
export function useProducts(params?: Record<string, any>) {
  const queryString = params ? new URLSearchParams(params).toString() : '';
  const url = queryString ? `/products?${queryString}` : '/products';
  
  return useSWR(url, fetcher, {
    ...swrConfig,
    revalidateOnMount: true,
  });
}

export function useProduct(slug: string) {
  return useSWR(
    slug ? `/products/${slug}` : null,
    fetcher,
    {
      ...swrConfig,
      revalidateOnMount: true,
    }
  );
}

export function useCategories() {
  return useSWR('/categories', fetcher, {
    ...swrConfig,
    revalidateOnMount: true,
  });
}

export function useBrands() {
  return useSWR('/brands', fetcher, {
    ...swrConfig,
    revalidateOnMount: true,
  });
}

// User-related hooks
export function useUserProfile() {
  return useSWR('/users/profile', fetcher, {
    ...swrConfig,
    revalidateOnMount: true,
  });
}

export function useUserOrders() {
  return useSWR('/users/orders', fetcher, {
    ...swrConfig,
    revalidateOnMount: true,
  });
}

// Cart-related hooks
export function useCart() {
  return useSWR('/cart', fetcher, {
    ...swrConfig,
    revalidateOnMount: true,
  });
}

// Admin-related hooks
export function useAdminStats() {
  return useSWR('/admin/stats', fetcher, {
    ...swrConfig,
    revalidateOnMount: true,
    refreshInterval: 30000, // Refresh every 30 seconds
  });
}

export function useAdminProducts(params?: Record<string, any>) {
  const queryString = params ? new URLSearchParams(params).toString() : '';
  const url = queryString ? `/admin/products?${queryString}` : '/admin/products';
  
  return useSWR(url, fetcher, {
    ...swrConfig,
    revalidateOnMount: true,
  });
}

export function useAdminOrders(params?: Record<string, any>) {
  const queryString = params ? new URLSearchParams(params).toString() : '';
  const url = queryString ? `/admin/orders?${queryString}` : '/admin/orders';
  
  return useSWR(url, fetcher, {
    ...swrConfig,
    revalidateOnMount: true,
  });
}

// Blog-related hooks
export function useBlogPosts(params?: Record<string, any>) {
  const queryString = params ? new URLSearchParams(params).toString() : '';
  const url = queryString ? `/blog?${queryString}` : '/blog';
  
  return useSWR(url, fetcher, {
    ...swrConfig,
    revalidateOnMount: true,
  });
}

export function useBlogPost(slug: string) {
  return useSWR(
    slug ? `/blog/${slug}` : null,
    fetcher,
    {
      ...swrConfig,
      revalidateOnMount: true,
    }
  );
}

// Search hook
export function useSearch(query: string, params?: Record<string, any>) {
  const searchParams = { q: query, ...params };
  const queryString = new URLSearchParams(searchParams).toString();
  const url = queryString ? `/search?${queryString}` : null;
  
  return useSWR(url, fetcher, {
    ...swrConfig,
    revalidateOnMount: true,
  });
}

// Mutate function for manual cache updates
export { mutate } from 'swr';

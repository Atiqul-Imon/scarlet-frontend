import { 
  ApiResponse, 
  PaginatedResponse, 
  Product, 
  Category, 
  Cart, 
  Order, 
  User,
  ProductQuery,
  CheckoutFormData,
  LoginFormData,
  RegisterFormData,
  AuthUser,
  AppError,
  Address,
  CreateAddressData,
  WishlistItem
} from './types';

// Analytics Types
export interface AnalyticsEvent {
  sessionId: string;
  eventType: 'page_view' | 'product_view' | 'add_to_cart' | 'remove_from_cart' | 'checkout_start' | 'checkout_complete' | 'purchase' | 'search' | 'filter' | 'wishlist_add' | 'wishlist_remove';
  eventData: Record<string, any>;
}

export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: Array<{
    productId: string;
    name: string;
    revenue: number;
    quantity: number;
    orders: number;
  }>;
  topCategories: Array<{
    categoryId: string;
    name: string;
    revenue: number;
    quantity: number;
  }>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

export interface TrafficAnalytics {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{
    page: string;
    views: number;
    uniqueViews: number;
    averageTime: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    conversions: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    percentage: number;
    visitors: number;
  }>;
}

export interface RealTimeAnalytics {
  activeUsers: number;
  currentPageViews: number;
  recentEvents: any[];
  topPages: Array<{
    page: string;
    views: number;
  }>;
  topProducts: Array<{
    productId: string;
    views: number;
  }>;
  conversionFunnel: {
    visitors: number;
    addToCart: number;
    checkoutStart: number;
    checkoutComplete: number;
  };
}

// Inventory Types
export interface InventoryItem {
  _id?: string;
  productId: string;
  sku: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  costPrice: number;
  sellingPrice: number;
  supplier?: string;
  location?: string;
  lastRestocked?: string;
  lastSold?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockMovement {
  _id?: string;
  productId: string;
  sku: string;
  type: 'in' | 'out' | 'adjustment' | 'reserved' | 'unreserved';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  reference?: string;
  userId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LowStockAlert {
  _id?: string;
  productId: string;
  sku: string;
  currentStock: number;
  minStockLevel: number;
  severity: 'low' | 'critical' | 'out_of_stock';
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  recentlyRestocked: number;
  topSellingProducts: Array<{
    productId: string;
    sku: string;
    name: string;
    quantitySold: number;
    revenue: number;
  }>;
  stockMovements: Array<{
    date: string;
    movements: number;
    value: number;
  }>;
}

export const API_BASE = process.env['NEXT_PUBLIC_API_URL'] 
  ? `${process.env['NEXT_PUBLIC_API_URL']}/api`
  : process.env['NEXT_PUBLIC_API_BASE'] || 'http://localhost:4000/api';

// Unified API configuration - works for all devices
export const API_CONFIG = {
  baseURL: API_BASE,
  timeout: 30000, // 30 seconds - sufficient for all networks
  retries: 3,
  retryDelay: 1000, // 1 second between retries
  // Connection quality detection
  connectionQuality: 'auto' as 'auto' | 'fast' | 'slow',
};

// Unified fetch configuration - no device-specific logic
const getUnifiedFetchConfig = (init?: RequestInit): RequestInit => {
  return {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      // Always include these for better compatibility
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      ...init?.headers,
    },
    // Universal fetch options that work well on all devices
    mode: 'cors',
    credentials: 'include',
    keepalive: true,
  };
};

// Mobile connection test function
export async function testMobileConnection(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/mobile-debug`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Mobile connection test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic fetch function with type safety and enhanced error handling
export async function fetchJson<T = any>(
  path: string, 
  init?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${path}`;
  
  // Determine if this is dynamic content that should never be cached
  const isDynamicContent = /^\/(cart|orders|auth|users|checkout|wishlist|payments|addresses|cart-abandonment)/.test(path);
  
  const config: RequestInit = getUnifiedFetchConfig({
    ...init,
    // Only set no-store for dynamic content, let backend handle others
    ...(isDynamicContent && { cache: 'no-store' }),
  });

  try {
    console.log(`🌐 API Call: ${config.method || 'GET'} ${url}`);
    
    const response = await fetch(url, config);
    const body: ApiResponse<T> = await response.json();

    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`, body.error);
      throw new ApiError(
        body.error?.message || `Request failed with status ${response.status}`,
        response.status,
        body.error?.code,
        body.error?.field
      );
    }

    if (!body.success) {
      console.error(`❌ API Error: Request failed`, body.error);
      throw new ApiError(
        body.error?.message || 'Request failed',
        response.status,
        body.error?.code,
        body.error?.field
      );
    }

    console.log(`✅ API Success: ${config.method || 'GET'} ${url}`);
    return body.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error(`🔥 Network Error:`, error);
    // Network or parsing error
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

// Check if token is expired
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return true; // If we can't parse the token, consider it expired
  }
}

// Token refresh function
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    console.log('❌ No refresh token available');
    return null;
  }

  try {
    console.log('🔄 Attempting to refresh access token...');
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      console.log('❌ Token refresh failed:', response.status);
      // Clear invalid tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Dispatch a custom event to notify the auth context
      window.dispatchEvent(new CustomEvent('tokenRefreshFailed'));
      return null;
    }

    const data = await response.json();
    if (data.success && data.data.tokens) {
      const { accessToken, refreshToken: newRefreshToken } = data.data.tokens;
      
      // Store new tokens
      localStorage.setItem('accessToken', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      
      console.log('✅ Access token refreshed successfully');
      return accessToken;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Token refresh error:', error);
    // Clear invalid tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
}

// Authenticated fetch function with automatic token refresh
export async function fetchJsonAuth<T = any>(
  path: string,
  init?: RequestInit
): Promise<T> {
  let token = localStorage.getItem('accessToken');
  
  console.log('🔐 Auth Debug:', {
    hasToken: !!token,
    tokenLength: token?.length,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token',
    path,
    method: init?.method || 'GET'
  });
  
  // Check if token is expired and refresh proactively
  if (token && isTokenExpired(token)) {
    console.log('⏰ Token is expired, refreshing proactively...');
    const newToken = await refreshAccessToken();
    if (newToken) {
      token = newToken;
    } else {
      // If refresh failed, clear tokens and let the request fail
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      token = null;
    }
  }
  
  // First attempt with current token
  try {
    return await fetchJson<T>(path, {
      ...init,
      headers: {
        ...init?.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  } catch (error: any) {
    // If we get a 401 and have a refresh token, try to refresh
    if (error.status === 401 && localStorage.getItem('refreshToken')) {
      console.log('🔄 Got 401, attempting token refresh...');
      
      const newToken = await refreshAccessToken();
      if (newToken) {
        console.log('🔄 Retrying request with new token...');
        // Retry the original request with the new token
        return await fetchJson<T>(path, {
          ...init,
          headers: {
            ...init?.headers,
            Authorization: `Bearer ${newToken}`,
          },
        });
      }
    }
    
    // If refresh failed or no refresh token, throw the original error
    throw error;
  }
}

// Product API functions
export const productApi = {
  // Get all products with optional filters
  getProducts: (query?: ProductQuery): Promise<PaginatedResponse<Product>> => {
    const searchParams = new URLSearchParams();
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }
    
    const queryString = searchParams.toString();
    const path = `/catalog/products${queryString ? `?${queryString}` : ''}`;
    
    return fetchJson<PaginatedResponse<Product>>(path);
  },

  // Get single product by slug
  getProductBySlug: (slug: string): Promise<Product> => {
    return fetchJson<Product>(`/catalog/products/${slug}`);
  },

  // Get product by ID
  getProductById: (id: string): Promise<Product> => {
    return fetchJson<Product>(`/catalog/products/${id}`);
  },

  // Search products
  searchProducts: (query: string, filters?: Partial<ProductQuery>): Promise<PaginatedResponse<Product>> => {
    const searchParams = new URLSearchParams({ search: query });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    
    return fetchJson<PaginatedResponse<Product>>(`/catalog/products/search?${searchParams.toString()}`);
  },
};

// Category API functions
export const categoryApi = {
  // Get all categories
  getCategories: (): Promise<Category[]> => {
    return fetchJson<Category[]>('/catalog/categories');
  },

  // Get category by slug
  getCategoryBySlug: (slug: string): Promise<Category> => {
    return fetchJson<Category>(`/catalog/categories/slug/${slug}`);
  },

  // Get products in category
  getCategoryProducts: (categoryId: string, query?: Partial<ProductQuery>): Promise<PaginatedResponse<Product>> => {
    const searchParams = new URLSearchParams();
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    
    const queryString = searchParams.toString();
    const path = `/catalog/categories/${categoryId}/products${queryString ? `?${queryString}` : ''}`;
    
    return fetchJson<PaginatedResponse<Product>>(path);
  },

  // Create category
  createCategory: (categoryData: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>): Promise<Category> => {
    return fetchJsonAuth<Category>('/catalog/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });
  },

  // Update category
  updateCategory: (categoryId: string, categoryData: Partial<Category>): Promise<Category> => {
    return fetchJsonAuth<Category>(`/catalog/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });
  },

  // Delete category
  deleteCategory: (categoryId: string): Promise<void> => {
    return fetchJsonAuth<void>(`/catalog/categories/${categoryId}`, {
      method: 'DELETE',
    });
  },
};

// Cart API functions
export const cartApi = {
  // Get current user's cart
  getCart: (): Promise<Cart> => {
    return fetchJsonAuth<Cart>('/cart');
  },

  // Add item to cart
  addItem: (productId: string, quantity: number): Promise<Cart> => {
    return fetchJsonAuth<Cart>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  // Update item quantity
  updateItem: (productId: string, quantity: number): Promise<Cart> => {
    return fetchJsonAuth<Cart>('/cart/items', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  // Remove item from cart
  removeItem: (productId: string): Promise<Cart> => {
    return fetchJsonAuth<Cart>(`/cart/items/${productId}`, {
      method: 'DELETE',
    });
  },

  // Clear entire cart
  clearCart: (): Promise<Cart> => {
    return fetchJsonAuth<Cart>('/cart', {
      method: 'DELETE',
    });
  },

  // Guest cart functions
  getGuestCart: (sessionId: string): Promise<Cart> => {
    return fetchJson<Cart>(`/cart/guest?sessionId=${sessionId}`);
  },

  addGuestItem: (sessionId: string, productId: string, quantity: number): Promise<Cart> => {
    return fetchJson<Cart>('/cart/guest/items', {
      method: 'POST',
      headers: {
        'X-Session-ID': sessionId,
      },
      body: JSON.stringify({ productId, quantity }),
    });
  },

  updateGuestItem: (sessionId: string, productId: string, quantity: number): Promise<Cart> => {
    return fetchJson<Cart>('/cart/guest/items', {
      method: 'PUT',
      headers: {
        'X-Session-ID': sessionId,
      },
      body: JSON.stringify({ productId, quantity }),
    });
  },

  removeGuestItem: (sessionId: string, productId: string): Promise<Cart> => {
    return fetchJson<Cart>(`/cart/guest/items/${productId}`, {
      method: 'DELETE',
      headers: {
        'X-Session-ID': sessionId,
      },
    });
  },

  // Clear guest cart
  clearGuestCart: (sessionId: string): Promise<Cart> => {
    return fetchJson<Cart>('/cart/guest', {
      method: 'DELETE',
      headers: {
        'X-Session-ID': sessionId,
      },
    });
  },

  // Merge guest cart to user cart
  mergeGuestCart: (sessionId: string): Promise<Cart> => {
    return fetchJsonAuth<Cart>('/cart/merge-guest', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  },
};

// Order API functions
export const orderApi = {
  // Create order from cart
  createOrder: (checkoutData: CheckoutFormData): Promise<Order> => {
    return fetchJsonAuth<Order>('/orders/create', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  },

  // Create guest order from cart
  createGuestOrder: (sessionId: string, checkoutData: CheckoutFormData): Promise<Order> => {
    return fetchJson<Order>('/orders/guest/create', {
      method: 'POST',
      headers: {
        'X-Session-ID': sessionId,
      },
      body: JSON.stringify({ ...checkoutData, sessionId }),
    });
  },

  // Get user's orders
  getOrders: (page = 1, limit = 10): Promise<PaginatedResponse<Order>> => {
    return fetchJsonAuth<PaginatedResponse<Order>>(`/orders?page=${page}&limit=${limit}`);
  },

  // Get specific order
  getOrder: (orderId: string): Promise<Order> => {
    return fetchJsonAuth<Order>(`/orders/${orderId}`);
  },

  // Cancel order
  cancelOrder: (orderId: string, reason?: string): Promise<Order> => {
    return fetchJsonAuth<Order>(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

// Address API functions
export const addressApi = {
  // Get user's addresses
  getAddresses: (): Promise<Address[]> => {
    return fetchJsonAuth<Address[]>('/addresses');
  },

  // Get specific address
  getAddress: (addressId: string): Promise<Address> => {
    return fetchJsonAuth<Address>(`/addresses/${addressId}`);
  },

  // Create new address
  createAddress: (addressData: CreateAddressData): Promise<Address> => {
    return fetchJsonAuth<Address>('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  },

  // Update address
  updateAddress: (addressId: string, addressData: Partial<CreateAddressData>): Promise<Address> => {
    return fetchJsonAuth<Address>(`/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  },

  // Delete address
  deleteAddress: (addressId: string): Promise<{ deleted: boolean }> => {
    return fetchJsonAuth<{ deleted: boolean }>(`/addresses/${addressId}`, {
      method: 'DELETE',
    });
  },

  // Set default address
  setDefaultAddress: (addressId: string): Promise<Address> => {
    return fetchJsonAuth<Address>(`/addresses/${addressId}/default`, {
      method: 'PATCH',
    });
  },
};

// Wishlist API functions
export const wishlistApi = {
  // Get user's wishlist
  getWishlist: (): Promise<{ items: WishlistItem[]; total: number }> => {
    return fetchJsonAuth<{ items: WishlistItem[]; total: number }>('/wishlist');
  },

  // Add item to wishlist
  addToWishlist: (productId: string): Promise<WishlistItem> => {
    return fetchJsonAuth<WishlistItem>('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  // Remove item from wishlist
  removeFromWishlist: (productId: string): Promise<{ removed: boolean }> => {
    return fetchJsonAuth<{ removed: boolean }>(`/wishlist/${productId}`, {
      method: 'DELETE',
    });
  },

  // Clear entire wishlist
  clearWishlist: (): Promise<{ cleared: boolean; count: number }> => {
    return fetchJsonAuth<{ cleared: boolean; count: number }>('/wishlist', {
      method: 'DELETE',
    });
  },

  // Check if product is in wishlist
  checkWishlistStatus: (productId: string): Promise<{ isInWishlist: boolean }> => {
    return fetchJsonAuth<{ isInWishlist: boolean }>(`/wishlist/${productId}/status`);
  },

  // Get wishlist statistics
  getWishlistStats: (): Promise<{ count: number }> => {
    return fetchJsonAuth<{ count: number }>('/wishlist/stats');
  },
};

// Authentication API functions
export const authApi = {
  // Login user
  login: (credentials: LoginFormData): Promise<AuthUser> => {
    return fetchJson<AuthUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Register user
  register: (userData: RegisterFormData): Promise<AuthUser> => {
    return fetchJson<AuthUser>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Refresh token
  refreshToken: (refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> => {
    return fetchJson<{ accessToken: string; expiresIn: number }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  // Logout
  logout: (): Promise<{ success: boolean }> => {
    return fetchJsonAuth<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    });
  },

  // Get current user profile
  getProfile: (): Promise<User> => {
    return fetchJsonAuth<User>('/users/me');
  },

  // Update user profile
  updateProfile: (updates: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'preferences'>>): Promise<User> => {
    return fetchJsonAuth<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Request password reset
  requestPasswordReset: (email: string): Promise<{ success: boolean }> => {
    return fetchJson<{ success: boolean }>('/auth/password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Reset password
  resetPassword: (token: string, newPassword: string): Promise<{ success: boolean }> => {
    return fetchJson<{ success: boolean }>('/auth/password-reset/confirm', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },
};

// Utility functions for handling API responses
export const apiUtils = {
  // Handle API errors consistently
  handleApiError: (error: unknown): AppError => {
    if (error instanceof ApiError) {
      const result: AppError = {
        message: error.message,
      };
      if (error.code) result.code = error.code;
      if (error.status) result.status = error.status;
      if (error.field) result.field = error.field;
      return result;
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'UNKNOWN_ERROR',
      };
    }

    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };
  },

  // Format validation errors
  formatValidationErrors: (error: ApiError): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (error.field && error.message) {
      errors[error.field] = error.message;
    }
    
    return errors;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },

  // Get user from token
  getUserFromToken: (): Partial<User> | null => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    return {
      _id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    } catch {
      return null;
    }
  },

  // Store auth tokens
  storeTokens: (tokens: { accessToken: string; refreshToken: string }): void => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  },

  // Clear auth tokens
  clearTokens: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

// Admin API functions
export const adminApi = {
  // Dashboard
  dashboard: {
    getStats: (): Promise<any> => {
      return fetchJsonAuth('/admin/dashboard/stats');
    }
  },

  // User Management
  users: {
    getUsers: (filters: any = {}): Promise<any> => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const queryString = params.toString();
      const url = `/admin/users${queryString ? `?${queryString}` : ''}`;
      
      return fetchJsonAuth(url);
    },

    updateUserRole: (userId: string, role: 'admin' | 'staff' | 'customer'): Promise<{ message: string }> => {
      return fetchJsonAuth(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role })
      });
    },

    deleteUser: (userId: string): Promise<{ message: string }> => {
      return fetchJsonAuth(`/admin/users/${userId}`, {
        method: 'DELETE'
      });
    }
  },

  // Product Management
  products: {
    getProducts: (filters: any = {}): Promise<any> => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const queryString = params.toString();
      const url = `/admin/products${queryString ? `?${queryString}` : ''}`;
      
      return fetchJsonAuth(url);
    },

    getProduct: (productId: string): Promise<any> => {
      return fetchJsonAuth(`/admin/products/${productId}`);
    },

    createProduct: (productData: any): Promise<any> => {
      return fetchJsonAuth('/admin/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      });
    },

    updateProduct: (productId: string, productData: any): Promise<any> => {
      return fetchJsonAuth(`/admin/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      });
    },

    updateProductStock: (productId: string, stock: number): Promise<{ message: string }> => {
      return fetchJsonAuth(`/admin/products/${productId}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ stock })
      });
    },

    deleteProduct: (productId: string): Promise<{ message: string }> => {
      return fetchJsonAuth(`/admin/products/${productId}`, {
        method: 'DELETE'
      });
    }
  },

  // Order Management
  orders: {
    getOrders: (filters: any = {}): Promise<any> => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const queryString = params.toString();
      const url = `/admin/orders${queryString ? `?${queryString}` : ''}`;
      
      return fetchJsonAuth(url);
    },

    getOrderById: (orderId: string): Promise<any> => {
      return fetchJsonAuth(`/admin/orders/${orderId}`);
    },

    updateOrderStatus: (
      orderId: string, 
      status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded',
      trackingNumber?: string
    ): Promise<{ message: string }> => {
      return fetchJsonAuth(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, trackingNumber })
      });
    }
  },

  // Analytics
  analytics: {
    getSalesAnalytics: (dateFrom: string, dateTo: string): Promise<any> => {
      const params = new URLSearchParams({ dateFrom, dateTo });
      return fetchJsonAuth(`/admin/analytics/sales?${params.toString()}`);
    },

    getUserAnalytics: (): Promise<any> => {
      return fetchJsonAuth('/admin/analytics/users');
    }
  },

  // System Settings
  settings: {
    getSettings: (): Promise<any> => {
      return fetchJsonAuth('/admin/settings');
    },

    updateSettings: (settings: any): Promise<{ message: string }> => {
      return fetchJsonAuth('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify(settings)
      });
    }
  },

  // Category Management
  categories: {
    getCategories: (filters: any = {}): Promise<any> => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const queryString = params.toString();
      const url = `/admin/categories${queryString ? `?${queryString}` : ''}`;
      
      return fetchJsonAuth(url);
    },

    getCategory: (categoryId: string): Promise<any> => {
      return fetchJsonAuth(`/admin/categories/${categoryId}`);
    },

    createCategory: (categoryData: any): Promise<any> => {
      return fetchJsonAuth('/admin/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData)
      });
    },

    updateCategory: (categoryId: string, categoryData: any): Promise<any> => {
      return fetchJsonAuth(`/admin/categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData)
      });
    },

    updateCategoryStatus: (categoryId: string, isActive: boolean): Promise<{ message: string }> => {
      return fetchJsonAuth(`/admin/categories/${categoryId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive })
      });
    },

    deleteCategory: (categoryId: string): Promise<{ message: string }> => {
      return fetchJsonAuth(`/admin/categories/${categoryId}`, {
        method: 'DELETE'
      });
    }
  },

  // Activity Logs
  logs: {
    getActivityLogs: (page: number = 1, limit: number = 50): Promise<any> => {
      const params = new URLSearchParams({ 
        page: page.toString(), 
        limit: limit.toString() 
      });
      return fetchJsonAuth(`/admin/logs/activity?${params.toString()}`);
    }
  }
};

// Analytics API functions
export const analyticsApi = {
  // Track analytics event
  trackEvent: (event: AnalyticsEvent): Promise<{ success: boolean }> => {
    return fetchJson('/analytics/track', {
      method: 'POST',
      body: JSON.stringify(event)
    });
  },

  // Get analytics events
  getEvents: (filters: {
    startDate?: string;
    endDate?: string;
    eventType?: string;
    userId?: string;
    productId?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ events: any[]; total: number }> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });
    return fetchJsonAuth(`/analytics/events?${params.toString()}`);
  },

  // Get sales analytics
  getSalesAnalytics: (startDate?: string, endDate?: string): Promise<SalesAnalytics> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return fetchJsonAuth(`/analytics/sales?${params.toString()}`);
  },

  // Get traffic analytics
  getTrafficAnalytics: (startDate?: string, endDate?: string): Promise<TrafficAnalytics> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return fetchJsonAuth(`/analytics/traffic?${params.toString()}`);
  },

  // Get real-time analytics
  getRealTimeAnalytics: (): Promise<RealTimeAnalytics> => {
    return fetchJsonAuth('/analytics/realtime');
  },

  // Get user behavior
  getUserBehavior: (userId: string): Promise<any> => {
    return fetchJsonAuth(`/analytics/user/${userId}`);
  },

  // Get dashboard analytics (combined)
  getDashboardAnalytics: (startDate?: string, endDate?: string): Promise<{
    sales: SalesAnalytics;
    traffic: TrafficAnalytics;
    summary: {
      totalRevenue: number;
      totalOrders: number;
      totalVisitors: number;
      conversionRate: number;
      averageOrderValue: number;
      bounceRate: number;
    };
  }> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return fetchJsonAuth(`/analytics/dashboard?${params.toString()}`);
  }
};

// Inventory API functions
export const inventoryApi = {
  // Get inventory stats
  getStats: (): Promise<InventoryStats> => {
    return fetchJsonAuth('/inventory/stats');
  },

  // Get all inventory items
  getItems: (page: number = 1, limit: number = 50): Promise<{ items: InventoryItem[]; total: number }> => {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      limit: limit.toString() 
    });
    return fetchJsonAuth(`/inventory?${params.toString()}`);
  },

  // Get specific inventory item
  getItem: (productId: string): Promise<InventoryItem> => {
    return fetchJsonAuth(`/inventory/${productId}`);
  },

  // Create inventory item
  createItem: (data: {
    productId: string;
    sku: string;
    currentStock: number;
    minStockLevel: number;
    maxStockLevel: number;
    reorderPoint: number;
    costPrice: number;
    sellingPrice: number;
    supplier?: string;
    location?: string;
  }): Promise<InventoryItem> => {
    return fetchJsonAuth('/inventory', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Update inventory item
  updateItem: (productId: string, updates: Partial<InventoryItem>): Promise<InventoryItem> => {
    return fetchJsonAuth(`/inventory/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // Adjust stock
  adjustStock: (productId: string, data: {
    quantity: number;
    type: 'in' | 'out' | 'adjustment';
    reason: string;
    reference?: string;
    notes?: string;
  }): Promise<InventoryItem> => {
    return fetchJsonAuth(`/inventory/${productId}/adjust`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Reserve stock
  reserveStock: (productId: string, quantity: number): Promise<{ success: boolean }> => {
    return fetchJsonAuth(`/inventory/${productId}/reserve`, {
      method: 'POST',
      body: JSON.stringify({ quantity })
    });
  },

  // Unreserve stock
  unreserveStock: (productId: string, quantity: number): Promise<{ success: boolean }> => {
    return fetchJsonAuth(`/inventory/${productId}/unreserve`, {
      method: 'POST',
      body: JSON.stringify({ quantity })
    });
  },

  // Get stock movements
  getStockMovements: (productId?: string, page: number = 1, limit: number = 50): Promise<{ movements: StockMovement[]; total: number }> => {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      limit: limit.toString() 
    });
    const url = productId ? `/inventory/${productId}/movements` : '/inventory/movements';
    return fetchJsonAuth(`${url}?${params.toString()}`);
  },

  // Get low stock alerts
  getLowStockAlerts: (resolved: boolean = false): Promise<LowStockAlert[]> => {
    const params = new URLSearchParams({ resolved: resolved.toString() });
    return fetchJsonAuth(`/inventory/alerts/low-stock?${params.toString()}`);
  },

  // Resolve low stock alert
  resolveAlert: (alertId: string, resolvedBy: string): Promise<{ success: boolean }> => {
    return fetchJsonAuth(`/inventory/alerts/${alertId}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ resolvedBy })
    });
  }
};



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
  AppError
} from './types';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';

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
  const config: RequestInit = {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  };

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
    const payload = JSON.parse(atob(token.split('.')[1]));
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
  clearCart: (): Promise<{ success: boolean }> => {
    return fetchJsonAuth<{ success: boolean }>('/cart', {
      method: 'DELETE',
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
      return {
        message: error.message,
        code: error.code,
        status: error.status,
        field: error.field,
      };
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
      const payload = JSON.parse(atob(token.split('.')[1]));
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
      const payload = JSON.parse(atob(token.split('.')[1]));
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

    createProduct: (productData: any): Promise<any> => {
      return fetchJsonAuth('/admin/products', {
        method: 'POST',
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



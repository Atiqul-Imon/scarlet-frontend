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

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';

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

// Generic fetch function with type safety
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
    const response = await fetch(url, config);
    const body: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new ApiError(
        body.error?.message || `Request failed with status ${response.status}`,
        response.status,
        body.error?.code,
        body.error?.field
      );
    }

    if (!body.success) {
      throw new ApiError(
        body.error?.message || 'Request failed',
        response.status,
        body.error?.code,
        body.error?.field
      );
    }

    return body.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or parsing error
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

// Authenticated fetch function
export async function fetchJsonAuth<T = any>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = localStorage.getItem('accessToken');
  
  return fetchJson<T>(path, {
    ...init,
    headers: {
      ...init?.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
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
    return fetchJson<Product>(`/catalog/products/slug/${slug}`);
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



"use client";
import * as React from 'react';
import { 
  User, 
  Cart, 
  ToastMessage, 
  AppError,
  AuthUser,
  LoginFormData,
  RegisterFormData,
  WishlistItem
} from './types';
import { authApi, cartApi, apiUtils, wishlistApi } from './api';
import { stringUtils } from './utils';
import { logger } from './logger';

// Toast Context
interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = stringUtils.generateId();
    const newToast: ToastMessage = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  const value = React.useMemo(() => ({
    toasts,
    addToast,
    removeToast,
    clearToasts,
  }), [toasts, addToast, removeToast, clearToasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

// Auth Context
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isRefreshing: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginFormData) => Promise<void>;
  register: (userData: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const { addToast } = useToast();

  const isAuthenticated = React.useMemo(() => user !== null, [user]);

  const login = React.useCallback(async (credentials: LoginFormData): Promise<void> => {
    setLoading(true);
    try {
      const authResult: AuthUser = await authApi.login(credentials);
      setUser(authResult.user);
      apiUtils.storeTokens(authResult.tokens);
      
      addToast({
        type: 'success',
        title: 'Welcome back!',
        message: 'You have been successfully logged in.',
      });
    } catch (error) {
      const appError = apiUtils.handleApiError(error);
      addToast({
        type: 'error',
        title: 'Login failed',
        message: appError.message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const register = React.useCallback(async (userData: RegisterFormData): Promise<void> => {
    setLoading(true);
    try {
      const authResult: AuthUser = await authApi.register(userData);
      setUser(authResult.user);
      apiUtils.storeTokens(authResult.tokens);
      
      addToast({
        type: 'success',
        title: 'Welcome to Scarlet!',
        message: 'Your account has been created successfully.',
      });
    } catch (error) {
      const appError = apiUtils.handleApiError(error);
      addToast({
        type: 'error',
        title: 'Registration failed',
        message: appError.message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const logout = React.useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      await authApi.logout();
      setUser(null);
      apiUtils.clearTokens();
      // Clear cached user data
      sessionStorage.removeItem('cachedUser');
      
      addToast({
        type: 'success',
        title: 'Logged out',
        message: 'You have been successfully logged out.',
      });
    } catch (error) {
      // Even if logout fails on server, clear local state
      setUser(null);
      apiUtils.clearTokens();
      // Clear cached user data
      sessionStorage.removeItem('cachedUser');
      
      addToast({
        type: 'warning',
        title: 'Logout completed',
        message: 'You have been logged out locally.',
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Handle token refresh failure by logging out
  const handleTokenRefreshFailure = React.useCallback(() => {
    logger.info('Token refresh failed, logging out user');
    setUser(null);
    apiUtils.clearTokens();
    addToast({
      type: 'error',
      title: 'Session expired',
      message: 'Your session has expired. Please log in again.',
    });
  }, [addToast]);

  const updateProfile = React.useCallback(async (updates: Partial<User>): Promise<void> => {
    if (!user) return;
    
    try {
      const updatedUser = await authApi.updateProfile(updates);
      setUser(updatedUser);
      
      addToast({
        type: 'success',
        title: 'Profile updated',
        message: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      const appError = apiUtils.handleApiError(error);
      addToast({
        type: 'error',
        title: 'Update failed',
        message: appError.message,
      });
      throw error;
    }
  }, [user, addToast]);

  // Optimized refreshUser with non-blocking token refresh
  const refreshUser = React.useCallback(async (): Promise<void> => {
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    // If no tokens at all, user is not authenticated
    if (!token && !refreshToken) {
      setLoading(false);
      return;
    }

    // Check if we have cached user data
    const cachedUser = sessionStorage.getItem('cachedUser');
    if (cachedUser && token) {
      try {
        const userData = JSON.parse(cachedUser);
        // Check if token is still valid (not expired)
        if (!apiUtils.isTokenExpired(token)) {
          setUser(userData);
          setLoading(false);
          // Refresh user data in background
          refreshUserInBackground();
          return;
        }
      } catch (error) {
        // Invalid cached data, continue with normal flow
        sessionStorage.removeItem('cachedUser');
      }
    }

    try {
      // First try to get user profile with current token
      const currentUser = await authApi.getProfile();
      setUser(currentUser);
      // Cache user data for faster subsequent loads
      sessionStorage.setItem('cachedUser', JSON.stringify(currentUser));
    } catch (error: any) {
      logger.debug('Profile fetch failed, attempting token refresh...', { error });
      
      // If we have a refresh token, try to refresh the access token
      if (refreshToken) {
        setIsRefreshing(true);
        try {
          logger.debug('Attempting token refresh with refresh token', { tokenPreview: refreshToken.substring(0, 20) + '...' });
          const response = await fetch('/api/proxy/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          logger.debug('Refresh token response status', { status: response.status });

          if (response.ok) {
            const data = await response.json();
            logger.debug('Refresh token response', { data });
            if (data.success && data.data && data.data.tokens) {
              const { accessToken, refreshToken: newRefreshToken } = data.data.tokens;
              
              // Store new tokens
              localStorage.setItem('accessToken', accessToken);
              if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
              }
              
              // Try to get user profile again with new token
              const currentUser = await authApi.getProfile();
              setUser(currentUser);
              // Cache user data
              sessionStorage.setItem('cachedUser', JSON.stringify(currentUser));
              logger.success('Token refreshed and user profile loaded successfully');
              return;
            } else {
              logger.error('Invalid refresh token response', data);
            }
          } else {
            logger.error('Refresh token request failed', { status: response.status, statusText: response.statusText });
          }
        } catch (refreshError) {
          logger.error('Token refresh failed', refreshError);
        } finally {
          setIsRefreshing(false);
        }
      }
      
      // If refresh failed or no refresh token, clear everything
      logger.info('Authentication failed, clearing user session');
      setUser(null);
      apiUtils.clearTokens();
      sessionStorage.removeItem('cachedUser');
    } finally {
      setLoading(false);
    }
  }, []);

  // Background user refresh without blocking UI
  const refreshUserInBackground = React.useCallback(async (): Promise<void> => {
    try {
      const currentUser = await authApi.getProfile();
      setUser(currentUser);
      sessionStorage.setItem('cachedUser', JSON.stringify(currentUser));
    } catch (error) {
      // Silently fail for background refresh
      logger.debug('Background user refresh failed', error);
    }
  }, []);

  // Initialize auth state
  React.useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Listen for token refresh failures
  React.useEffect(() => {
    const handleTokenRefreshFailureEvent = () => {
      logger.log('Token refresh failed event received');
      handleTokenRefreshFailure();
    };

    window.addEventListener('tokenRefreshFailed', handleTokenRefreshFailureEvent);
    return () => {
      window.removeEventListener('tokenRefreshFailed', handleTokenRefreshFailureEvent);
    };
  }, [handleTokenRefreshFailure]);

  // Add a retry mechanism for failed authentication
  const retryAuthentication = React.useCallback(async () => {
    logger.log('Retrying authentication...');
    setLoading(true);
    await refreshUser();
  }, [refreshUser]);

  const value = React.useMemo(() => ({
    user,
    loading,
    isRefreshing,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    setUser,
  }), [user, loading, isRefreshing, isAuthenticated, login, register, logout, updateProfile, refreshUser, setUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Guest cart helper functions
// REMOVED: GUEST_CART_KEY - cart data now stored only in database
// Cart data is no longer stored in localStorage (industry standard)
// Only sessionId is stored in localStorage to identify guest carts
const SESSION_ID_KEY = 'scarlet_session_id';

// Generate or get session ID with mobile-specific handling
const getSessionId = (): string => {
  if (typeof window === 'undefined') {
    return 'server-session';
  }
  
  try {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      // Generate a more robust session ID for mobile devices
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      const userAgent = navigator.userAgent.substring(0, 10);
      sessionId = `guest_${timestamp}_${random}_${userAgent.replace(/[^a-zA-Z0-9]/g, '')}`;
      
      try {
        localStorage.setItem(SESSION_ID_KEY, sessionId);
        logger.log('Generated new session ID for mobile:', sessionId);
      } catch (storageError) {
        logger.warn('Failed to store session ID in localStorage:', storageError);
        // Fallback to memory-only session ID
        sessionId = `memory_${timestamp}_${random}`;
      }
    }
    return sessionId;
  } catch (error) {
    logger.error('Error generating session ID:', error);
    // Fallback session ID
    return `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }
};

// REMOVED: Cart storage from localStorage (database-only now)
// Cart data is stored only in database (industry standard)
// localStorage is only used for sessionId, not cart data

const createEmptyGuestCart = (): Cart => {
  return {
    _id: 'guest',
    userId: 'guest',
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Helper to clean up old localStorage cart data (one-time cleanup)
const cleanupOldCartData = (): void => {
  if (typeof window !== 'undefined') {
    try {
      // Remove old cart data if it exists (one-time migration cleanup)
      const oldCartData = localStorage.getItem('scarlet_guest_cart');
      if (oldCartData) {
        localStorage.removeItem('scarlet_guest_cart');
        logger.log('Cleaned up old localStorage cart data');
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }
};

// Cart Context
interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  error: AppError | null;
  itemCount: number;
  totalPrice: number;
  sessionId: string;
  addItem: (productId: string, quantity?: number, selectedSize?: string, selectedColor?: string) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: (silent?: boolean) => Promise<void>;
  resetCart: () => void; // For debugging and cleanup
  markCartAsAbandoned: () => Promise<void>; // For cart abandonment tracking
}

const CartContext = React.createContext<CartContextValue | undefined>(undefined);

export const useCart = (): CartContextValue => {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize cart state as null - will be loaded properly in useEffect
  const [cart, setCart] = React.useState<Cart | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<AppError | null>(null);
  const [sessionId] = React.useState(() => getSessionId());
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();

  // Clean up old localStorage cart data on mount (one-time migration)
  React.useEffect(() => {
    cleanupOldCartData();
  }, []);

  // Load cart on mount and when authentication state changes
  // Database-only approach: Always load from backend (industry standard)
  React.useEffect(() => {
    logger.log('Cart provider effect triggered, isAuthenticated:', isAuthenticated, 'sessionId:', sessionId);
    
    const loadCart = async () => {
      // Only set loading if we don't have a cart yet, to avoid flicker
      if (!cart) {
        setLoading(true);
      }
      setError(null);
      
      try {
        if (isAuthenticated) {
          // For authenticated users, always load fresh from backend
          const userCart = await cartApi.getCart();
          logger.log('Loaded user cart from backend:', userCart);
          setCart(userCart);
        } else {
          // For guest users: Database-only approach (industry standard)
          // Always load from backend - no localStorage fallback
          try {
            const guestCart = await cartApi.getGuestCart(sessionId);
            logger.log('Loaded guest cart from backend:', guestCart);
            setCart(guestCart);
          } catch (error) {
            logger.error('Failed to load guest cart from backend:', error);
            // No localStorage fallback - database is single source of truth
            // Show error but set empty cart
            const emptyCart = createEmptyGuestCart();
            setCart(emptyCart);
            
            // Show user-friendly error message
            addToast({
              type: 'warning',
              title: 'Cannot load cart',
              message: 'Please check your connection and try again.'
            });
            
            // Retry after a delay
            setTimeout(async () => {
              try {
                const retryCart = await cartApi.getGuestCart(sessionId);
                logger.log('Retry sync successful:', retryCart);
                setCart(retryCart);
              } catch (retryError) {
                logger.log('Retry sync failed');
              }
            }, 3000);
          }
        }
      } catch (error) {
        logger.error('Failed to load cart:', error);
        setError(apiUtils.handleApiError(error));
        // Set empty cart as fallback
        const emptyCart = isAuthenticated 
          ? { _id: 'empty', userId: user?._id || '', items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : createEmptyGuestCart();
        setCart(emptyCart);
      } finally {
        setLoading(false);
      }
    };
    
    loadCart();
  }, [isAuthenticated, sessionId, user, addToast]);


  // Handle authentication changes
  React.useEffect(() => {
    if (isAuthenticated && cart?.userId === 'guest') {
      // User logged in, sync guest cart with server
      logger.log('User logged in, syncing guest cart with server');
      syncGuestCartWithServer();
    } else if (!isAuthenticated && (!cart || cart.userId !== 'guest')) {
      // User logged out, load guest cart from backend (database-only)
      logger.log('User logged out, loading guest cart from backend');
      const loadGuestCart = async () => {
        try {
          const guestCart = await cartApi.getGuestCart(sessionId);
          setCart(guestCart);
        } catch (error) {
          logger.error('Failed to load guest cart:', error);
          setCart(createEmptyGuestCart());
        }
      };
      loadGuestCart();
    }
  }, [isAuthenticated, sessionId]);

  const itemCount = React.useMemo(() => {
    if (!cart || !cart.items || !Array.isArray(cart.items)) {
      return 0;
    }
    return cart.items.reduce((total, item) => {
      if (!item || typeof item.quantity !== 'number' || item.quantity < 0) {
        return total;
      }
      return total + item.quantity;
    }, 0);
  }, [cart]);

  const totalPrice = React.useMemo(() => {
    // Calculate real total price from cart items with product data
    if (!cart?.items || !Array.isArray(cart.items)) {
      return 0;
    }
    
    return cart.items.reduce((total, item) => {
      // Use product price if available, otherwise fallback to 0
      const price = item.product?.price?.amount || 0;
      return total + (price * item.quantity);
    }, 0);
  }, [cart]);

  const executeCartOperation = React.useCallback(async <T,>(
    operation: () => Promise<T>,
    successMessage?: string
  ): Promise<T | undefined> => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation();
      if (successMessage) {
        addToast({
          type: 'success',
          title: 'Cart updated',
          message: successMessage,
        });
      }
      return result;
    } catch (err) {
      const appError = apiUtils.handleApiError(err);
      setError(appError);
      addToast({
        type: 'error',
        title: 'Cart operation failed',
        message: appError.message,
      });
      throw appError;
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const refreshCart = React.useCallback(async (silent: boolean = false): Promise<void> => {
    logger.log('refreshCart called, isAuthenticated:', isAuthenticated, 'silent:', silent);
    if (!silent) {
      setLoading(true);
    }
    
    try {
      if (!isAuthenticated) {
        // For guest users: Database-only approach - always load from backend
        const guestCart = await cartApi.getGuestCart(sessionId);
        logger.log('Refreshed guest cart from backend:', guestCart);
        // Use functional update to prevent unnecessary re-renders if cart hasn't changed
        setCart(prevCart => {
          // Only update if cart data actually changed (prevents flicker)
          if (silent && prevCart && JSON.stringify(prevCart.items) === JSON.stringify(guestCart.items)) {
            return prevCart;
          }
          return guestCart;
        });
      } else {
        // For authenticated users, load from backend
        const userCart = await cartApi.getCart();
        logger.log('Refreshed user cart from backend:', userCart);
        // Use functional update to prevent unnecessary re-renders if cart hasn't changed
        setCart(prevCart => {
          // Only update if cart data actually changed (prevents flicker)
          if (silent && prevCart && JSON.stringify(prevCart.items) === JSON.stringify(userCart.items)) {
            return prevCart;
          }
          return userCart;
        });
      }
    } catch (error) {
      logger.error('Failed to refresh cart:', error);
      // Don't set error state - just log it
      // Cart will remain in current state
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [isAuthenticated, sessionId]);

  // Cart abandonment tracking
  const markCartAsAbandoned = React.useCallback(async (): Promise<void> => {
    if (!cart || !cart.items.length) return;
    
    try {
      const response = await fetch('/api/cart-abandonment/mark-abandoned', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
        },
        body: JSON.stringify({
          sessionId,
          email: user?.email,
          phone: user?.phone,
        }),
      });
      
      if (!response.ok) {
        logger.warn('Failed to mark cart as abandoned');
      }
    } catch (error) {
      logger.warn('Error marking cart as abandoned:', error);
    }
  }, [cart, sessionId, user]);

  const addItem = React.useCallback(async (productId: string, quantity: number = 1, selectedSize?: string, selectedColor?: string): Promise<void> => {
    logger.log('Adding item to cart:', { productId, quantity, selectedSize, selectedColor, isAuthenticated, sessionId });
    
    // Validate inputs
    if (!productId || quantity < 1) {
      logger.error('Invalid product ID or quantity');
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Invalid product or quantity'
      });
      return;
    }
    
    if (!isAuthenticated) {
      // Handle guest cart - database-only approach (industry standard)
      logger.log('Adding to guest cart, sessionId:', sessionId);
      
      try {
        // Add item to backend guest cart (database-only, no localStorage)
        const updatedCart = await cartApi.addGuestItem(sessionId, productId, quantity, selectedSize, selectedColor);
        logger.log('Guest cart updated from backend:', updatedCart);
        setCart(updatedCart);
        // No need to refreshCart() - updatedCart already contains the latest state
        
        addToast({
          type: 'success',
          title: 'Added to Cart',
          message: 'Item added to cart successfully!'
        });
      } catch (error) {
        logger.error('Error adding item to guest cart:', error);
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to add item to cart. Please check your connection and try again.'
        });
        throw error; // Don't silently fail
      }
      return;
    }

    // Handle authenticated user cart
    try {
      const updatedCart = await executeCartOperation(
        () => cartApi.addItem(productId, quantity, selectedSize, selectedColor),
        'Item added to cart'
      );
      if (updatedCart) {
        logger.log('User cart updated from backend:', updatedCart);
        setCart(updatedCart);
        // No need to refreshCart() - updatedCart already contains the latest state
      }
    } catch (error) {
      logger.error('Error adding item to user cart:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to add item to cart'
      });
    }
  }, [isAuthenticated, executeCartOperation, addToast, sessionId]);

  const updateItem = React.useCallback(async (productId: string, quantity: number): Promise<void> => {
    if (!isAuthenticated) {
      // Handle guest cart - database-only approach
      try {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          const updatedCart = await cartApi.removeGuestItem(sessionId, productId);
          setCart(updatedCart);
          await refreshCart(); // Refresh to ensure sync
        } else {
          // Update existing item
          const updatedCart = await cartApi.updateGuestItem(sessionId, productId, quantity);
          setCart(updatedCart);
          await refreshCart(); // Refresh to ensure sync
        }
        
        addToast({
          type: 'success',
          title: 'Cart Updated',
          message: 'Item quantity updated successfully!'
        });
      } catch (error) {
        logger.error('Error updating guest cart item:', error);
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to update cart item. Please try again.'
        });
        throw error; // Don't silently fail
      }
      return;
    }

    const updatedCart = await executeCartOperation(
      () => cartApi.updateItem(productId, quantity),
      'Cart updated'
    );
    if (updatedCart) {
      setCart(updatedCart);
      await refreshCart(); // Refresh to ensure sync
    }
  }, [isAuthenticated, executeCartOperation, addToast, sessionId, refreshCart]);

  const removeItem = React.useCallback(async (productId: string): Promise<void> => {
    if (!isAuthenticated) {
      // Handle guest cart - database-only approach
      try {
        const updatedCart = await cartApi.removeGuestItem(sessionId, productId);
        setCart(updatedCart);
        
        // Refresh cart to ensure sync
        await refreshCart();
        
        addToast({
          type: 'success',
          title: 'Item Removed',
          message: 'Item removed from cart successfully!'
        });
      } catch (error) {
        logger.error('Error removing guest cart item:', error);
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to remove item from cart. Please try again.'
        });
        throw error; // Don't silently fail
      }
      return;
    }

    const updatedCart = await executeCartOperation(
      () => cartApi.removeItem(productId),
      'Item removed from cart'
    );
    if (updatedCart) {
      setCart(updatedCart);
      await refreshCart(); // Refresh to ensure sync
    }
  }, [isAuthenticated, executeCartOperation, addToast, sessionId, refreshCart]);

  const clearCart = React.useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      // Handle guest cart - database-only approach
      // Always clear backend (even if UI shows empty - force clear)
      try {
        // Clear guest cart on backend
        const updatedCart = await cartApi.clearGuestCart(sessionId);
        setCart(updatedCart);
        
        // Refresh cart to ensure sync
        await refreshCart();
        
        addToast({
          type: 'success',
          title: 'Cart Cleared',
          message: 'All items removed from cart!'
        });
      } catch (error) {
        logger.error('Error clearing guest cart:', error);
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to clear cart. Please try again.'
        });
        throw error; // Don't silently fail
      }
      return;
    }

    const updatedCart = await executeCartOperation(
      () => cartApi.clearCart(),
      'Cart cleared'
    );
    if (updatedCart) {
      setCart(updatedCart);
      await refreshCart(); // Refresh to ensure sync
    }
  }, [isAuthenticated, executeCartOperation, addToast, sessionId, refreshCart]);

  // Sync guest cart with server when user logs in
  const syncGuestCartWithServer = React.useCallback(async () => {
    if (!isAuthenticated || !cart || cart.userId !== 'guest') return;
    
    try {
      logger.log('Syncing guest cart items:', cart.items);
      
      // Use the merge API to sync guest cart with user cart
      const mergedCart = await cartApi.mergeGuestCart(sessionId);
      logger.log('Merged cart:', mergedCart);
      
      // Guest cart is automatically cleared on backend during merge
      // No need to clear localStorage (database-only approach)
      
      // Set the merged cart
      setCart(mergedCart);
      
      addToast({
        type: 'success',
        title: 'Cart Synced',
        message: 'Your cart items have been synced with your account'
      });
    } catch (error) {
      logger.error('Failed to sync guest cart:', error);
      addToast({
        type: 'warning',
        title: 'Cart Sync Failed',
        message: 'Some items may not have been synced to your account'
      });
    }
  }, [isAuthenticated, sessionId, addToast, cart]);

  // Handle cart sync when user logs in
  React.useEffect(() => {
    if (isAuthenticated && cart?.userId === 'guest') {
      syncGuestCartWithServer();
    }
  }, [isAuthenticated, syncGuestCartWithServer, cart]);

  const resetCart = React.useCallback(() => {
    // Reset cart state (database-only - no localStorage to clear)
    const emptyCart = createEmptyGuestCart();
    setCart(emptyCart);
    setError(null);
  }, []);

  // Removed old refreshCart effect to avoid conflicts

  const value = React.useMemo(() => ({
    cart,
    loading,
    error,
    itemCount,
    totalPrice,
    sessionId,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    refreshCart,
    resetCart,
    markCartAsAbandoned,
  }), [cart, loading, error, itemCount, totalPrice, sessionId, addItem, updateItem, removeItem, clearCart, refreshCart, resetCart, markCartAsAbandoned]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Combined App Provider
// Wishlist Context for Out-of-Stock Products Only
interface WishlistContextValue {
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  isLoading: boolean;
  error: AppError | null;
  addToWishlist: (productId: string, options?: {
    notifyWhenInStock?: boolean;
    customerNotes?: string;
    priority?: 'low' | 'medium' | 'high';
  }) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = React.createContext<WishlistContextValue | undefined>(undefined);

export const useWishlist = (): WishlistContextValue => {
  const context = React.useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [wishlistItems, setWishlistItems] = React.useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<AppError | null>(null);

  const wishlistCount = React.useMemo(() => wishlistItems.length, [wishlistItems]);

  const refreshWishlist = React.useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await wishlistApi.getWishlist();
      setWishlistItems(response.items);
    } catch (err) {
      const appError = apiUtils.handleApiError(err);
      setError(appError);
      logger.error('Error fetching wishlist:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const addToWishlist = React.useCallback(async (
    productId: string, 
    options?: {
      notifyWhenInStock?: boolean;
      customerNotes?: string;
      priority?: 'low' | 'medium' | 'high';
    }
  ): Promise<void> => {
    if (!isAuthenticated) {
      addToast({
        type: 'error',
        title: 'Login Required',
        message: 'Please login or register to add items to your wishlist'
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const newItem = await wishlistApi.addToWishlist(productId, options);
      setWishlistItems(prev => [newItem, ...prev]);
      
      addToast({
        type: 'success',
        title: 'Added to Wishlist',
        message: 'Product added to your wishlist!'
      });
    } catch (err) {
      const appError = apiUtils.handleApiError(err);
      setError(appError);
      addToast({
        type: 'error',
        title: 'Failed to Add to Wishlist',
        message: appError.message
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, addToast]);

  const removeFromWishlist = React.useCallback(async (productId: string): Promise<void> => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);
    try {
      await wishlistApi.removeFromWishlist(productId);
      setWishlistItems(prev => prev.filter(item => item.productId !== productId));
      
      addToast({
        type: 'success',
        title: 'Removed from Wishlist',
        message: 'Product removed from your wishlist'
      });
    } catch (err) {
      const appError = apiUtils.handleApiError(err);
      setError(appError);
      addToast({
        type: 'error',
        title: 'Failed to Remove from Wishlist',
        message: appError.message
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, addToast]);

  const clearWishlist = React.useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);
    try {
      await wishlistApi.clearWishlist();
      setWishlistItems([]);
      
      addToast({
        type: 'success',
        title: 'Wishlist Cleared',
        message: 'All items removed from your wishlist'
      });
    } catch (err) {
      const appError = apiUtils.handleApiError(err);
      setError(appError);
      addToast({
        type: 'error',
        title: 'Failed to Clear Wishlist',
        message: appError.message
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, addToast]);

  const isInWishlist = React.useCallback((productId: string): boolean => {
    return wishlistItems.some(item => item.productId === productId);
  }, [wishlistItems]);

  // Load wishlist when user logs in
  React.useEffect(() => {
    if (isAuthenticated) {
      refreshWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [isAuthenticated, refreshWishlist]);

  const value: WishlistContextValue = {
    wishlistItems,
    wishlistCount,
    isLoading,
    error,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    refreshWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

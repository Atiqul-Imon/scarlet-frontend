"use client";
import * as React from 'react';
import { 
  User, 
  Cart, 
  ToastMessage, 
  AppError,
  AuthUser,
  LoginFormData,
  RegisterFormData 
} from './types';
import { authApi, cartApi, apiUtils } from './api';
import { stringUtils } from './utils';

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
  isAuthenticated: boolean;
  login: (credentials: LoginFormData) => Promise<void>;
  register: (userData: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
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
      
      addToast({
        type: 'success',
        title: 'Logged out',
        message: 'You have been successfully logged out.',
      });
    } catch (error) {
      // Even if logout fails on server, clear local state
      setUser(null);
      apiUtils.clearTokens();
      
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
    console.log('🔄 Token refresh failed, logging out user');
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

  const refreshUser = React.useCallback(async (): Promise<void> => {
    if (!apiUtils.isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      const currentUser = await authApi.getProfile();
      setUser(currentUser);
    } catch (error) {
      // Token might be expired or invalid
      setUser(null);
      apiUtils.clearTokens();
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize auth state
  React.useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Listen for token refresh failures
  React.useEffect(() => {
    const handleTokenRefreshFailureEvent = () => {
      handleTokenRefreshFailure();
    };

    window.addEventListener('tokenRefreshFailed', handleTokenRefreshFailureEvent);
    return () => {
      window.removeEventListener('tokenRefreshFailed', handleTokenRefreshFailureEvent);
    };
  }, [handleTokenRefreshFailure]);

  const value = React.useMemo(() => ({
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  }), [user, loading, isAuthenticated, login, register, logout, updateProfile, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Guest cart helper functions
const GUEST_CART_KEY = 'scarlet_guest_cart';
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
        console.log('Generated new session ID for mobile:', sessionId);
      } catch (storageError) {
        console.warn('Failed to store session ID in localStorage:', storageError);
        // Fallback to memory-only session ID
        sessionId = `memory_${timestamp}_${random}`;
      }
    }
    return sessionId;
  } catch (error) {
    console.error('Error generating session ID:', error);
    // Fallback session ID
    return `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }
};

const getGuestCart = (): Cart => {
  if (typeof window === 'undefined') {
    return { _id: 'guest', userId: 'guest', items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }
  
  try {
    console.log('Getting guest cart from localStorage...');
    const stored = localStorage.getItem(GUEST_CART_KEY);
    console.log('Stored cart data:', stored);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('Parsed cart data:', parsed);
        
        // Validate cart structure
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.items)) {
          return parsed;
        } else {
          console.warn('Invalid cart structure, creating new cart');
          localStorage.removeItem(GUEST_CART_KEY);
        }
      } catch (error) {
        console.error('Failed to parse guest cart:', error);
        // Clear corrupted cart data
        localStorage.removeItem(GUEST_CART_KEY);
      }
    }
    
    console.log('No stored cart found, creating new guest cart');
    const newCart = {
      _id: 'guest',
      userId: 'guest',
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return newCart;
  } catch (error) {
    console.error('Error accessing localStorage for guest cart:', error);
    // Return empty cart as fallback
    return {
      _id: 'guest',
      userId: 'guest',
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
};

const saveGuestCart = (cart: Cart): void => {
  if (typeof window !== 'undefined') {
    try {
      console.log('Saving guest cart to localStorage:', cart);
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
      console.log('Cart saved successfully');
    } catch (error) {
      console.error('Failed to save guest cart to localStorage:', error);
      // Try to clear some space by removing old data
      try {
        localStorage.removeItem('old_cart_data');
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
        console.log('Cart saved after clearing space');
      } catch (retryError) {
        console.error('Failed to save cart even after clearing space:', retryError);
        // Store in memory as last resort (will be lost on page refresh)
        (window as any).__scarlet_guest_cart_memory = cart;
      }
    }
  }
};

const clearGuestCart = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(GUEST_CART_KEY);
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
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
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

  // Load cart on mount and when authentication state changes
  React.useEffect(() => {
    console.log('Cart provider effect triggered, isAuthenticated:', isAuthenticated, 'sessionId:', sessionId);
    
    const loadCart = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (isAuthenticated) {
          // For authenticated users, load from backend
          const userCart = await cartApi.getCart();
          console.log('Loaded user cart from backend:', userCart);
          setCart(userCart);
        } else {
          // For guest users, try to load from backend first, then fallback to localStorage
          try {
            const guestCart = await cartApi.getGuestCart(sessionId);
            console.log('Loaded guest cart from backend:', guestCart);
            setCart(guestCart);
            // Also update localStorage for offline support
            saveGuestCart(guestCart);
          } catch (error) {
            console.error('Failed to load guest cart from backend:', error);
            // Fallback to localStorage
            const localGuestCart = getGuestCart();
            console.log('Initialized guest cart from localStorage:', localGuestCart);
            setCart(localGuestCart);
          }
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
        setError(apiUtils.handleApiError(error));
        // Set empty cart as fallback
        const emptyCart = isAuthenticated 
          ? { _id: 'empty', userId: user?._id || '', items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : getGuestCart();
        setCart(emptyCart);
      } finally {
        setLoading(false);
      }
    };
    
    loadCart();
  }, [isAuthenticated, sessionId, user]);


  // Handle authentication changes
  React.useEffect(() => {
    if (isAuthenticated && cart?.userId === 'guest') {
      // User logged in, sync guest cart with server
      console.log('User logged in, syncing guest cart with server');
      syncGuestCartWithServer();
    } else if (!isAuthenticated && (!cart || cart.userId !== 'guest')) {
      // User logged out, load guest cart
      console.log('User logged out, loading guest cart');
      const guestCart = getGuestCart();
      setCart(guestCart);
    }
  }, [isAuthenticated]);

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
    // Mock calculation - would need product prices from populated cart
    return cart?.items.reduce((total, item) => {
      // Mock price calculation
      const mockPrice = 29.99;
      return total + (mockPrice * item.quantity);
    }, 0) || 0;
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
        console.warn('Failed to mark cart as abandoned');
      }
    } catch (error) {
      console.warn('Error marking cart as abandoned:', error);
    }
  }, [cart, sessionId, user]);

  const addItem = React.useCallback(async (productId: string, quantity: number = 1): Promise<void> => {
    console.log('Adding item to cart:', { productId, quantity, isAuthenticated, sessionId });
    
    // Validate inputs
    if (!productId || quantity < 1) {
      console.error('Invalid product ID or quantity');
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Invalid product or quantity'
      });
      return;
    }
    
    if (!isAuthenticated) {
      // Handle guest cart - sync with backend first, then localStorage
      console.log('Adding to guest cart, sessionId:', sessionId);
      
      try {
        // Add item to backend guest cart
        const updatedCart = await cartApi.addGuestItem(sessionId, productId, quantity);
        console.log('Guest cart updated from backend:', updatedCart);
        setCart(updatedCart);
        
        // Also update localStorage for offline support
        saveGuestCart(updatedCart);
        
        addToast({
          type: 'success',
          title: 'Added to Cart',
          message: 'Item added to cart successfully!'
        });
      } catch (error) {
        console.error('Error adding item to guest cart:', error);
        
        // Fallback to localStorage if backend fails
        try {
          const guestCart = getGuestCart();
          const existingItemIndex = guestCart?.items.findIndex(item => item.productId === productId) ?? -1;

          if (existingItemIndex >= 0) {
            // Update existing item - ADD to existing quantity
            guestCart!.items[existingItemIndex]!.quantity += quantity;
          } else {
            // Add new item
            guestCart!.items.push({ productId, quantity });
          }
          
          guestCart!.updatedAt = new Date().toISOString();
          saveGuestCart(guestCart!);
          setCart(guestCart!);
          console.log('Guest cart updated in localStorage:', guestCart);
          
          addToast({
            type: 'success',
            title: 'Added to Cart',
            message: 'Item added to cart (offline mode)'
          });
        } catch (fallbackError) {
          console.error('Error in fallback guest cart:', fallbackError);
          addToast({
            type: 'error',
            title: 'Error',
            message: 'Failed to add item to cart'
          });
        }
      }
      return;
    }

    // Handle authenticated user cart
    try {
      const updatedCart = await executeCartOperation(
        () => cartApi.addItem(productId, quantity),
        'Item added to cart'
      );
      if (updatedCart) {
        console.log('User cart updated from backend:', updatedCart);
        setCart(updatedCart);
      }
    } catch (error) {
      console.error('Error adding item to user cart:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to add item to cart'
      });
    }
  }, [isAuthenticated, executeCartOperation, addToast, sessionId]);

  const updateItem = React.useCallback(async (productId: string, quantity: number): Promise<void> => {
    if (!isAuthenticated) {
      // Handle guest cart - sync with backend
      try {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          const updatedCart = await cartApi.removeGuestItem(sessionId, productId);
          setCart(updatedCart);
          saveGuestCart(updatedCart);
        } else {
          // Update existing item
          const updatedCart = await cartApi.updateGuestItem(sessionId, productId, quantity);
          setCart(updatedCart);
          saveGuestCart(updatedCart);
        }
        
        addToast({
          type: 'success',
          title: 'Cart Updated',
          message: 'Item quantity updated successfully!'
        });
      } catch (error) {
        console.error('Error updating guest cart item:', error);
        
        // Fallback to localStorage if backend fails
        try {
          const guestCart = getGuestCart();
          const existingItemIndex = guestCart?.items.findIndex(item => item.productId === productId) ?? -1;
          
          if (existingItemIndex >= 0) {
            if (quantity <= 0) {
              // Remove item if quantity is 0 or less
              guestCart!.items.splice(existingItemIndex, 1);
            } else {
              // Update existing item
              guestCart!.items[existingItemIndex]!.quantity = quantity;
            }
            
            guestCart!.updatedAt = new Date().toISOString();
            saveGuestCart(guestCart!);
            setCart(guestCart!);
            
            addToast({
              type: 'success',
              title: 'Cart Updated',
              message: 'Item quantity updated (offline mode)'
            });
          }
        } catch (fallbackError) {
          console.error('Error in fallback guest cart update:', fallbackError);
          addToast({
            type: 'error',
            title: 'Error',
            message: 'Failed to update cart item'
          });
        }
      }
      return;
    }

    const updatedCart = await executeCartOperation(
      () => cartApi.updateItem(productId, quantity),
      'Cart updated'
    );
    if (updatedCart) setCart(updatedCart);
  }, [isAuthenticated, executeCartOperation, addToast]);

  const removeItem = React.useCallback(async (productId: string): Promise<void> => {
    if (!isAuthenticated) {
      // Handle guest cart - sync with backend
      try {
        const updatedCart = await cartApi.removeGuestItem(sessionId, productId);
        setCart(updatedCart);
        saveGuestCart(updatedCart);
        
        addToast({
          type: 'success',
          title: 'Item Removed',
          message: 'Item removed from cart successfully!'
        });
      } catch (error) {
        console.error('Error removing guest cart item:', error);
        
        // Fallback to localStorage if backend fails
        try {
          const guestCart = getGuestCart();
          const existingItemIndex = guestCart?.items.findIndex(item => item.productId === productId) ?? -1;
          
          if (existingItemIndex >= 0) {
            guestCart!.items.splice(existingItemIndex, 1);
            guestCart!.updatedAt = new Date().toISOString();
            saveGuestCart(guestCart!);
            setCart(guestCart!);
            
            addToast({
              type: 'success',
              title: 'Item Removed',
              message: 'Item removed from cart (offline mode)'
            });
          }
        } catch (fallbackError) {
          console.error('Error in fallback guest cart removal:', fallbackError);
          addToast({
            type: 'error',
            title: 'Error',
            message: 'Failed to remove item from cart'
          });
        }
      }
      return;
    }

    const updatedCart = await executeCartOperation(
      () => cartApi.removeItem(productId),
      'Item removed from cart'
    );
    if (updatedCart) setCart(updatedCart);
  }, [isAuthenticated, executeCartOperation, addToast]);

  const clearCart = React.useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      // Handle guest cart - sync with backend first, then clear localStorage
      try {
        // Clear guest cart on backend
        const updatedCart = await cartApi.clearGuestCart(sessionId);
        setCart(updatedCart);
        
        // Also clear localStorage for offline support
        clearGuestCart();
        
        addToast({
          type: 'success',
          title: 'Cart Cleared',
          message: 'All items removed from cart!'
        });
      } catch (error) {
        console.error('Error clearing guest cart:', error);
        
        // Fallback to localStorage if backend fails
        try {
          clearGuestCart();
          // Create a fresh empty cart instead of getting from localStorage
          const emptyCart = {
            _id: 'guest',
            userId: 'guest',
            items: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setCart(emptyCart);
          
          addToast({
            type: 'success',
            title: 'Cart Cleared',
            message: 'All items removed from cart (offline mode)!'
          });
        } catch (fallbackError) {
          console.error('Error in fallback guest cart clear:', fallbackError);
          addToast({
            type: 'error',
            title: 'Error',
            message: 'Failed to clear cart'
          });
        }
      }
      return;
    }

    const updatedCart = await executeCartOperation(
      () => cartApi.clearCart(),
      'Cart cleared'
    );
    if (updatedCart) setCart(updatedCart);
  }, [isAuthenticated, executeCartOperation, addToast, sessionId]);

  const refreshCart = React.useCallback(async (): Promise<void> => {
    console.log('refreshCart called, isAuthenticated:', isAuthenticated);
    if (!isAuthenticated) {
      // For guest users, try to load from backend first, then fallback to localStorage
      try {
        const guestCart = await cartApi.getGuestCart(sessionId);
        setCart(guestCart);
        // Also update localStorage for offline support
        saveGuestCart(guestCart);
      } catch (error) {
        console.error('Failed to load guest cart from backend:', error);
        // Fallback to localStorage
        const localGuestCart = getGuestCart();
        console.log('Loading guest cart from localStorage:', localGuestCart);
        setCart(localGuestCart);
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const freshCart = await cartApi.getCart();
      setCart(freshCart);
    } catch (err) {
      const appError = apiUtils.handleApiError(err);
      setError(appError);
      // Don't show toast for cart refresh errors
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Sync guest cart with server when user logs in
  const syncGuestCartWithServer = React.useCallback(async () => {
    if (!isAuthenticated || !cart || cart.userId !== 'guest') return;
    
    try {
      console.log('Syncing guest cart items:', cart.items);
      
      // Use the merge API to sync guest cart with user cart
      const mergedCart = await cartApi.mergeGuestCart(sessionId);
      console.log('Merged cart:', mergedCart);
      
      // Clear guest cart after successful sync
      clearGuestCart();
      
      // Set the merged cart
      setCart(mergedCart);
      
      addToast({
        type: 'success',
        title: 'Cart Synced',
        message: 'Your cart items have been synced with your account'
      });
    } catch (error) {
      console.error('Failed to sync guest cart:', error);
      addToast({
        type: 'warning',
        title: 'Cart Sync Failed',
        message: 'Some items may not have been synced to your account'
      });
    }
  }, [isAuthenticated, sessionId, addToast]);

  // Handle cart sync when user logs in
  React.useEffect(() => {
    if (isAuthenticated && cart?.userId === 'guest') {
      syncGuestCartWithServer();
    }
  }, [isAuthenticated, syncGuestCartWithServer]);

  const resetCart = React.useCallback(() => {
    clearGuestCart();
    // Create a fresh empty cart instead of getting from localStorage
    const emptyCart = {
      _id: 'guest',
      userId: 'guest',
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
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
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

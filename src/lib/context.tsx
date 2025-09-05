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
      
      const appError = apiUtils.handleApiError(error);
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

const getGuestCart = (): Cart => {
  if (typeof window === 'undefined') {
    return { _id: 'guest', userId: 'guest', items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }
  
  console.log('Getting guest cart from localStorage...');
  const stored = localStorage.getItem(GUEST_CART_KEY);
  console.log('Stored cart data:', stored);
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      console.log('Parsed cart data:', parsed);
      return parsed;
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
};

const saveGuestCart = (cart: Cart): void => {
  if (typeof window !== 'undefined') {
    console.log('Saving guest cart to localStorage:', cart);
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    console.log('Cart saved successfully');
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
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  resetCart: () => void; // For debugging and cleanup
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
  // Initialize cart state with guest cart immediately
  const [cart, setCart] = React.useState<Cart | null>(() => {
    if (typeof window !== 'undefined') {
      const guestCart = getGuestCart();
      console.log('Initial cart state:', guestCart);
      return guestCart;
    }
    return null;
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<AppError | null>(null);
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  // Ensure cart is always initialized
  React.useEffect(() => {
    console.log('Cart provider mounted, current cart:', cart);
    if (!cart) {
      console.log('No cart found, initializing...');
      const guestCart = getGuestCart();
      console.log('Initialized guest cart:', guestCart);
      setCart(guestCart);
    }
  }, [cart]);


  // Handle authentication changes
  React.useEffect(() => {
    if (isAuthenticated && cart?.userId === 'guest') {
      // User logged in, sync guest cart with server
      console.log('User logged in, syncing guest cart with server');
      // This will be called after syncGuestCartWithServer is defined
    } else if (!isAuthenticated && (!cart || cart.userId !== 'guest')) {
      // User logged out, load guest cart
      console.log('User logged out, loading guest cart');
      const guestCart = getGuestCart();
      setCart(guestCart);
    }
  }, [isAuthenticated, cart]);

  const itemCount = React.useMemo(() => {
    return cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
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

  const addItem = React.useCallback(async (productId: string, quantity: number = 1): Promise<void> => {
    if (!isAuthenticated) {
      // Handle guest cart with localStorage
      try {
        const guestCart = getGuestCart();
        const existingItemIndex = guestCart?.items.findIndex(item => item.productId === productId) ?? -1;
        
        if (existingItemIndex >= 0) {
          // Update existing item
          guestCart!.items[existingItemIndex]!.quantity += quantity;
        } else {
          // Add new item
          guestCart!.items.push({ productId, quantity });
        }
        
        guestCart!.updatedAt = new Date().toISOString();
        saveGuestCart(guestCart!);
        setCart(guestCart!);
        
        addToast({
          type: 'success',
          title: 'Added to Cart',
          message: 'Item added to cart successfully!'
        });
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to add item to cart'
        });
      }
      return;
    }

    const updatedCart = await executeCartOperation(
      () => cartApi.addItem(productId, quantity),
      'Item added to cart'
    );
    if (updatedCart) setCart(updatedCart);
  }, [isAuthenticated, executeCartOperation, addToast]);

  const updateItem = React.useCallback(async (productId: string, quantity: number): Promise<void> => {
    if (!isAuthenticated) {
      // Handle guest cart with localStorage
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
            message: 'Item quantity updated successfully!'
          });
        }
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to update cart item'
        });
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
      // Handle guest cart with localStorage
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
            message: 'Item removed from cart successfully!'
          });
        }
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to remove item from cart'
        });
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
      // Handle guest cart with localStorage
      try {
        clearGuestCart();
        const emptyCart = getGuestCart(); // This will create a new empty cart
        setCart(emptyCart);
        
        addToast({
          type: 'success',
          title: 'Cart Cleared',
          message: 'All items removed from cart!'
        });
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to clear cart'
        });
      }
      return;
    }

    await executeCartOperation(
      () => cartApi.clearCart(),
      'Cart cleared'
    );
    setCart(null);
  }, [isAuthenticated, executeCartOperation, addToast]);

  const refreshCart = React.useCallback(async (): Promise<void> => {
    console.log('refreshCart called, isAuthenticated:', isAuthenticated);
    if (!isAuthenticated) {
      // Load guest cart from localStorage
      const guestCart = getGuestCart();
      console.log('Loading guest cart:', guestCart);
      console.log('Guest cart items:', guestCart.items);
      setCart(guestCart);
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
      
      // Add each guest cart item to the server cart
      for (const item of cart.items) {
        try {
          await cartApi.addItem(item.productId, item.quantity);
          console.log(`Synced item ${item.productId} with quantity ${item.quantity}`);
        } catch (error) {
          console.warn(`Failed to sync item ${item.productId}:`, error);
        }
      }
      
      // Clear guest cart after successful sync
      clearGuestCart();
      
      // Refresh cart from server
      await refreshCart();
      
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
  }, [isAuthenticated, cart, addToast, refreshCart]);

  // Handle cart sync when user logs in
  React.useEffect(() => {
    if (isAuthenticated && cart?.userId === 'guest') {
      syncGuestCartWithServer();
    }
  }, [isAuthenticated, cart, syncGuestCartWithServer]);

  const resetCart = React.useCallback(() => {
    clearGuestCart();
    setCart(getGuestCart());
    setError(null);
  }, []);

  // Removed old refreshCart effect to avoid conflicts

  const value = React.useMemo(() => ({
    cart,
    loading,
    error,
    itemCount,
    totalPrice,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    refreshCart,
    resetCart,
  }), [cart, loading, error, itemCount, totalPrice, addItem, updateItem, removeItem, clearCart, refreshCart, resetCart]);

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

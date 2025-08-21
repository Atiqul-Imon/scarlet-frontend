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
    return { id: 'guest', userId: 'guest', items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }
  
  const stored = localStorage.getItem(GUEST_CART_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse guest cart:', error);
    }
  }
  
  return {
    id: 'guest',
    userId: 'guest',
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

const saveGuestCart = (cart: Cart): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
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
  const [cart, setCart] = React.useState<Cart | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<AppError | null>(null);
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

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
        const existingItemIndex = guestCart.items.findIndex(item => item.productId === productId);
        
        if (existingItemIndex >= 0) {
          // Update existing item
          guestCart.items[existingItemIndex].quantity += quantity;
        } else {
          // Add new item
          guestCart.items.push({ productId, quantity });
        }
        
        guestCart.updatedAt = new Date().toISOString();
        saveGuestCart(guestCart);
        setCart(guestCart);
        
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
        const existingItemIndex = guestCart.items.findIndex(item => item.productId === productId);
        
        if (existingItemIndex >= 0) {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            guestCart.items.splice(existingItemIndex, 1);
          } else {
            // Update existing item
            guestCart.items[existingItemIndex].quantity = quantity;
          }
          
          guestCart.updatedAt = new Date().toISOString();
          saveGuestCart(guestCart);
          setCart(guestCart);
          
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
        const existingItemIndex = guestCart.items.findIndex(item => item.productId === productId);
        
        if (existingItemIndex >= 0) {
          guestCart.items.splice(existingItemIndex, 1);
          guestCart.updatedAt = new Date().toISOString();
          saveGuestCart(guestCart);
          setCart(guestCart);
          
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
    if (!isAuthenticated) {
      // Load guest cart from localStorage
      const guestCart = getGuestCart();
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

  // Refresh cart when authentication status changes
  React.useEffect(() => {
    refreshCart();
  }, [refreshCart]);

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
  }), [cart, loading, error, itemCount, totalPrice, addItem, updateItem, removeItem, clearCart, refreshCart]);

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

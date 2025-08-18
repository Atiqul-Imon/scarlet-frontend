import * as React from 'react';
import { 
  AsyncState, 
  LoadingState, 
  ValidationError, 
  AppError,
  Product,
  Cart,
  User,
  Order
} from './types';
import { validators, debounce, errorUtils } from './utils';

// Form Hook Types
export interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Record<keyof T, string> | {};
  onSubmit: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  resetForm: () => void;
  validateField: (field: keyof T) => void;
  validateForm: () => boolean;
}

// Custom Form Hook
export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const [values, setValues] = React.useState<T>(options.initialValues);
  const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = React.useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateForm = React.useCallback((): boolean => {
    if (!options.validate) return true;
    
    const validationErrors = options.validate(values);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [values, options.validate]);

  const validateField = React.useCallback((field: keyof T): void => {
    if (!options.validate) return;
    
    const validationErrors = options.validate(values);
    setErrors(prev => ({
      ...prev,
      [field]: validationErrors[field] || undefined,
    }));
  }, [values, options.validate]);

  const handleChange = React.useCallback((field: keyof T, value: any): void => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    if (options.validateOnChange) {
      validateField(field);
    }
  }, [validateField, options.validateOnChange]);

  const handleBlur = React.useCallback((field: keyof T): void => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (options.validateOnBlur) {
      validateField(field);
    }
  }, [validateField, options.validateOnBlur]);

  const handleSubmit = React.useCallback(async (e?: React.FormEvent): Promise<void> => {
    e?.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await options.onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, options.onSubmit]);

  const setFieldValue = React.useCallback((field: keyof T, value: any): void => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const setFieldError = React.useCallback((field: keyof T, error: string): void => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const resetForm = React.useCallback((): void => {
    setValues(options.initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [options.initialValues]);

  const isValid = React.useMemo((): boolean => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    resetForm,
    validateField,
    validateForm,
  };
}

// Async Data Hook
export interface UseAsyncOptions<T> {
  initialData?: T | null;
  onSuccess?: (data: T) => void;
  onError?: (error: AppError) => void;
}

export interface UseAsyncReturn<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

export function useAsync<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T> {
  const [state, setState] = React.useState<AsyncState<T>>({
    data: options.initialData || null,
    loading: false,
    error: null,
  });

  const execute = React.useCallback(async (...args: any[]): Promise<T> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await asyncFunction(...args);
      setState({ data: result, loading: false, error: null });
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      const appError = errorUtils.createError(
        error instanceof Error ? error.message : 'An error occurred'
      );
      setState({ data: null, loading: false, error: appError });
      options.onError?.(appError);
      throw appError;
    }
  }, [asyncFunction, options]);

  const reset = React.useCallback((): void => {
    setState({
      data: options.initialData || null,
      loading: false,
      error: null,
    });
  }, [options.initialData]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
    reset,
  };
}

// Debounced Value Hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Local Storage Hook
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = React.useCallback((value: T | ((prev: T) => T)): void => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = React.useCallback((): void => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// Toggle Hook
export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = React.useState<boolean>(initialValue);

  const toggle = React.useCallback((): void => {
    setValue(prev => !prev);
  }, []);

  const setToggle = React.useCallback((newValue: boolean): void => {
    setValue(newValue);
  }, []);

  return [value, toggle, setToggle];
}

// Previous Value Hook
export function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T>();
  
  React.useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

// Window Size Hook
export interface WindowSize {
  width: number | undefined;
  height: number | undefined;
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = React.useState<WindowSize>({
    width: undefined,
    height: undefined,
  });

  React.useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// Click Outside Hook
export function useClickOutside<T extends HTMLElement>(
  handler: () => void
): React.RefObject<T> {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handler]);

  return ref;
}

// Intersection Observer Hook
export function useIntersectionObserver<T extends HTMLElement>(
  options: IntersectionObserverInit = {}
): [React.RefObject<T>, boolean] {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [options]);

  return [ref, isIntersecting];
}

// Shopping Cart Hook
export interface UseShoppingCartReturn {
  cart: Cart | null;
  loading: boolean;
  error: AppError | null;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  refreshCart: () => Promise<void>;
}

export function useShoppingCart(): UseShoppingCartReturn {
  const [cart, setCart] = React.useState<Cart | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<AppError | null>(null);

  // Mock implementation - replace with actual API calls
  const mockCartOperations = {
    async getCart(): Promise<Cart> {
      // Mock cart data
      return {
        _id: '1',
        userId: 'user1',
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },

    async addItem(productId: string, quantity: number): Promise<Cart> {
      // Mock add item
      return this.getCart();
    },

    async updateItem(productId: string, quantity: number): Promise<Cart> {
      // Mock update item
      return this.getCart();
    },

    async removeItem(productId: string): Promise<Cart> {
      // Mock remove item
      return this.getCart();
    },

    async clearCart(): Promise<Cart> {
      // Mock clear cart
      return this.getCart();
    },
  };

  const executeCartOperation = async <T>(
    operation: () => Promise<T>
  ): Promise<T | undefined> => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation();
      return result;
    } catch (err) {
      const appError = errorUtils.createError(
        err instanceof Error ? err.message : 'Cart operation failed'
      );
      setError(appError);
      throw appError;
    } finally {
      setLoading(false);
    }
  };

  const addItem = React.useCallback(async (productId: string, quantity: number = 1): Promise<void> => {
    const updatedCart = await executeCartOperation(() =>
      mockCartOperations.addItem(productId, quantity)
    );
    if (updatedCart) setCart(updatedCart);
  }, []);

  const updateItem = React.useCallback(async (productId: string, quantity: number): Promise<void> => {
    const updatedCart = await executeCartOperation(() =>
      mockCartOperations.updateItem(productId, quantity)
    );
    if (updatedCart) setCart(updatedCart);
  }, []);

  const removeItem = React.useCallback(async (productId: string): Promise<void> => {
    const updatedCart = await executeCartOperation(() =>
      mockCartOperations.removeItem(productId)
    );
    if (updatedCart) setCart(updatedCart);
  }, []);

  const clearCart = React.useCallback(async (): Promise<void> => {
    const updatedCart = await executeCartOperation(() =>
      mockCartOperations.clearCart()
    );
    if (updatedCart) setCart(updatedCart);
  }, []);

  const refreshCart = React.useCallback(async (): Promise<void> => {
    const freshCart = await executeCartOperation(() =>
      mockCartOperations.getCart()
    );
    if (freshCart) setCart(freshCart);
  }, []);

  const getTotalItems = React.useCallback((): number => {
    return cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
  }, [cart]);

  const getTotalPrice = React.useCallback((): number => {
    // Mock calculation - would need product prices
    return cart?.items.reduce((total, item) => {
      // Mock price calculation
      const mockPrice = 29.99;
      return total + (mockPrice * item.quantity);
    }, 0) || 0;
  }, [cart]);

  // Load cart on mount
  React.useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return {
    cart,
    loading,
    error,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    getTotalItems,
    getTotalPrice,
    refreshCart,
  };
}

// Authentication Hook
export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Mock authentication - replace with actual implementation
  const login = React.useCallback(async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      // Mock login
      const mockUser: User = {
        _id: '1',
        email,
        role: 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(mockUser);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = React.useCallback(async (userData: any): Promise<void> => {
    setLoading(true);
    try {
      // Mock registration
      const mockUser: User = {
        _id: '1',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(mockUser);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = React.useCallback(async (): Promise<void> => {
    setUser(null);
  }, []);

  const updateProfile = React.useCallback(async (updates: Partial<User>): Promise<void> => {
    if (!user) return;
    
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, [user]);

  const isAuthenticated = React.useMemo((): boolean => {
    return user !== null;
  }, [user]);

  // Check for existing session on mount
  React.useEffect(() => {
    // Mock session check
    setLoading(false);
  }, []);

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };
}

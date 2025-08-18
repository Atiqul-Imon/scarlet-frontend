// Base Entity Types
export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// Product Related Types
export interface Category extends Partial<BaseEntity> {
  name: string;
  slug: string;
  parentId?: string | null;
  description?: string;
  image?: string;
  isActive?: boolean;
}

export interface ProductPrice {
  currency: string;
  amount: number;
  originalAmount?: number; // For sale prices
  discountPercentage?: number;
}

export interface ProductAttribute {
  name: string;
  value: string | number | boolean;
  type: 'text' | 'number' | 'boolean' | 'select';
  displayName?: string;
}

export interface Product extends BaseEntity {
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  images: string[];
  price: ProductPrice;
  brand?: string;
  stock?: number;
  categoryIds: string[];
  attributes?: ProductAttribute[];
  tags?: string[];
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  isActive?: boolean;
  isFeatured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  rating?: {
    average: number;
    count: number;
  };
}

// User Related Types
export type UserRole = 'admin' | 'staff' | 'customer';

export interface User extends BaseEntity {
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isEmailVerified?: boolean;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  preferences?: {
    newsletter: boolean;
    smsNotifications: boolean;
    language: string;
    currency: string;
  };
}

// Cart Related Types
export interface CartItem {
  productId: string;
  quantity: number;
  addedAt?: string;
  // Populated product data
  product?: Product;
}

export interface Cart extends BaseEntity {
  userId: string;
  items: CartItem[];
  sessionId?: string; // For guest carts
  expiresAt?: string;
}

// Order Related Types
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'paypal' | 'apple_pay' | 'google_pay';

export interface OrderItem {
  productId: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  brand?: string;
  sku?: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface PaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  last4?: string; // Last 4 digits of card
  brand?: string; // Card brand (visa, mastercard, etc.)
}

export interface Order extends BaseEntity {
  orderNumber: string;
  userId?: string;
  email: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentInfo: PaymentInfo;
  shippingMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  notes?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    field?: string;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Filter and Sort Types
export interface ProductFilters {
  category?: string;
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  rating?: number;
  tags?: string[];
  search?: string;
}

export type ProductSortOption = 'featured' | 'newest' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc' | 'rating' | 'popularity';

export interface ProductQuery extends ProductFilters {
  page?: number;
  limit?: number;
  sort?: ProductSortOption;
}

// Form Types
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface NewsletterFormData {
  email: string;
  firstName?: string;
  preferences?: string[];
}

export interface ReviewFormData {
  productId: string;
  rating: number;
  title: string;
  comment: string;
  wouldRecommend?: boolean;
}

// Authentication Types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  email?: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  newsletter?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  user: User;
  tokens: AuthTokens;
}

// Checkout Types
export interface CheckoutFormData {
  // Contact
  email: string;
  
  // Shipping
  firstName: string;
  lastName: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  shippingMethod: string;
  
  // Payment
  paymentMethod: PaymentMethod;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardName?: string;
  
  // Options
  saveAddress?: boolean;
  sameAsBilling?: boolean;
  newsletter?: boolean;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  field?: string;
  details?: any;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Component Props Types
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlay?: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Theme and UI Types
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

// Search and Navigation Types
export interface SearchResult {
  products: Product[];
  categories: Category[];
  total: number;
  query: string;
  suggestions?: string[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavigationItem[];
}

// Analytics and Tracking Types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: string;
}

export interface ProductViewEvent extends AnalyticsEvent {
  name: 'product_view';
  properties: {
    productId: string;
    productName: string;
    category: string;
    price: number;
    currency: string;
  };
}

export interface AddToCartEvent extends AnalyticsEvent {
  name: 'add_to_cart';
  properties: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    currency: string;
  };
}

export interface PurchaseEvent extends AnalyticsEvent {
  name: 'purchase';
  properties: {
    orderId: string;
    total: number;
    currency: string;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
    }>;
  };
}



// Admin Dashboard Types

export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  newUsersToday: number;
  ordersToday: number;
  revenueToday: number;
  pendingOrders: number;
  lowStockProducts: number;
  topSellingProducts: Array<{
    productId: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export interface AdminUser {
  _id: string;
  email?: string;
  phone?: string;
  firstName: string;
  lastName?: string;
  role: 'admin' | 'staff' | 'customer';
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminProduct {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  categoryIds: string[];
  brand?: string;
  images: string[];
  price: {
    currency: string;
    amount: number;
  };
  stock: number;
  attributes?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminOrder {
  _id: string;
  userId: string;
  customer?: {
    name: string;
    email?: string;
    phone?: string;
  };
  items: Array<{
    productId: string;
    title: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  orderNumber?: string;
  trackingNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminUserFilters extends AdminFilters {
  role?: 'admin' | 'staff' | 'customer';
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface AdminProductFilters extends AdminFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  lowStock?: boolean;
}

export interface AdminOrderFilters extends AdminFilters {
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface AdminPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface SalesAnalytics {
  period: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  revenueByCategory: Array<{
    category: string;
    revenue: number;
  }>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export interface UserAnalytics {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  usersByRole: Array<{
    role: string;
    count: number;
  }>;
  registrationTrend: Array<{
    date: string;
    count: number;
  }>;
  topCustomers: Array<{
    userId: string;
    name: string;
    totalOrders: number;
    totalSpent: number;
  }>;
}

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  currency: string;
  timezone: string;
  lowStockThreshold: number;
  emailNotifications: boolean;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  paymentGateways: {
    stripe?: {
      enabled: boolean;
      publicKey?: string;
      secretKey?: string;
    };
    paypal?: {
      enabled: boolean;
      clientId?: string;
      clientSecret?: string;
    };
  };
  shippingZones: Array<{
    name: string;
    areas: string[];
    cost: number;
    freeShippingThreshold?: number;
  }>;
}

export interface AdminActivityLog {
  _id: string;
  userId: string;
  userEmail: string;
  action: string;
  details?: any;
  timestamp: string;
  ip: string;
  userAgent?: string;
}

// Navigation Types
export interface AdminNavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: AdminNavItem[];
}

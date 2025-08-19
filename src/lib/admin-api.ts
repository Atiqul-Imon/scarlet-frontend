import { fetchJsonAuth } from './api';
import type {
  AdminStats,
  AdminUser,
  AdminProduct,
  AdminOrder,
  AdminUserFilters,
  AdminProductFilters,
  AdminOrderFilters,
  AdminPaginatedResponse,
  SalesAnalytics,
  UserAnalytics,
  SystemSettings,
  AdminActivityLog
} from './admin-types';

const ADMIN_BASE = '/admin';

// Dashboard
export const adminDashboardApi = {
  getStats: (): Promise<AdminStats> => {
    return fetchJsonAuth(`${ADMIN_BASE}/dashboard/stats`);
  }
};

// User Management
export const adminUserApi = {
  getUsers: (filters: AdminUserFilters = {}): Promise<AdminPaginatedResponse<AdminUser>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const url = `${ADMIN_BASE}/users${queryString ? `?${queryString}` : ''}`;
    
    return fetchJsonAuth(url);
  },

  updateUserRole: (userId: string, role: 'admin' | 'staff' | 'customer'): Promise<{ message: string }> => {
    return fetchJsonAuth(`${ADMIN_BASE}/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
  },

  deleteUser: (userId: string): Promise<{ message: string }> => {
    return fetchJsonAuth(`${ADMIN_BASE}/users/${userId}`, {
      method: 'DELETE'
    });
  }
};

// Product Management
export const adminProductApi = {
  getProducts: (filters: AdminProductFilters = {}): Promise<AdminPaginatedResponse<AdminProduct>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const url = `${ADMIN_BASE}/products${queryString ? `?${queryString}` : ''}`;
    
    return fetchJsonAuth(url);
  },

  updateProductStock: (productId: string, stock: number): Promise<{ message: string }> => {
    return fetchJsonAuth(`${ADMIN_BASE}/products/${productId}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock })
    });
  },

  deleteProduct: (productId: string): Promise<{ message: string }> => {
    return fetchJsonAuth(`${ADMIN_BASE}/products/${productId}`, {
      method: 'DELETE'
    });
  }
};

// Order Management
export const adminOrderApi = {
  getOrders: (filters: AdminOrderFilters = {}): Promise<AdminPaginatedResponse<AdminOrder>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const url = `${ADMIN_BASE}/orders${queryString ? `?${queryString}` : ''}`;
    
    return fetchJsonAuth(url);
  },

  updateOrderStatus: (
    orderId: string, 
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded',
    trackingNumber?: string
  ): Promise<{ message: string }> => {
    return fetchJsonAuth(`${ADMIN_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, trackingNumber })
    });
  }
};

// Analytics
export const adminAnalyticsApi = {
  getSalesAnalytics: (dateFrom: string, dateTo: string): Promise<SalesAnalytics> => {
    const params = new URLSearchParams({ dateFrom, dateTo });
    return fetchJsonAuth(`${ADMIN_BASE}/analytics/sales?${params.toString()}`);
  },

  getUserAnalytics: (): Promise<UserAnalytics> => {
    return fetchJsonAuth(`${ADMIN_BASE}/analytics/users`);
  }
};

// System Settings
export const adminSettingsApi = {
  getSettings: (): Promise<SystemSettings> => {
    return fetchJsonAuth(`${ADMIN_BASE}/settings`);
  },

  updateSettings: (settings: Partial<SystemSettings>): Promise<{ message: string }> => {
    return fetchJsonAuth(`${ADMIN_BASE}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(settings)
    });
  }
};

// Activity Logs
export const adminLogsApi = {
  getActivityLogs: (page: number = 1, limit: number = 50): Promise<AdminPaginatedResponse<AdminActivityLog>> => {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      limit: limit.toString() 
    });
    return fetchJsonAuth(`${ADMIN_BASE}/logs/activity?${params.toString()}`);
  }
};

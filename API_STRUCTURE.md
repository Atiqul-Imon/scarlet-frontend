# Centralized API Structure

## Overview
All API calls are now centralized in `/src/lib/api.ts` for better maintainability, consistency, and error handling.

## Structure

### Core Functions
- `fetchJson<T>(path, init?)` - Generic HTTP requests
- `fetchJsonAuth<T>(path, init?)` - Authenticated HTTP requests
- `ApiError` - Custom error class for API errors
- `apiUtils` - Utility functions for token management and error handling

### Public APIs

#### Product API (`productApi`)
```typescript
productApi.getProducts(query?: ProductQuery)
productApi.getProductBySlug(slug: string)
productApi.getProductById(id: string)
productApi.searchProducts(query: string, filters?: Partial<ProductQuery>)
```

#### Category API (`categoryApi`)
```typescript
categoryApi.getCategories()
categoryApi.getCategoryBySlug(slug: string)
categoryApi.getCategoryProducts(categoryId: string, query?: Partial<ProductQuery>)
```

#### Cart API (`cartApi`)
```typescript
cartApi.getCart()
cartApi.addItem(productId: string, quantity: number)
cartApi.updateItem(productId: string, quantity: number)
cartApi.removeItem(productId: string)
cartApi.clearCart()
```

#### Order API (`orderApi`)
```typescript
orderApi.createOrder(checkoutData: CheckoutFormData)
orderApi.getOrders(page?: number, limit?: number)
orderApi.getOrder(orderId: string)
orderApi.cancelOrder(orderId: string, reason?: string)
```

#### Auth API (`authApi`)
```typescript
authApi.login(credentials: LoginFormData)
authApi.register(userData: RegisterFormData)
authApi.refreshToken(refreshToken: string)
authApi.logout()
authApi.getProfile()
authApi.updateProfile(updates: Partial<User>)
authApi.requestPasswordReset(email: string)
authApi.resetPassword(token: string, newPassword: string)
```

### Admin APIs (`adminApi`)

#### Dashboard
```typescript
adminApi.dashboard.getStats()
```

#### User Management
```typescript
adminApi.users.getUsers(filters?: AdminUserFilters)
adminApi.users.updateUserRole(userId: string, role: 'admin' | 'staff' | 'customer')
adminApi.users.deleteUser(userId: string)
```

#### Product Management
```typescript
adminApi.products.getProducts(filters?: AdminProductFilters)
adminApi.products.updateProductStock(productId: string, stock: number)
adminApi.products.deleteProduct(productId: string)
```

#### Order Management
```typescript
adminApi.orders.getOrders(filters?: AdminOrderFilters)
adminApi.orders.updateOrderStatus(orderId: string, status: OrderStatus, trackingNumber?: string)
```

#### Analytics
```typescript
adminApi.analytics.getSalesAnalytics(dateFrom: string, dateTo: string)
adminApi.analytics.getUserAnalytics()
```

#### System Settings
```typescript
adminApi.settings.getSettings()
adminApi.settings.updateSettings(settings: Partial<SystemSettings>)
```

#### Activity Logs
```typescript
adminApi.logs.getActivityLogs(page?: number, limit?: number)
```

## Features

### Enhanced Error Handling
- Detailed logging for API calls and errors
- Custom `ApiError` class with status codes and error details
- Automatic token management
- Network error detection

### Type Safety
- Full TypeScript support
- Generic functions with type parameters
- Strongly typed request/response interfaces

### Consistent Error Handling
- Standardized error format across all APIs
- Centralized error logging and debugging
- User-friendly error messages

## Usage Examples

### Basic API Call
```typescript
import { productApi } from '@/lib/api';

const products = await productApi.getProducts({ category: 'skincare' });
```

### Admin API Call
```typescript
import { adminApi } from '@/lib/api';

const stats = await adminApi.dashboard.getStats();
const users = await adminApi.users.getUsers({ role: 'customer' });
```

### Error Handling
```typescript
import { productApi, ApiError } from '@/lib/api';

try {
  const product = await productApi.getProductBySlug('rose-serum');
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message, error.status);
  } else {
    console.error('Network Error:', error);
  }
}
```

## Migration from Legacy APIs

The old `admin-api.ts` file is now deprecated but provides backward compatibility:

```typescript
// OLD (deprecated)
import { adminDashboardApi } from '@/lib/admin-api';
const stats = await adminDashboardApi.getStats();

// NEW (recommended)
import { adminApi } from '@/lib/api';
const stats = await adminApi.dashboard.getStats();
```

## Configuration

API base URL is configured via environment variable:
```env
NEXT_PUBLIC_API_BASE=http://localhost:4000/api
```

Default fallback: `http://localhost:4000/api`

## Benefits

1. **Single Source of Truth**: All API configurations in one place
2. **Better Error Handling**: Consistent error handling across the app
3. **Type Safety**: Full TypeScript support with proper typing
4. **Easy Debugging**: Detailed logging for API calls and errors
5. **Maintainability**: Easy to update, modify, or extend APIs
6. **Performance**: Efficient request handling and caching
7. **Security**: Automatic token management and authentication

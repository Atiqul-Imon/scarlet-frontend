// DEPRECATED: This file is deprecated. Use the centralized API from './api.ts' instead
// All admin APIs have been consolidated into the main api.ts file under adminApi
// 
// Migration Guide:
// - adminDashboardApi.getStats() → adminApi.dashboard.getStats()
// - adminUserApi.getUsers() → adminApi.users.getUsers()
// - adminProductApi.getProducts() → adminApi.products.getProducts()
// - adminOrderApi.getOrders() → adminApi.orders.getOrders()
// - adminAnalyticsApi.getSalesAnalytics() → adminApi.analytics.getSalesAnalytics()
// - adminSettingsApi.getSettings() → adminApi.settings.getSettings()
// - adminLogsApi.getActivityLogs() → adminApi.logs.getActivityLogs()

import { adminApi } from './api';

// Legacy exports for backward compatibility - these will be removed in a future version
export const adminDashboardApi = adminApi.dashboard;
export const adminUserApi = adminApi.users;
export const adminProductApi = adminApi.products;
export const adminOrderApi = adminApi.orders;
export const adminAnalyticsApi = adminApi.analytics;
export const adminSettingsApi = adminApi.settings;
export const adminLogsApi = adminApi.logs;
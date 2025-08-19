// Analytics Dashboard Types

export interface AnalyticsOverview {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  revenueGrowth: number;
  orderGrowth: number;
  customerGrowth: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  profit?: number;
  refunds?: number;
}

export interface ProductPerformance {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  views: number;
  conversionRate: number;
  category: string;
  image?: string;
  profit: number;
  profitMargin: number;
  averageRating: number;
  reviewCount: number;
  stockLevel: number;
  returnRate: number;
}

export interface CustomerDemographic {
  ageGroup: string;
  count: number;
  percentage: number;
  revenue: number;
  averageOrderValue: number;
}

export interface GeographicData {
  city: string;
  state?: string;
  customers: number;
  revenue: number;
  orders: number;
  averageOrderValue: number;
  topProducts: string[];
}

export interface DeviceAnalytics {
  device: 'Mobile' | 'Desktop' | 'Tablet';
  sessions: number;
  percentage: number;
  bounceRate: number;
  conversionRate: number;
  averageSessionDuration: number;
}

export interface SalesFunnelStage {
  stage: string;
  count: number;
  percentage: number;
  dropOffRate?: number;
  conversionRate?: number;
}

export interface PaymentMethodAnalytics {
  method: 'bkash' | 'nagad' | 'rocket' | 'card' | 'cod';
  count: number;
  revenue: number;
  percentage: number;
  averageOrderValue: number;
  successRate: number;
  processingTime?: number;
}

export interface CustomerInsights {
  demographics: CustomerDemographic[];
  geography: GeographicData[];
  devices: DeviceAnalytics[];
  retentionRate: number;
  lifetimeValue: number;
  acquisitionCost: number;
  churnRate: number;
}

export interface MarketingAnalytics {
  channels: Array<{
    channel: string;
    visitors: number;
    conversions: number;
    revenue: number;
    cost: number;
    roi: number;
  }>;
  campaigns: Array<{
    name: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    revenue: number;
    roas: number;
  }>;
}

export interface InventoryAnalytics {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalInventoryValue: number;
  turnoverRate: number;
  deadStock: Array<{
    productId: string;
    name: string;
    daysInStock: number;
    value: number;
  }>;
  fastMovingProducts: Array<{
    productId: string;
    name: string;
    velocity: number;
    revenue: number;
  }>;
}

export interface FinancialMetrics {
  grossRevenue: number;
  netRevenue: number;
  totalCosts: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  operatingExpenses: number;
  taxes: number;
  refunds: number;
  chargebacks: number;
}

export interface TimeSeriesData {
  period: string;
  revenue: number;
  orders: number;
  customers: number;
  profit: number;
  expenses: number;
  refunds: number;
  averageOrderValue: number;
  conversionRate: number;
}

export interface CompetitorAnalysis {
  marketShare: number;
  priceComparison: Array<{
    category: string;
    ourPrice: number;
    competitorAverage: number;
    pricePosition: 'low' | 'average' | 'high';
  }>;
  brandMentions: number;
  sentimentScore: number;
}

export interface PredictiveAnalytics {
  forecastedRevenue: Array<{
    period: string;
    predicted: number;
    confidence: number;
  }>;
  seasonalTrends: Array<{
    month: string;
    multiplier: number;
    category: string;
  }>;
  customerLifetimeValue: number;
  churnPrediction: Array<{
    customerId: string;
    churnProbability: number;
    recommendedActions: string[];
  }>;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  revenueData: RevenueData[];
  productPerformance: ProductPerformance[];
  customerInsights: CustomerInsights;
  salesFunnel: SalesFunnelStage[];
  paymentMethods: PaymentMethodAnalytics[];
  marketing?: MarketingAnalytics;
  inventory?: InventoryAnalytics;
  financial?: FinancialMetrics;
  timeSeries?: TimeSeriesData[];
  competitors?: CompetitorAnalysis;
  predictions?: PredictiveAnalytics;
}

export type DateRange = '7d' | '30d' | '90d' | '1y' | 'custom';

export interface AnalyticsFilters {
  dateRange: DateRange;
  startDate?: string;
  endDate?: string;
  category?: string;
  paymentMethod?: string;
  customerSegment?: string;
  geography?: string;
  device?: string;
}

export interface AnalyticsExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  includeCharts: boolean;
  sections: string[];
  dateRange: DateRange;
  customDateRange?: {
    start: string;
    end: string;
  };
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'funnel';
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  config: Record<string, any>;
  data?: any;
}

export interface CustomDashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Real-time Analytics
export interface RealTimeMetrics {
  activeUsers: number;
  currentOrders: number;
  revenueToday: number;
  ordersToday: number;
  topProductsToday: Array<{
    name: string;
    sales: number;
  }>;
  recentOrders: Array<{
    orderNumber: string;
    customer: string;
    amount: number;
    timestamp: string;
  }>;
  alertsAndNotifications: Array<{
    id: string;
    type: 'warning' | 'info' | 'success' | 'error';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  }>;
}

// Cohort Analysis
export interface CohortAnalysis {
  cohorts: Array<{
    cohortMonth: string;
    customers: number;
    retentionRates: number[]; // retention rates for each subsequent month
  }>;
  averageRetentionRate: number;
  cohortLifetimeValue: number;
}

// A/B Testing Analytics
export interface ABTestResult {
  testId: string;
  testName: string;
  variants: Array<{
    name: string;
    visitors: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    confidence: number;
  }>;
  winner?: string;
  status: 'running' | 'completed' | 'paused';
  startDate: string;
  endDate?: string;
}

// Advanced Segmentation
export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: Record<string, any>;
  customerCount: number;
  revenue: number;
  averageOrderValue: number;
  lifetimeValue: number;
  churnRate: number;
}

import { analyticsApi, AnalyticsEvent } from './api';

// Generate a unique session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get or create session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return generateSessionId();
  
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

// Get device type
function getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

// Get browser info
function getBrowserInfo(): { browser: string; os: string } {
  if (typeof window === 'undefined') return { browser: 'Unknown', os: 'Unknown' };
  
  const userAgent = navigator.userAgent;
  
  // Detect browser
  let browser = 'Unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  
  // Detect OS
  let os = 'Unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';
  
  return { browser, os };
}

// Track analytics event
export async function trackEvent(
  eventType: AnalyticsEvent['eventType'],
  eventData: Record<string, any> = {},
  userId?: string
): Promise<void> {
  try {
    const sessionId = getSessionId();
    const deviceInfo = getBrowserInfo();
    
    const event: AnalyticsEvent = {
      sessionId,
      eventType,
      eventData: {
        ...eventData,
        deviceType: getDeviceType(),
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        page: typeof window !== 'undefined' ? window.location.pathname : undefined,
        referrer: typeof window !== 'undefined' ? document.referrer : undefined,
      }
    };
    
    if (userId) {
      (event as any).userId = userId;
    }
    
    await analyticsApi.trackEvent(event);
  } catch (error) {
    console.error('Failed to track analytics event:', error);
  }
}

// Track page view
export function trackPageView(page: string, userId?: string): void {
  trackEvent('page_view', { page }, userId);
}

// Track product view
export function trackProductView(productId: string, productName: string, categoryId?: string, userId?: string): void {
  trackEvent('product_view', {
    productId,
    productName,
    categoryId,
  }, userId);
}

// Track add to cart
export function trackAddToCart(productId: string, productName: string, quantity: number, price: number, userId?: string): void {
  trackEvent('add_to_cart', {
    productId,
    productName,
    quantity,
    price,
    value: price * quantity,
  }, userId);
}

// Track remove from cart
export function trackRemoveFromCart(productId: string, productName: string, quantity: number, price: number, userId?: string): void {
  trackEvent('remove_from_cart', {
    productId,
    productName,
    quantity,
    price,
    value: price * quantity,
  }, userId);
}

// Track checkout start
export function trackCheckoutStart(cartValue: number, itemCount: number, userId?: string): void {
  trackEvent('checkout_start', {
    value: cartValue,
    itemCount,
  }, userId);
}

// Track checkout complete
export function trackCheckoutComplete(orderId: string, orderValue: number, itemCount: number, userId?: string): void {
  trackEvent('checkout_complete', {
    orderId,
    value: orderValue,
    itemCount,
  }, userId);
}

// Track purchase
export function trackPurchase(orderId: string, orderValue: number, itemCount: number, userId?: string): void {
  trackEvent('purchase', {
    orderId,
    value: orderValue,
    itemCount,
  }, userId);
}

// Track search
export function trackSearch(query: string, resultsCount: number, filters?: Record<string, any>, userId?: string): void {
  trackEvent('search', {
    searchQuery: query,
    resultsCount,
    filters,
  }, userId);
}

// Track filter
export function trackFilter(filters: Record<string, any>, resultsCount: number, userId?: string): void {
  trackEvent('filter', {
    filters,
    resultsCount,
  }, userId);
}

// Track wishlist add
export function trackWishlistAdd(productId: string, productName: string, userId?: string): void {
  trackEvent('wishlist_add', {
    productId,
    productName,
  }, userId);
}

// Track wishlist remove
export function trackWishlistRemove(productId: string, productName: string, userId?: string): void {
  trackEvent('wishlist_remove', {
    productId,
    productName,
  }, userId);
}

// Initialize analytics for the page
export function initializeAnalytics(userId?: string): void {
  if (typeof window === 'undefined') return;
  
  // Track initial page view
  trackPageView(window.location.pathname, userId);
  
  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      trackPageView(window.location.pathname, userId);
    }
  });
}

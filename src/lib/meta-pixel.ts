// Meta Pixel event tracking utilities
// Follows Meta's latest standards (December 2025)
// Prepared for Conversions API (CAPI) integration with event_id deduplication

/**
 * Check if Meta Pixel is loaded and available
 */
export const isMetaPixelLoaded = (): boolean => {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
};

/**
 * Generate a unique event ID for deduplication (for future CAPI integration)
 * Format: {prefix}-{timestamp}-{random}
 */
const generateEventId = (prefix: string = 'event'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Track a Meta Pixel event (with retry if pixel not loaded)
 */
export const trackMetaEvent = (
  eventName: string,
  eventData?: Record<string, any>
): void => {
  // If pixel is loaded, track immediately
  if (isMetaPixelLoaded()) {
    try {
      if (eventData) {
        window.fbq!('track', eventName, eventData);
        if (process.env.NODE_ENV === 'development') {
          console.log(`[MetaPixel] Tracked "${eventName}":`, eventData);
        }
      } else {
        window.fbq!('track', eventName);
        if (process.env.NODE_ENV === 'development') {
          console.log(`[MetaPixel] Tracked "${eventName}"`);
        }
      }
    } catch (error) {
      console.error(`[MetaPixel] Error tracking "${eventName}":`, error);
    }
    return;
  }

  // If pixel not loaded, wait up to 3 seconds and retry
  let attempts = 0;
  const maxAttempts = 30; // 30 attempts × 100ms = 3 seconds
  const retryInterval = setInterval(() => {
    attempts++;
    
    if (isMetaPixelLoaded()) {
      clearInterval(retryInterval);
      try {
        if (eventData) {
          window.fbq!('track', eventName, eventData);
          if (process.env.NODE_ENV === 'development') {
            console.log(`[MetaPixel] Tracked "${eventName}" (after ${attempts * 100}ms):`, eventData);
          }
        } else {
          window.fbq!('track', eventName);
          if (process.env.NODE_ENV === 'development') {
            console.log(`[MetaPixel] Tracked "${eventName}" (after ${attempts * 100}ms)`);
          }
        }
      } catch (error) {
        console.error(`[MetaPixel] Error tracking "${eventName}":`, error);
      }
    } else if (attempts >= maxAttempts) {
      clearInterval(retryInterval);
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[MetaPixel] Pixel not loaded after 3s. Event "${eventName}" not tracked.`);
      }
    }
  }, 100);
};

/**
 * Track PageView event
 */
export const trackPageView = (): void => {
  trackMetaEvent('PageView');
};

/**
 * Track ViewContent event (product detail page)
 */
export const trackViewContent =  (data: {
  content_name: string;
  content_ids: string[];
  content_type: 'product';
  value: number;
  currency: string;
  contents?: Array<{
    id: string;
    quantity: number;
    item_price: number;
  }>;
  event_id?: string; // For CAPI deduplication
}): void => {
  const eventData = {
    ...data,
    event_id: data.event_id || generateEventId(`view-${data.content_ids[0]}`),
  };
  trackMetaEvent('ViewContent', eventData);
};

/**
 * Track AddToCart event
 */
export const trackAddToCart = (data: {
  content_name: string;
  content_ids: string[];
  content_type: 'product';
  value: number;
  currency: string;
  contents: Array<{
    id: string;
    quantity: number;
    item_price: number;
  }>;
  event_id?: string; // For CAPI deduplication
}): void => {
  const eventData = {
    ...data,
    event_id: data.event_id || generateEventId(`addtocart-${data.content_ids[0]}`),
  };
  trackMetaEvent('AddToCart', eventData);
};

/**
 * Track RemoveFromCart event
 */
export const trackRemoveFromCart = (data: {
  content_name: string;
  content_ids: string[];
  content_type: 'product';
  value: number;
  currency: string;
  contents: Array<{
    id: string;
    quantity: number;
    item_price: number;
  }>;
  event_id?: string; // For CAPI deduplication
}): void => {
  const eventData = {
    ...data,
    event_id: data.event_id || generateEventId(`remove-${data.content_ids[0]}`),
  };
  trackMetaEvent('RemoveFromCart', eventData);
};

/**
 * Track InitiateCheckout event
 */
export const trackInitiateCheckout = (data: {
  content_name?: string;
  content_ids: string[];
  content_type: 'product';
  value: number;
  currency: string;
  num_items: number;
  contents: Array<{
    id: string;
    quantity: number;
    item_price: number;
  }>;
  event_id?: string; // For CAPI deduplication
}): void => {
  const eventData = {
    ...data,
    event_id: data.event_id || generateEventId('checkout'),
  };
  trackMetaEvent('InitiateCheckout', eventData);
};

/**
 * Track AddPaymentInfo event
 */
export const trackAddPaymentInfo = (data: {
  content_ids: string[];
  content_type: 'product';
  value: number;
  currency: string;
  contents: Array<{
    id: string;
    quantity: number;
    item_price: number;
  }>;
  event_id?: string; // For CAPI deduplication
}): void => {
  const eventData = {
    ...data,
    event_id: data.event_id || generateEventId('payment'),
  };
  trackMetaEvent('AddPaymentInfo', eventData);
};

/**
 * Track Purchase event (order completion)
 * Includes event_id for CAPI deduplication (ready for future CAPI integration)
 */
export const trackPurchase = (data: {
  content_ids: string[];
  content_type: 'product';
  value: number;
  currency: string;
  num_items: number;
  contents: Array<{
    id: string;
    quantity: number;
    item_price: number;
  }>;
  order_id?: string;
  event_id?: string; // For CAPI deduplication - will be auto-generated if not provided
}): void => {
  // Generate event_id based on order_id if available, otherwise generate unique ID
  const eventId = data.event_id || generateEventId(data.order_id ? `purchase-${data.order_id}` : 'purchase');
  
  const eventData = {
    ...data,
    event_id: eventId,
  };
  
  // Log Purchase event for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('[MetaPixel] Tracking Purchase event:', {
      order_id: data.order_id,
      event_id: eventId,
      value: data.value,
      currency: data.currency,
      num_items: data.num_items
    });
  }
  
  trackMetaEvent('Purchase', eventData);
};

/**
 * Track Search event
 */
export const trackSearch = (data: {
  search_string: string;
  content_ids?: string[];
  content_type?: 'product';
  contents?: Array<{
    id: string;
    quantity: number;
  }>;
  event_id?: string; // For CAPI deduplication
}): void => {
  const eventData = {
    ...data,
    event_id: data.event_id || generateEventId(`search-${data.search_string.substring(0, 10)}`),
  };
  trackMetaEvent('Search', eventData);
};

/**
 * Track CompleteRegistration event
 */
export const trackCompleteRegistration = (data?: {
  status?: boolean;
  method?: string;
  event_id?: string; // For CAPI deduplication
}): void => {
  const eventData = data ? {
    ...data,
    event_id: data.event_id || generateEventId('registration'),
  } : {
    event_id: generateEventId('registration'),
  };
  trackMetaEvent('CompleteRegistration', eventData);
};

/**
 * Track Lead event (consultations, newsletter, etc.)
 */
export const trackLead = (data?: {
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
}): void => {
  trackMetaEvent('Lead', data);
};

/**
 * Track Contact event
 */
export const trackContact = (): void => {
  trackMetaEvent('Contact');
};

/**
 * Helper to format product data for Meta Pixel events
 */
export const formatProductData = (product: {
  _id: string;
  title: string;
  price: { amount: number; currency: string };
  categoryIds?: string[];
  images?: string[];
}): {
  content_name: string;
  content_ids: string[];
  content_type: 'product';
  value: number;
  currency: string;
} => {
  return {
    content_name: product.title,
    content_ids: [product._id],
    content_type: 'product',
    value: product.price.amount,
    currency: product.price.currency || 'BDT',
  };
};

/**
 * Helper to format cart items for Meta Pixel events
 */
export const formatCartItems = (items: Array<{
  product: {
    _id: string;
    title: string;
    price: { amount: number; currency: string };
  };
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}>): {
  content_ids: string[];
  contents: Array<{
    id: string;
    quantity: number;
    item_price: number;
  }>;
  value: number;
  currency: string;
  num_items: number;
} => {
  const contentIds: string[] = [];
  const contents: Array<{
    id: string;
    quantity: number;
    item_price: number;
  }> = [];
  let totalValue = 0;
  let totalItems = 0;

  items.forEach((item) => {
    const productId = item.product._id;
    const price = item.product.price.amount;
    const quantity = item.quantity;

    contentIds.push(productId);
    contents.push({
      id: productId,
      quantity,
      item_price: price,
    });

    totalValue += price * quantity;
    totalItems += quantity;
  });

  return {
    content_ids: contentIds,
    contents,
    value: totalValue,
    currency: items[0]?.product.price.currency || 'BDT',
    num_items: totalItems,
  };
};



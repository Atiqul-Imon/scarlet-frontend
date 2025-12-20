// Meta Pixel event tracking utilities
// Follows Meta's latest standards (December 2025)

/**
 * Check if Meta Pixel is loaded and available
 */
export const isMetaPixelLoaded = (): boolean => {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
};

/**
 * Track a Meta Pixel event
 */
export const trackMetaEvent = (
  eventName: string,
  eventData?: Record<string, any>
): void => {
  if (!isMetaPixelLoaded()) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Meta Pixel not loaded. Event "${eventName}" not tracked.`);
    }
    return;
  }

  try {
    if (eventData) {
      window.fbq!('track', eventName, eventData);
    } else {
      window.fbq!('track', eventName);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error tracking Meta Pixel event:', error);
    }
  }
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
export const trackViewContent = (data: {
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
}): void => {
  trackMetaEvent('ViewContent', data);
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
}): void => {
  trackMetaEvent('AddToCart', data);
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
}): void => {
  trackMetaEvent('RemoveFromCart', data);
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
}): void => {
  trackMetaEvent('InitiateCheckout', data);
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
}): void => {
  trackMetaEvent('AddPaymentInfo', data);
};

/**
 * Track Purchase event (order completion)
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
}): void => {
  trackMetaEvent('Purchase', data);
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
}): void => {
  trackMetaEvent('Search', data);
};

/**
 * Track CompleteRegistration event
 */
export const trackCompleteRegistration = (data?: {
  status?: boolean;
  method?: string;
}): void => {
  trackMetaEvent('CompleteRegistration', data);
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



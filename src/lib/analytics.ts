// Google Analytics utility functions

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
    if (gaId) {
      window.gtag('config', gaId, {
        page_title: title || document.title,
        page_location: url,
      });
    }
  }
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track e-commerce events
export const trackPurchase = (transactionId: string, value: number, currency: string = 'BDT') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
    });
  }
};

// Track add to cart events
export const trackAddToCart = (itemId: string, itemName: string, value: number, quantity: number = 1) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'BDT',
      value: value,
      items: [{
        item_id: itemId,
        item_name: itemName,
        quantity: quantity,
        price: value,
      }],
    });
  }
};

// Track search events
export const trackSearch = (searchTerm: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchTerm,
    });
  }
};

// Track product views
export const trackProductView = (productId: string, productName: string, category: string, price: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'BDT',
      value: price,
      items: [{
        item_id: productId,
        item_name: productName,
        category: category,
        price: price,
      }],
    });
  }
};
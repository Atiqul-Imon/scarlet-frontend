import { ChatLanguage } from '../types';
import { chatConfig, whatsappTemplates } from '../config/chatConfig';
import logger from '@/lib/logger';

export interface WhatsAppMessageOptions {
  language: ChatLanguage;
  productId?: string;
  productName?: string;
  orderId?: string;
  customMessage?: string;
  includeBusinessInfo?: boolean;
}

export class WhatsAppService {
  private static instance: WhatsAppService;

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  /**
   * Generate a WhatsApp message based on the context
   */
  public generateMessage(options: WhatsAppMessageOptions): string {
    const { language, productId, productName, orderId, customMessage, includeBusinessInfo = true } = options;

    let message = '';

    if (customMessage) {
      message = customMessage;
    } else if (productId || productName) {
      const productInfo = productName || `Product ID: ${productId}`;
      message = whatsappTemplates.productInquiry[language].replace('{product_name}', productInfo);
    } else if (orderId) {
      message = whatsappTemplates.orderStatus[language].replace('{order_id}', orderId);
    } else {
      message = chatConfig.whatsapp.welcomeMessage[language];
    }

    // Add business info if requested
    if (includeBusinessInfo) {
      const businessInfo = language === 'bn' 
        ? `\n\n📱 ${chatConfig.whatsapp.businessName} থেকে পাঠানো`
        : `\n\n📱 Sent from ${chatConfig.whatsapp.businessName}`;
      message += businessInfo;
    }

    return message;
  }

  /**
   * Create WhatsApp URL for click-to-chat
   */
  public createWhatsAppURL(message: string, forceWeb = false): string {
    const phoneNumber = chatConfig.whatsapp.phoneNumber.replace(/[^\d]/g, '');
    const encodedMessage = encodeURIComponent(message);
    
    // Detect if user is on mobile
    const isMobile = !forceWeb && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      return `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`;
    } else {
      return `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
    }
  }

  /**
   * Open WhatsApp with a message
   */
  public openWhatsApp(options: WhatsAppMessageOptions, forceWeb = false): void {
    const message = this.generateMessage(options);
    const url = this.createWhatsAppURL(message, forceWeb);
    
    // Track the interaction
    this.trackWhatsAppInteraction(options);
    
    // Open WhatsApp
    window.open(url, '_blank');
  }

  /**
   * Create a pre-filled message for product inquiry
   */
  public createProductInquiry(productId: string, productName: string, language: ChatLanguage): string {
    const template = whatsappTemplates.productInquiry[language];
    return template.replace('{product_name}', productName);
  }

  /**
   * Create a pre-filled message for order status
   */
  public createOrderStatusInquiry(orderId: string, language: ChatLanguage): string {
    const template = whatsappTemplates.orderStatus[language];
    return template.replace('{order_id}', orderId);
  }

  /**
   * Get quick action messages
   */
  public getQuickActionMessage(action: string, language: ChatLanguage): string {
    switch (action) {
      case 'delivery-info':
        return whatsappTemplates.deliveryInfo[language];
      case 'return-policy':
        return whatsappTemplates.returnPolicy[language];
      case 'general-support':
        return whatsappTemplates.generalSupport[language];
      default:
        return chatConfig.whatsapp.welcomeMessage[language];
    }
  }

  /**
   * Check if WhatsApp is available on the device
   */
  public isWhatsAppAvailable(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    // WhatsApp Web is available on desktop, WhatsApp app on mobile
    return true; // Always available since we support both web and app
  }

  /**
   * Get the appropriate WhatsApp platform name
   */
  public getPlatformName(language: ChatLanguage): string {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (language === 'bn') {
      return isMobile ? 'WhatsApp অ্যাপ' : 'WhatsApp Web';
    } else {
      return isMobile ? 'WhatsApp App' : 'WhatsApp Web';
    }
  }

  /**
   * Track WhatsApp interactions for analytics
   */
  private trackWhatsAppInteraction(options: WhatsAppMessageOptions): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      const eventLabel = options.productId ? 'product_inquiry' 
                       : options.orderId ? 'order_status'
                       : options.customMessage ? 'custom_message'
                       : 'general_inquiry';

      (window as any).gtag('event', 'whatsapp_chat_initiated', {
        event_category: 'chat',
        event_label: eventLabel,
        language: options.language,
        value: 1
      });
    }

    // You can also send to your own analytics endpoint
    if (typeof window !== 'undefined') {
      try {
        fetch('/api/analytics/chat-interaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            platform: 'whatsapp',
            action: 'chat_initiated',
            language: options.language,
            context: {
              productId: options.productId,
              orderId: options.orderId,
              hasCustomMessage: !!options.customMessage
            },
            timestamp: new Date().toISOString()
          })
        }).catch(err => logger.warn('Analytics tracking failed', err));
      } catch (error) {
        logger.error('Analytics tracking error', error);
      }
    }
  }
}

// Export singleton instance
export const whatsappService = WhatsAppService.getInstance();

// Utility functions for easy access
export const openWhatsAppChat = (options: WhatsAppMessageOptions) => {
  whatsappService.openWhatsApp(options);
};

export const createProductWhatsAppURL = (productId: string, productName: string, language: ChatLanguage) => {
  const message = whatsappService.createProductInquiry(productId, productName, language);
  return whatsappService.createWhatsAppURL(message);
};

export const createOrderWhatsAppURL = (orderId: string, language: ChatLanguage) => {
  const message = whatsappService.createOrderStatusInquiry(orderId, language);
  return whatsappService.createWhatsAppURL(message);
};

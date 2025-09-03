import { ChatLanguage } from '../types';
import { chatConfig, messengerTemplates } from '../config/chatConfig';

export interface MessengerMessageOptions {
  language: ChatLanguage;
  productId?: string;
  productName?: string;
  orderId?: string;
  customMessage?: string;
  userId?: string;
}

// Extend the Window interface to include Facebook SDK
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export class MessengerService {
  private static instance: MessengerService;
  private isSDKLoaded = false;
  private sdkLoadPromise: Promise<void> | null = null;

  public static getInstance(): MessengerService {
    if (!MessengerService.instance) {
      MessengerService.instance = new MessengerService();
    }
    return MessengerService.instance;
  }

  /**
   * Initialize Facebook SDK
   */
  public async initializeSDK(): Promise<void> {
    if (this.isSDKLoaded) return;
    
    if (this.sdkLoadPromise) {
      return this.sdkLoadPromise;
    }

    this.sdkLoadPromise = new Promise((resolve, reject) => {
      try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
          resolve();
          return;
        }

        // Set up Facebook SDK initialization
        window.fbAsyncInit = () => {
          try {
            if (!window.FB) {
              console.warn('Facebook SDK not available');
              resolve();
              return;
            }

            window.FB.init({
              appId: chatConfig.messenger.appId,
              cookie: true,
              xfbml: true,
              version: 'v18.0'
            });

            // Enable Customer Chat Plugin
            if (window.FB.XFBML) {
              window.FB.XFBML.parse();
            }
            
            this.isSDKLoaded = true;
            console.log('Facebook SDK initialized successfully');
            resolve();
          } catch (error) {
            console.error('Error initializing Facebook SDK:', error);
            resolve(); // Don't fail, just continue without SDK
          }
        };

        // Load Facebook SDK script if not already loaded
        if (!document.getElementById('facebook-jssdk')) {
          const script = document.createElement('script');
          script.id = 'facebook-jssdk';
          script.src = 'https://connect.facebook.net/en_US/sdk.js';
          script.async = true;
          script.defer = true;
          script.crossOrigin = 'anonymous';
          
          script.onload = () => {
            console.log('Facebook SDK loaded successfully');
            // Initialize after script loads
            if (window.fbAsyncInit) {
              window.fbAsyncInit();
            }
          };
          
          script.onerror = (error) => {
            console.error('Failed to load Facebook SDK:', error);
            // Try fallback - don't reject, just resolve without SDK
            console.warn('Facebook SDK failed to load, continuing without it');
            resolve();
          };

          document.head.appendChild(script);
        } else {
          // SDK already loaded, just initialize
          if (window.FB) {
            window.fbAsyncInit();
          } else {
            // Wait a bit for FB to be available
            let attempts = 0;
            const checkFB = setInterval(() => {
              attempts++;
              if (window.FB || attempts > 10) {
                clearInterval(checkFB);
                if (window.FB && window.fbAsyncInit) {
                  window.fbAsyncInit();
                } else {
                  resolve();
                }
              }
            }, 100);
          }
        }
      } catch (error) {
        reject(error);
      }
    });

    return this.sdkLoadPromise;
  }

  /**
   * Generate a Messenger message based on context
   */
  public generateMessage(options: MessengerMessageOptions): string {
    const { language, productId, productName, orderId, customMessage } = options;

    if (customMessage) {
      return customMessage;
    }

    if (productId || productName) {
      const productInfo = productName || `Product ID: ${productId}`;
      return messengerTemplates.productInquiry[language].replace('{product_name}', productInfo);
    }

    if (orderId) {
      return messengerTemplates.orderStatus[language].replace('{order_id}', orderId);
    }

    return chatConfig.messenger.welcomeMessage[language];
  }

  /**
   * Open Messenger chat
   */
  public async openMessenger(options: MessengerMessageOptions): Promise<void> {
    try {
      await this.initializeSDK();
      
      // Track the interaction
      this.trackMessengerInteraction(options);

      // For Messenger, we'll use the Customer Chat Plugin
      // The message will be handled by the plugin
      if (window.FB && window.FB.CustomerChat) {
        // Show the customer chat
        window.FB.CustomerChat.showDialog();
        
        // If we have a custom message, we can't pre-fill it directly
        // but we can store it for the business to see in their admin panel
        if (options.customMessage || options.productId || options.orderId) {
          this.sendContextToPage(options);
        }
      } else {
        // Fallback: Open Facebook page in new window
        const pageUrl = `https://m.me/${chatConfig.messenger.pageId}`;
        window.open(pageUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to open Messenger:', error);
      // Fallback: Open Facebook page
      const pageUrl = `https://m.me/${chatConfig.messenger.pageId}`;
      window.open(pageUrl, '_blank');
    }
  }

  /**
   * Get quick action message for Messenger
   */
  public getQuickActionMessage(action: string, language: ChatLanguage): string {
    switch (action) {
      case 'product-inquiry':
        return messengerTemplates.productInquiry[language];
      case 'order-status':
        return messengerTemplates.orderStatus[language];
      case 'delivery-info':
        return messengerTemplates.deliveryInfo[language];
      case 'return-policy':
        return messengerTemplates.returnPolicy[language];
      case 'beauty-consultation':
        return messengerTemplates.beautyConsultation[language];
      case 'general-support':
        return messengerTemplates.generalSupport[language];
      default:
        return chatConfig.messenger.welcomeMessage[language];
    }
  }

  /**
   * Configure Customer Chat Plugin
   */
  public configureCustomerChat(language: ChatLanguage = 'en'): void {
    if (typeof window === 'undefined') return;

    try {
      // Create customer chat div if it doesn't exist
      let chatDiv = document.getElementById('fb-customer-chat');
      if (!chatDiv) {
        chatDiv = document.createElement('div');
        chatDiv.id = 'fb-customer-chat';
        chatDiv.className = 'fb-customerchat';
        document.body.appendChild(chatDiv);
      }

      // Only configure if we have valid page ID
      if (!chatConfig.messenger.pageId || chatConfig.messenger.pageId === 'your-facebook-page-id') {
        console.warn('Facebook Page ID not configured');
        return;
      }

      // Set attributes
      chatDiv.setAttribute('attribution', 'biz_inbox');
      chatDiv.setAttribute('page_id', chatConfig.messenger.pageId);
      chatDiv.setAttribute('theme_color', chatConfig.messenger.themeColor);
      
      // Set language-specific greetings
      const loggedInGreeting = chatConfig.messenger.loggedInGreeting[language];
      const loggedOutGreeting = chatConfig.messenger.loggedOutGreeting[language];
      
      chatDiv.setAttribute('logged_in_greeting', loggedInGreeting);
      chatDiv.setAttribute('logged_out_greeting', loggedOutGreeting);
      
      // Set locale
      const locale = language === 'bn' ? 'bn_BD' : 'en_US';
      chatDiv.setAttribute('locale', locale);

      console.log('Customer Chat configured for language:', language);
    } catch (error) {
      console.error('Error configuring Customer Chat:', error);
    }
  }

  /**
   * Send context information to the page (for business admin)
   */
  private async sendContextToPage(options: MessengerMessageOptions): Promise<void> {
    try {
      // This would typically send context to your backend
      // which can then be displayed in your Facebook Page admin panel
      const contextData = {
        timestamp: new Date().toISOString(),
        language: options.language,
        productId: options.productId,
        productName: options.productName,
        orderId: options.orderId,
        customMessage: options.customMessage,
        userId: options.userId
      };

      // Send to your backend API
      if (typeof window !== 'undefined') {
        fetch('/api/messenger/context', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(contextData)
        }).catch(err => console.log('Context tracking failed:', err));
      }
    } catch (error) {
      console.log('Failed to send context:', error);
    }
  }

  /**
   * Track Messenger interactions for analytics
   */
  private trackMessengerInteraction(options: MessengerMessageOptions): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      const eventLabel = options.productId ? 'product_inquiry' 
                       : options.orderId ? 'order_status'
                       : options.customMessage ? 'custom_message'
                       : 'general_inquiry';

      (window as any).gtag('event', 'messenger_chat_initiated', {
        event_category: 'chat',
        event_label: eventLabel,
        language: options.language,
        value: 1
      });
    }

    // Send to your analytics endpoint
    if (typeof window !== 'undefined') {
      try {
        fetch('/api/analytics/chat-interaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            platform: 'messenger',
            action: 'chat_initiated',
            language: options.language,
            context: {
              productId: options.productId,
              orderId: options.orderId,
              hasCustomMessage: !!options.customMessage
            },
            timestamp: new Date().toISOString()
          })
        }).catch(err => console.log('Analytics tracking failed:', err));
      } catch (error) {
        console.log('Analytics tracking error:', error);
      }
    }
  }

  /**
   * Check if Messenger is available
   */
  public isMessengerAvailable(): boolean {
    return typeof window !== 'undefined' && 
           (!!window.FB || document.getElementById('facebook-jssdk') !== null);
  }

  /**
   * Get platform name
   */
  public getPlatformName(language: ChatLanguage): string {
    if (language === 'bn') {
      return 'Facebook Messenger';
    } else {
      return 'Facebook Messenger';
    }
  }
}

// Export singleton instance
export const messengerService = MessengerService.getInstance();

// Utility functions for easy access
export const openMessengerChat = (options: MessengerMessageOptions) => {
  messengerService.openMessenger(options);
};

export const initializeMessenger = (language: ChatLanguage = 'en') => {
  messengerService.configureCustomerChat(language);
  return messengerService.initializeSDK();
};

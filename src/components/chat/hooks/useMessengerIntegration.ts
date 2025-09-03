"use client";
import { useState, useCallback, useEffect } from 'react';
import { ChatLanguage } from '../types';
import { messengerService } from '../utils/messengerUtils';
import { MessengerMessageOptions } from '../utils/messengerUtils';

export interface UseMessengerIntegrationOptions {
  defaultLanguage?: ChatLanguage;
  trackAnalytics?: boolean;
  autoInitialize?: boolean;
}

export function useMessengerIntegration(options: UseMessengerIntegrationOptions = {}) {
  const { defaultLanguage = 'en', trackAnalytics = true, autoInitialize = true } = options;
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');

  // Initialize Messenger SDK
  useEffect(() => {
    if (autoInitialize && typeof window !== 'undefined') {
      const initSDK = async () => {
        try {
          await messengerService.initializeSDK();
          messengerService.configureCustomerChat(defaultLanguage);
          setIsSDKLoaded(true);
        } catch (err) {
          setError('Failed to initialize Messenger SDK');
          console.error('Messenger SDK initialization failed:', err);
        }
      };

      initSDK();
    }
  }, [autoInitialize, defaultLanguage]);

  /**
   * Open Messenger with a custom message
   */
  const openMessenger = useCallback(async (messageOptions: MessengerMessageOptions) => {
    setIsConnecting(true);
    setError('');
    
    try {
      await messengerService.openMessenger({
        language: defaultLanguage,
        ...messageOptions
      });
      
      // Track analytics if enabled
      if (trackAnalytics && typeof window !== 'undefined') {
        // Custom analytics tracking
        const eventData = {
          event: 'messenger_chat_initiated',
          language: messageOptions.language || defaultLanguage,
          product_id: messageOptions.productId,
          order_id: messageOptions.orderId,
          has_custom_message: !!messageOptions.customMessage
        };
        
        // Send to your analytics service
        console.log('Messenger Analytics:', eventData);
      }
      
    } catch (error) {
      console.error('Failed to open Messenger:', error);
      setError('Failed to open Messenger');
    } finally {
      setTimeout(() => setIsConnecting(false), 2000);
    }
  }, [defaultLanguage, trackAnalytics]);

  /**
   * Share a product via Messenger
   */
  const shareProduct = useCallback((productId: string, productName: string, language: ChatLanguage = defaultLanguage) => {
    return openMessenger({
      language,
      productId,
      productName
    });
  }, [openMessenger, defaultLanguage]);

  /**
   * Check order status via Messenger
   */
  const checkOrderStatus = useCallback((orderId: string, language: ChatLanguage = defaultLanguage) => {
    return openMessenger({
      language,
      orderId
    });
  }, [openMessenger, defaultLanguage]);

  /**
   * Send a custom message via Messenger
   */
  const sendCustomMessage = useCallback((message: string, language: ChatLanguage = defaultLanguage) => {
    return openMessenger({
      language,
      customMessage: message
    });
  }, [openMessenger, defaultLanguage]);

  /**
   * Show the Messenger Customer Chat widget
   */
  const showCustomerChat = useCallback(() => {
    if (typeof window !== 'undefined' && window.FB?.CustomerChat) {
      window.FB.CustomerChat.showDialog();
    }
  }, []);

  /**
   * Hide the Messenger Customer Chat widget
   */
  const hideCustomerChat = useCallback(() => {
    if (typeof window !== 'undefined' && window.FB?.CustomerChat) {
      window.FB.CustomerChat.hideDialog();
    }
  }, []);

  /**
   * Check if Messenger is available on the current device
   */
  const isMessengerAvailable = useCallback((): boolean => {
    return messengerService.isMessengerAvailable();
  }, []);

  /**
   * Get the platform name
   */
  const getPlatformName = useCallback((language: ChatLanguage = defaultLanguage): string => {
    return messengerService.getPlatformName(language);
  }, [defaultLanguage]);

  /**
   * Reinitialize SDK with new language
   */
  const reinitializeWithLanguage = useCallback(async (language: ChatLanguage) => {
    try {
      messengerService.configureCustomerChat(language);
      if (typeof window !== 'undefined' && window.FB?.XFBML) {
        window.FB.XFBML.parse();
      }
    } catch (err) {
      console.error('Failed to reinitialize Messenger with new language:', err);
    }
  }, []);

  /**
   * Get quick action message
   */
  const getQuickActionMessage = useCallback((action: string, language: ChatLanguage = defaultLanguage): string => {
    return messengerService.getQuickActionMessage(action, language);
  }, [defaultLanguage]);

  return {
    // State
    isSDKLoaded,
    isConnecting,
    error,
    
    // Actions
    openMessenger,
    shareProduct,
    checkOrderStatus,
    sendCustomMessage,
    showCustomerChat,
    hideCustomerChat,
    reinitializeWithLanguage,
    
    // Utilities
    isMessengerAvailable,
    getPlatformName,
    getQuickActionMessage
  };
}

// Default export for convenience
export default useMessengerIntegration;

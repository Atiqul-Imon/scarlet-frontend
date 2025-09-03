"use client";
import { useState, useCallback } from 'react';
import { ChatLanguage } from '../types';
import { whatsappService, WhatsAppMessageOptions } from '../utils/whatsappUtils';

export interface UseWhatsAppIntegrationOptions {
  defaultLanguage?: ChatLanguage;
  trackAnalytics?: boolean;
}

export function useWhatsAppIntegration(options: UseWhatsAppIntegrationOptions = {}) {
  const { defaultLanguage = 'en', trackAnalytics = true } = options;
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>('');

  /**
   * Open WhatsApp with a custom message
   */
  const openWhatsApp = useCallback(async (messageOptions: WhatsAppMessageOptions) => {
    setIsRedirecting(true);
    
    try {
      const message = whatsappService.generateMessage({
        language: defaultLanguage,
        ...messageOptions
      });
      
      setLastMessage(message);
      whatsappService.openWhatsApp({ language: defaultLanguage, ...messageOptions });
      
      // Track analytics if enabled
      if (trackAnalytics && typeof window !== 'undefined') {
        // Custom analytics tracking
        const eventData = {
          event: 'whatsapp_chat_initiated',
          language: messageOptions.language || defaultLanguage,
          product_id: messageOptions.productId,
          order_id: messageOptions.orderId,
          has_custom_message: !!messageOptions.customMessage
        };
        
        // Send to your analytics service
        console.log('WhatsApp Analytics:', eventData);
      }
      
    } catch (error) {
      console.error('Failed to open WhatsApp:', error);
    } finally {
      setTimeout(() => setIsRedirecting(false), 2000);
    }
  }, [defaultLanguage, trackAnalytics]);

  /**
   * Share a product via WhatsApp
   */
  const shareProduct = useCallback((productId: string, productName: string, language: ChatLanguage = defaultLanguage) => {
    return openWhatsApp({
      language,
      productId,
      productName
    });
  }, [openWhatsApp, defaultLanguage]);

  /**
   * Check order status via WhatsApp
   */
  const checkOrderStatus = useCallback((orderId: string, language: ChatLanguage = defaultLanguage) => {
    return openWhatsApp({
      language,
      orderId
    });
  }, [openWhatsApp, defaultLanguage]);

  /**
   * Send a custom message via WhatsApp
   */
  const sendCustomMessage = useCallback((message: string, language: ChatLanguage = defaultLanguage) => {
    return openWhatsApp({
      language,
      customMessage: message
    });
  }, [openWhatsApp, defaultLanguage]);

  /**
   * Get a shareable WhatsApp URL
   */
  const getWhatsAppURL = useCallback((messageOptions: WhatsAppMessageOptions): string => {
    const message = whatsappService.generateMessage({
      language: defaultLanguage,
      ...messageOptions
    });
    return whatsappService.createWhatsAppURL(message);
  }, [defaultLanguage]);

  /**
   * Check if WhatsApp is available on the current device
   */
  const isWhatsAppAvailable = useCallback((): boolean => {
    return whatsappService.isWhatsAppAvailable();
  }, []);

  /**
   * Get the platform name (WhatsApp App or WhatsApp Web)
   */
  const getPlatformName = useCallback((language: ChatLanguage = defaultLanguage): string => {
    return whatsappService.getPlatformName(language);
  }, [defaultLanguage]);

  return {
    // State
    isRedirecting,
    lastMessage,
    
    // Actions
    openWhatsApp,
    shareProduct,
    checkOrderStatus,
    sendCustomMessage,
    
    // Utilities
    getWhatsAppURL,
    isWhatsAppAvailable,
    getPlatformName
  };
}

// Default export for convenience
export default useWhatsAppIntegration;

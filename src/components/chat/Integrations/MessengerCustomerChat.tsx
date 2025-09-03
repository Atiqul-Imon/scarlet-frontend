"use client";
import * as React from 'react';
import { ChatLanguage } from '../types';
import { messengerService } from '../utils/messengerUtils';

interface MessengerCustomerChatProps {
  language?: ChatLanguage;
  autoShow?: boolean;
  className?: string;
}

/**
 * Facebook Messenger Customer Chat Plugin
 * This component renders the official Facebook Customer Chat plugin
 * which provides a native Messenger experience embedded in the website
 */
export default function MessengerCustomerChat({
  language = 'en',
  autoShow = false,
  className = ''
}: MessengerCustomerChatProps) {
  const [isSDKLoaded, setIsSDKLoaded] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(autoShow);
  const [isClient, setIsClient] = React.useState(false);

  // Client-side hydration fix
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize Messenger SDK and Customer Chat
  React.useEffect(() => {
    if (!isClient) return;
    
    let mounted = true;

    const initializeMessenger = async () => {
      try {
        // Configure customer chat with current language
        messengerService.configureCustomerChat(language);
        
        // Initialize SDK
        await messengerService.initializeSDK();
        
        if (mounted) {
          setIsSDKLoaded(true);
          
          // Auto-show if requested
          if (autoShow && typeof window !== 'undefined' && window.FB?.CustomerChat) {
            setTimeout(() => {
              window.FB.CustomerChat.showDialog();
            }, 1000);
          }
        }
      } catch (error) {
        console.error('Failed to initialize Messenger Customer Chat:', error);
      }
    };

    initializeMessenger();

    return () => {
      mounted = false;
    };
  }, [isClient, language, autoShow]);

  // Update language when it changes
  React.useEffect(() => {
    if (isSDKLoaded) {
      messengerService.configureCustomerChat(language);
      
      // Re-parse XFBML to apply new language settings
      if (typeof window !== 'undefined' && window.FB?.XFBML) {
        window.FB.XFBML.parse();
      }
    }
  }, [language, isSDKLoaded]);

  const showCustomerChat = () => {
    if (typeof window !== 'undefined' && window.FB?.CustomerChat) {
      window.FB.CustomerChat.showDialog();
      setIsVisible(true);
    }
  };

  const hideCustomerChat = () => {
    if (typeof window !== 'undefined' && window.FB?.CustomerChat) {
      window.FB.CustomerChat.hideDialog();
      setIsVisible(false);
    }
  };

  const toggleCustomerChat = () => {
    if (isVisible) {
      hideCustomerChat();
    } else {
      showCustomerChat();
    }
  };

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* Facebook Customer Chat Plugin Container */}
      <div 
        id="fb-customer-chat" 
        className={`fb-customerchat ${className}`}
        suppressHydrationWarning
      />

      {/* Custom Controls (Optional) */}
      {isSDKLoaded && (
        <div className="messenger-controls hidden">
          <button
            onClick={showCustomerChat}
            className="messenger-show-btn"
            aria-label={language === 'bn' ? 'Messenger চ্যাট দেখান' : 'Show Messenger Chat'}
          >
            Show Chat
          </button>
          
          <button
            onClick={hideCustomerChat}
            className="messenger-hide-btn"
            aria-label={language === 'bn' ? 'Messenger চ্যাট লুকান' : 'Hide Messenger Chat'}
          >
            Hide Chat
          </button>
          
          <button
            onClick={toggleCustomerChat}
            className="messenger-toggle-btn"
            aria-label={language === 'bn' ? 'Messenger চ্যাট টগল করুন' : 'Toggle Messenger Chat'}
          >
            Toggle Chat
          </button>
        </div>
      )}

      {/* Loading indicator for development */}
      {process.env.NODE_ENV === 'development' && !isSDKLoaded && (
        <div className="fixed bottom-4 left-4 bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs">
          Loading Messenger...
        </div>
      )}
    </>
  );
}

// Hook for controlling Messenger Customer Chat from other components
export function useMessengerCustomerChat() {
  const [isAvailable, setIsAvailable] = React.useState(false);

  React.useEffect(() => {
    const checkAvailability = () => {
      const available = typeof window !== 'undefined' && 
                       window.FB?.CustomerChat && 
                       messengerService.isMessengerAvailable();
      setIsAvailable(available);
    };

    // Check immediately
    checkAvailability();

    // Check periodically until available
    const interval = setInterval(() => {
      if (!isAvailable) {
        checkAvailability();
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAvailable]);

  const showChat = React.useCallback(() => {
    if (isAvailable && window.FB?.CustomerChat) {
      window.FB.CustomerChat.showDialog();
    }
  }, [isAvailable]);

  const hideChat = React.useCallback(() => {
    if (isAvailable && window.FB?.CustomerChat) {
      window.FB.CustomerChat.hideDialog();
    }
  }, [isAvailable]);

  const toggleChat = React.useCallback(() => {
    if (isAvailable && window.FB?.CustomerChat) {
      // Facebook doesn't provide a direct toggle, so we'll implement our own logic
      // This is a simplified version - in production you might want to track state
      window.FB.CustomerChat.showDialog();
    }
  }, [isAvailable]);

  return {
    isAvailable,
    showChat,
    hideChat,
    toggleChat
  };
}

"use client";
import * as React from 'react';
import { ChatLanguage } from '../types';
import { chatConfig, messengerTemplates, isBusinessHours } from '../config/chatConfig';
import { messengerService } from '../utils/messengerUtils';

interface MessengerChatProps {
  language: ChatLanguage;
  message?: string;
  productId?: string;
  orderId?: string;
  onClose?: () => void;
}

export default function MessengerChat({
  language,
  message = '',
  productId,
  orderId,
  onClose
}: MessengerChatProps) {
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isSDKLoaded, setIsSDKLoaded] = React.useState(false);
  const [error, setError] = React.useState<string>('');

  const generateMessengerMessage = (): string => {
    if (message) {
      return message;
    }

    // Auto-generate message based on context
    if (productId) {
      return messengerTemplates.productInquiry[language].replace('{product_name}', `Product ID: ${productId}`);
    }

    if (orderId) {
      return messengerTemplates.orderStatus[language].replace('{order_id}', orderId);
    }

    // Default welcome message
    return chatConfig.messenger.welcomeMessage[language];
  };

  const openMessenger = async () => {
    setIsConnecting(true);
    setError('');

    try {
      await messengerService.openMessenger({
        language,
        customMessage: message,
        productId,
        orderId
      });

      // Track the interaction
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'messenger_chat_initiated', {
          event_category: 'chat',
          event_label: productId ? 'product_inquiry' : orderId ? 'order_status' : 'general',
          value: 1
        });
      }

      // Close the chat widget after a delay
      setTimeout(() => {
        setIsConnecting(false);
        if (onClose) {
          onClose();
        }
      }, 2000);

    } catch (error) {
      console.error('Failed to open Messenger:', error);
      setError(language === 'bn' ? 'Messenger খুলতে সমস্যা হয়েছে' : 'Failed to open Messenger');
      setIsConnecting(false);
    }
  };

  // Initialize Messenger SDK
  React.useEffect(() => {
    // Only initialize on client side
    if (typeof window === 'undefined') return;

    const initSDK = async () => {
      try {
        // Add timeout to prevent hanging
        const initPromise = messengerService.initializeSDK();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('SDK initialization timeout')), 10000)
        );

        await Promise.race([initPromise, timeoutPromise]);
        messengerService.configureCustomerChat(language);
        setIsSDKLoaded(true);
      } catch (error) {
        console.error('Failed to initialize Messenger SDK:', error);
        setError(language === 'bn' ? 'Messenger লোড করতে সমস্যা হয়েছে' : 'Failed to load Messenger');
        // Don't block the UI, continue without SDK
        setIsSDKLoaded(false);
      }
    };

    initSDK();
  }, [language]);

  // Auto-open Messenger after component mounts and SDK is loaded
  React.useEffect(() => {
    // Only auto-open if SDK loaded successfully or after a reasonable wait
    if ((isSDKLoaded || error) && !isConnecting) {
      const timer = setTimeout(() => {
        openMessenger();
      }, error ? 500 : 1000); // Faster fallback if there's an error

      return () => clearTimeout(timer);
    }
  }, [isSDKLoaded, error]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-2xl">
      {/* Messenger Logo */}
      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 3.54 1.84 6.65 4.61 8.44v3.56l3.42-1.88C10.68 21.88 11.32 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1.13 13.83l-2.61-2.79-5.09 2.79L10.52 10l2.61 2.79L18.22 10l-5.09 5.83z"/>
        </svg>
      </div>

      {/* Status Message */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          {error ? (
            language === 'bn' ? 'সমস্যা হয়েছে' : 'Connection Error'
          ) : isConnecting ? (
            language === 'bn' ? 'Messenger এ নিয়ে যাওয়া হচ্ছে...' : 'Opening Messenger...'
          ) : !isSDKLoaded ? (
            language === 'bn' ? 'Messenger লোড হচ্ছে...' : 'Loading Messenger...'
          ) : (
            language === 'bn' ? 'Messenger এ চ্যাট করুন' : 'Chat on Messenger'
          )}
        </h3>
        <p className="text-sm text-blue-700">
          {error ? (
            <span className="text-red-600">
              {language === 'bn' 
                ? 'দয়া করে আবার চেষ্টা করুন বা সরাসরি আমাদের Facebook পেজে যান'
                : 'Please try again or visit our Facebook page directly'
              }
            </span>
          ) : (
            language === 'bn' 
              ? 'আমাদের টিম আপনাকে সাহায্য করার জন্য প্রস্তুত'
              : 'Our team is ready to help you'
          )}
        </p>
      </div>

      {/* Loading Animation */}
      {(isConnecting || !isSDKLoaded) && !error && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      )}

      {/* Message Preview */}
      {!error && (
        <div className="bg-white rounded-xl p-4 border border-blue-200 max-w-sm mb-4">
          <div className="text-xs text-blue-600 mb-1">
            {language === 'bn' ? 'বার্তা প্রিভিউ:' : 'Message Preview:'}
          </div>
          <div className="text-sm text-gray-700 line-clamp-3">
            {generateMessengerMessage()}
          </div>
        </div>
      )}

      {/* Business Hours Notice */}
      {!isBusinessHours() && !error && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-center">
          <div className="text-xs text-yellow-800">
            <strong>
              {language === 'bn' ? '⏰ অফিস সময়ের বাইরে' : '⏰ Outside Business Hours'}
            </strong>
          </div>
          <div className="text-xs text-yellow-700 mt-1">
            {language === 'bn' 
              ? 'আমরা সকাল ৯টা - রাত ১০টা পর্যন্ত উপলব্ধ'
              : 'We\'re available 9 AM - 10 PM (Bangladesh time)'
            }
          </div>
        </div>
      )}

      {/* Manual Open Button or Error Retry */}
      <div className="flex gap-2">
        {error ? (
          <button
            onClick={openMessenger}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 3.54 1.84 6.65 4.61 8.44v3.56l3.42-1.88C10.68 21.88 11.32 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1.13 13.83l-2.61-2.79-5.09 2.79L10.52 10l2.61 2.79L18.22 10l-5.09 5.83z"/>
            </svg>
            {language === 'bn' ? 'আবার চেষ্টা করুন' : 'Try Again'}
          </button>
        ) : !isConnecting && isSDKLoaded && (
          <button
            onClick={openMessenger}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 3.54 1.84 6.65 4.61 8.44v3.56l3.42-1.88C10.68 21.88 11.32 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1.13 13.83l-2.61-2.79-5.09 2.79L10.52 10l2.61 2.79L18.22 10l-5.09 5.83z"/>
            </svg>
            {language === 'bn' ? 'Messenger খুলুন' : 'Open Messenger'}
          </button>
        )}

        {/* Fallback: Direct Facebook Page Link */}
        <button
          onClick={() => {
            const pageUrl = `https://m.me/${chatConfig.messenger.pageId}`;
            window.open(pageUrl, '_blank');
            if (onClose) onClose();
          }}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          {language === 'bn' ? 'পেজ' : 'Page'}
        </button>
      </div>

      {/* SDK Status for Debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          SDK: {isSDKLoaded ? '✅' : '⏳'} | 
          Error: {error ? '❌' : '✅'} | 
          Connecting: {isConnecting ? '🔄' : '⏹️'}
        </div>
      )}
    </div>
  );
}

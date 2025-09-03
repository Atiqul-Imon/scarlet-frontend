"use client";
import * as React from 'react';
import { ChatLanguage } from '../types';
import { chatConfig, whatsappTemplates, isBusinessHours, formatWhatsAppNumber } from '../config/chatConfig';

interface WhatsAppChatProps {
  language: ChatLanguage;
  message?: string;
  productId?: string;
  orderId?: string;
  onClose?: () => void;
}

export default function WhatsAppChat({
  language,
  message = '',
  productId,
  orderId,
  onClose
}: WhatsAppChatProps) {
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  const generateWhatsAppMessage = (): string => {
    if (message) {
      return message;
    }

    // Auto-generate message based on context
    if (productId) {
      return whatsappTemplates.productInquiry[language].replace('{product_name}', `Product ID: ${productId}`);
    }

    if (orderId) {
      return whatsappTemplates.orderStatus[language].replace('{order_id}', orderId);
    }

    // Default welcome message
    return chatConfig.whatsapp.welcomeMessage[language];
  };

  const openWhatsApp = () => {
    setIsRedirecting(true);

    const phoneNumber = formatWhatsAppNumber(chatConfig.whatsapp.phoneNumber);
    const messageText = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(messageText);
    
    // Check if business hours and add note if outside hours
    const finalMessage = !isBusinessHours() 
      ? `${messageText}\n\n${chatConfig.autoResponses.outOfHours[language]}`
      : messageText;

    const encodedFinalMessage = encodeURIComponent(finalMessage);

    // WhatsApp Web URL for desktop, WhatsApp app URL for mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const whatsappURL = isMobile
      ? `whatsapp://send?phone=${phoneNumber}&text=${encodedFinalMessage}`
      : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedFinalMessage}`;

    // Open WhatsApp
    window.open(whatsappURL, '_blank');

    // Track the interaction (you can integrate with analytics here)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'whatsapp_chat_initiated', {
        event_category: 'chat',
        event_label: productId ? 'product_inquiry' : orderId ? 'order_status' : 'general',
        value: 1
      });
    }

    // Close the chat widget after a delay
    setTimeout(() => {
      setIsRedirecting(false);
      if (onClose) {
        onClose();
      }
    }, 2000);
  };

  React.useEffect(() => {
    // Auto-open WhatsApp after component mounts
    const timer = setTimeout(() => {
      openWhatsApp();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-2xl">
      {/* WhatsApp Logo */}
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516z"/>
        </svg>
      </div>

      {/* Status Message */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          {isRedirecting 
            ? (language === 'bn' ? 'WhatsApp এ নিয়ে যাওয়া হচ্ছে...' : 'Redirecting to WhatsApp...')
            : (language === 'bn' ? 'WhatsApp এ চ্যাট করুন' : 'Chat on WhatsApp')
          }
        </h3>
        <p className="text-sm text-green-700">
          {language === 'bn' 
            ? 'আমাদের টিম আপনাকে সাহায্য করার জন্য প্রস্তুত'
            : 'Our team is ready to help you'
          }
        </p>
      </div>

      {/* Loading Animation */}
      {isRedirecting && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      )}

      {/* Message Preview */}
      <div className="bg-white rounded-xl p-4 border border-green-200 max-w-sm">
        <div className="text-xs text-green-600 mb-1">
          {language === 'bn' ? 'বার্তা প্রিভিউ:' : 'Message Preview:'}
        </div>
        <div className="text-sm text-gray-700 line-clamp-3">
          {generateWhatsAppMessage()}
        </div>
      </div>

      {/* Business Hours Notice */}
      {!isBusinessHours() && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-center">
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

      {/* Manual Open Button (fallback) */}
      {!isRedirecting && (
        <button
          onClick={openWhatsApp}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516z"/>
          </svg>
          {language === 'bn' ? 'WhatsApp খুলুন' : 'Open WhatsApp'}
        </button>
      )}
    </div>
  );
}

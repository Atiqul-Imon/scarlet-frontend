'use client';

import React, { useState, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface UnifiedChatWidgetProps {
  className?: string;
}

export default function UnifiedChatWidget({ className = '' }: UnifiedChatWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close chat widget when clicking outside on mobile
  useEffect(() => {
    if (isExpanded && isMobile) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (!target.closest('[data-chat-widget]')) {
          setIsExpanded(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded, isMobile]);

  // Auto-collapse after 5 seconds
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  const handleWhatsAppClick = () => {
    const phoneNumber = '8801234567890'; // Update with your WhatsApp number
    const message = 'Hello! I would like to know more about your beauty products.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setIsExpanded(false);
  };

  const handleFacebookClick = () => {
    const facebookUrl = 'https://www.facebook.com/your-page'; // Update with your Facebook page URL
    window.open(facebookUrl, '_blank');
    setIsExpanded(false);
  };

  return (
    <div className={`fixed ${isMobile ? 'right-4 bottom-20' : 'right-4 bottom-6'} z-50 ${className}`} style={{ zIndex: 50 }} data-chat-widget>
      {/* Main Chat Button */}
      <div className="relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="group relative bg-pink-600 hover:bg-pink-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          {isExpanded ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <ChatBubbleLeftRightIcon className="w-6 h-6" />
          )}
        </button>

        {/* Expanded Chat Options */}
        {isExpanded && (
          <div className="absolute bottom-full right-0 mb-4 space-y-3 z-50">
            {/* WhatsApp Button */}
            <button
              onClick={handleWhatsAppClick}
              className="group flex items-center space-x-3 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 min-w-[200px]"
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516z"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="font-medium">WhatsApp</div>
                <div className="text-xs opacity-90">Quick chat</div>
              </div>
            </button>

            {/* Facebook Button */}
            <button
              onClick={handleFacebookClick}
              className="group flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 min-w-[200px]"
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="font-medium">Facebook</div>
                <div className="text-xs opacity-90">Message us</div>
              </div>
            </button>
          </div>
        )}

        {/* No backdrop needed for mobile - causes black screen issue */}
      </div>
    </div>
  );
}

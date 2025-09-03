"use client";
import * as React from 'react';
import { ChatChannel, ChatLanguage, ChatSession, QuickAction } from '../types';
import ChatHeader from './ChatHeader';
import ChatBody from './ChatBody';
import ChatInput from './ChatInput';
import ChannelSelector from './ChannelSelector';

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onChannelChange: (channel: ChatChannel) => void;
  onLanguageChange: (language: ChatLanguage) => void;
  onSendMessage: (message: string) => void;
  currentChannel: ChatChannel;
  currentLanguage: ChatLanguage;
  session?: ChatSession;
  className?: string;
}

export default function ChatWidget({
  isOpen,
  onClose,
  onChannelChange,
  onLanguageChange,
  onSendMessage,
  currentChannel,
  currentLanguage,
  session,
  className = ''
}: ChatWidgetProps) {
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [showChannelSelector, setShowChannelSelector] = React.useState(false);
  const [isConnecting, setIsConnecting] = React.useState(false);

  // Animation state
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Quick actions for Bangladeshi e-commerce
  const quickActions: QuickAction[] = [
    {
      id: 'product-info',
      label: { en: 'Product Info', bn: 'পণ্যের তথ্য' },
      message: { en: 'I need information about a product', bn: 'আমি একটি পণ্য সম্পর্কে তথ্য চাই' },
      icon: '🛍️',
      category: 'product'
    },
    {
      id: 'order-status',
      label: { en: 'Order Status', bn: 'অর্ডার স্ট্যাটাস' },
      message: { en: 'I want to check my order status', bn: 'আমি আমার অর্ডারের অবস্থা জানতে চাই' },
      icon: '📦',
      category: 'order'
    },
    {
      id: 'delivery-info',
      label: { en: 'Delivery Info', bn: 'ডেলিভারি তথ্য' },
      message: { en: 'I need delivery information', bn: 'আমি ডেলিভারি সম্পর্কে জানতে চাই' },
      icon: '🚚',
      category: 'support'
    },
    {
      id: 'return-policy',
      label: { en: 'Return Policy', bn: 'রিটার্ন নীতি' },
      message: { en: 'I want to know about return policy', bn: 'আমি রিটার্ন নীতি সম্পর্কে জানতে চাই' },
      icon: '↩️',
      category: 'support'
    }
  ];

  const handleChannelSwitch = async (channel: ChatChannel) => {
    setIsConnecting(true);
    setShowChannelSelector(false);
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onChannelChange(channel);
    setIsConnecting(false);
  };

  const handleQuickAction = (action: QuickAction) => {
    const message = action.message[currentLanguage];
    onSendMessage(message);
  };

  if (!isOpen) return null;

  return (
    <div className={`
      fixed bottom-6 right-6 z-40 w-80 sm:w-96 h-[500px] max-h-[80vh]
      transition-all duration-300 ease-out transform origin-bottom-right
      ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
      ${className}
    `}>
      {/* Main chat container */}
      <div className={`
        bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden
        transition-all duration-300
        ${isMinimized ? 'h-14' : 'h-full'}
      `}>
        {/* Chat Header */}
        <ChatHeader
          channel={currentChannel}
          language={currentLanguage}
          isConnecting={isConnecting}
          isMinimized={isMinimized}
          onClose={onClose}
          onMinimize={() => setIsMinimized(!isMinimized)}
          onLanguageChange={onLanguageChange}
          onShowChannelSelector={() => setShowChannelSelector(true)}
        />

        {/* Chat Body - Hidden when minimized */}
        {!isMinimized && (
          <>
            <ChatBody
              session={session}
              currentLanguage={currentLanguage}
              quickActions={quickActions}
              onQuickAction={handleQuickAction}
              isConnecting={isConnecting}
            />
            
            <ChatInput
              channel={currentChannel}
              language={currentLanguage}
              onSendMessage={onSendMessage}
              disabled={isConnecting}
            />
          </>
        )}
      </div>

      {/* Channel Selector Modal */}
      {showChannelSelector && (
        <ChannelSelector
          currentChannel={currentChannel}
          onChannelSelect={handleChannelSwitch}
          onClose={() => setShowChannelSelector(false)}
        />
      )}

      {/* Connection Status Indicator */}
      {isConnecting && (
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center">
          <div className="bg-white px-4 py-2 rounded-lg flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">
              {currentLanguage === 'bn' ? 'সংযোগ করা হচ্ছে...' : 'Connecting...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

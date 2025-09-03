"use client";
import * as React from 'react';
import { ChatChannel, ChatLanguage, ChatSession } from './types';
import FloatingChatButton from './ChatButton/FloatingChatButton';
import ChatWidget from './ChatWidget/ChatWidget';
import WhatsAppChat from './Integrations/WhatsAppChat';
import MessengerChat from './Integrations/MessengerChat';
import MessengerCustomerChat from './Integrations/MessengerCustomerChat';
import { whatsappService } from './utils/whatsappUtils';
import { messengerService } from './utils/messengerUtils';

interface ChatManagerProps {
  className?: string;
  showChannelButtons?: boolean;
}

export default function ChatManager({ className = '', showChannelButtons = true }: ChatManagerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentChannel, setCurrentChannel] = React.useState<ChatChannel>('whatsapp');
  const [currentLanguage, setCurrentLanguage] = React.useState<ChatLanguage>('en');
  const [session, setSession] = React.useState<ChatSession | undefined>();
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [showWhatsAppRedirect, setShowWhatsAppRedirect] = React.useState(false);
  const [showMessengerRedirect, setShowMessengerRedirect] = React.useState(false);
  const [pendingMessage, setPendingMessage] = React.useState('');

  // Initialize language based on user preference or browser
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('chat-language') as ChatLanguage;
    const savedChannel = localStorage.getItem('chat-channel') as ChatChannel;
    
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Auto-detect language based on browser or location
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.includes('bn') || browserLang.includes('bd')) {
        setCurrentLanguage('bn');
      }
    }

    if (savedChannel) {
      setCurrentChannel(savedChannel);
    }
  }, []);

  // Save preferences
  React.useEffect(() => {
    localStorage.setItem('chat-language', currentLanguage);
  }, [currentLanguage]);

  React.useEffect(() => {
    localStorage.setItem('chat-channel', currentChannel);
  }, [currentChannel]);

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset unread count when opening chat
      setUnreadCount(0);
    }
  };

  const handleChannelChange = (channel: ChatChannel) => {
    setCurrentChannel(channel);
    // Initialize session for the selected channel
    console.log('Channel changed to:', channel);
  };

  const handleSendMessage = (message: string) => {
    if (currentChannel === 'whatsapp') {
      // For WhatsApp, redirect to WhatsApp with the message
      setPendingMessage(message);
      setShowWhatsAppRedirect(true);
      setIsOpen(false);
    } else if (currentChannel === 'messenger') {
      // For Messenger, redirect to Messenger with the message
      setPendingMessage(message);
      setShowMessengerRedirect(true);
      setIsOpen(false);
    } else {
      // For other channels, handle differently
      console.log('Send message via', currentChannel, ':', message);
    }
  };

  const handleLanguageChange = (language: ChatLanguage) => {
    setCurrentLanguage(language);
  };

  const openWhatsAppDirectly = () => {
    setCurrentChannel('whatsapp');
    setPendingMessage('');
    setShowWhatsAppRedirect(true);
    setIsOpen(false);
  };

  const openMessengerDirectly = () => {
    setCurrentChannel('messenger');
    setPendingMessage('');
    setShowMessengerRedirect(true);
    setIsOpen(false);
  };

  // Simulate receiving messages (for demo purposes)
  React.useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        // Simulate receiving a message when chat is closed
        setUnreadCount(prev => prev + 1);
      }, 10000); // 10 seconds after component mounts

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
      {/* Direct Channel Buttons */}
      {showChannelButtons && !isOpen && !showWhatsAppRedirect && !showMessengerRedirect && (
        <div className="pointer-events-auto fixed bottom-6 right-6 z-40 flex flex-col gap-3">
          {/* WhatsApp Button */}
          <button
            onClick={openWhatsAppDirectly}
            className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center text-white group"
            aria-label="Chat via WhatsApp"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516z"/>
            </svg>
            
            {/* Tooltip */}
            <div className="absolute right-full mr-3 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              WhatsApp
            </div>
          </button>

          {/* Messenger Button */}
          <button
            onClick={openMessengerDirectly}
            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center text-white group"
            aria-label="Chat via Messenger"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M12 0C5.374 0 0 4.975 0 11.111c0 3.498 1.744 6.616 4.47 8.652V24l4.086-2.242c1.09.301 2.246.464 3.444.464 6.626 0 12-4.974 12-11.111C24 4.975 18.626 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.1l3.13 3.26L19.752 8.1l-6.561 6.863z"/>
            </svg>
            
            {/* Tooltip */}
            <div className="absolute right-full mr-3 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Messenger
            </div>
          </button>

          {/* Main Chat Button */}
          <button
            onClick={handleToggleChat}
            className="w-14 h-14 bg-pink-500 hover:bg-pink-600 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center text-white group relative"
            aria-label="Open chat options"
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
            
            {/* Unread count badge */}
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
            
            {/* Tooltip */}
            <div className="absolute right-full mr-3 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              More Options
            </div>
          </button>
        </div>
      )}

      {/* Original Floating Chat Button (when channel buttons are disabled) */}
      {!showChannelButtons && (
        <div className="pointer-events-auto">
          <FloatingChatButton
            onToggleChat={handleToggleChat}
            isOpen={isOpen}
            unreadCount={unreadCount}
            preferredChannel={currentChannel}
          />
        </div>
      )}

      {/* Chat Widget */}
      {isOpen && !showWhatsAppRedirect && !showMessengerRedirect && (
        <div className="pointer-events-auto">
          <ChatWidget
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onChannelChange={handleChannelChange}
            onLanguageChange={handleLanguageChange}
            onSendMessage={handleSendMessage}
            currentChannel={currentChannel}
            currentLanguage={currentLanguage}
            session={session}
          />
        </div>
      )}

      {/* WhatsApp Redirect Modal */}
      {showWhatsAppRedirect && (
        <div className="pointer-events-auto fixed bottom-6 right-6 z-50">
          <div className="w-80 sm:w-96">
            <WhatsAppChat
              language={currentLanguage}
              message={pendingMessage}
              onClose={() => {
                setShowWhatsAppRedirect(false);
                setPendingMessage('');
              }}
            />
          </div>
        </div>
      )}

      {/* Messenger Redirect Modal */}
      {showMessengerRedirect && (
        <div className="pointer-events-auto fixed bottom-6 right-6 z-50">
          <div className="w-80 sm:w-96">
            <MessengerChat
              language={currentLanguage}
              message={pendingMessage}
              onClose={() => {
                setShowMessengerRedirect(false);
                setPendingMessage('');
              }}
            />
          </div>
        </div>
      )}

      {/* Messenger Customer Chat Plugin - Only render on client side */}
      {typeof window !== 'undefined' && (
        <MessengerCustomerChat 
          language={currentLanguage}
          className="hidden"
        />
      )}
    </div>
  );
}

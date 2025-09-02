"use client";
import * as React from 'react';
import { ChatChannel, ChatLanguage, ChatSession } from './types';
import FloatingChatButton from './ChatButton/FloatingChatButton';
import ChatWidget from './ChatWidget/ChatWidget';

interface ChatManagerProps {
  className?: string;
}

export default function ChatManager({ className = '' }: ChatManagerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentChannel, setCurrentChannel] = React.useState<ChatChannel>('whatsapp');
  const [currentLanguage, setCurrentLanguage] = React.useState<ChatLanguage>('en');
  const [session, setSession] = React.useState<ChatSession | undefined>();
  const [unreadCount, setUnreadCount] = React.useState(0);

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
    // Here you would typically initialize a new session for the selected channel
    console.log('Channel changed to:', channel);
  };

  const handleLanguageChange = (language: ChatLanguage) => {
    setCurrentLanguage(language);
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
      {/* Floating Chat Button */}
      <div className="pointer-events-auto">
        <FloatingChatButton
          onToggleChat={handleToggleChat}
          isOpen={isOpen}
          unreadCount={unreadCount}
          preferredChannel={currentChannel}
        />
      </div>

      {/* Chat Widget */}
      {isOpen && (
        <div className="pointer-events-auto">
          <ChatWidget
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onChannelChange={handleChannelChange}
            onLanguageChange={handleLanguageChange}
            currentChannel={currentChannel}
            currentLanguage={currentLanguage}
            session={session}
          />
        </div>
      )}
    </div>
  );
}

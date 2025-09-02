"use client";
import * as React from 'react';
import { ChatChannel } from '../types';

interface FloatingChatButtonProps {
  onToggleChat: () => void;
  isOpen: boolean;
  unreadCount?: number;
  preferredChannel?: ChatChannel;
  className?: string;
}

export default function FloatingChatButton({
  onToggleChat,
  isOpen,
  unreadCount = 0,
  preferredChannel = 'whatsapp',
  className = ''
}: FloatingChatButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);

  // Show tooltip after 3 seconds for first-time users
  React.useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('chat-tooltip-seen');
    if (!hasSeenTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        setTimeout(() => {
          setShowTooltip(false);
          localStorage.setItem('chat-tooltip-seen', 'true');
        }, 5000);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const getChannelIcon = (channel: ChatChannel) => {
    switch (channel) {
      case 'whatsapp':
        return (
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516z"/>
          </svg>
        );
      case 'messenger':
        return (
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
            <path d="M12 0C5.374 0 0 4.975 0 11.111c0 3.498 1.744 6.616 4.47 8.652V24l4.086-2.242c1.09.301 2.246.464 3.444.464 6.626 0 12-4.974 12-11.111C24 4.975 18.626 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.1l3.13 3.26L19.752 8.1l-6.561 6.863z"/>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
        );
    }
  };

  const getChannelColor = (channel: ChatChannel) => {
    switch (channel) {
      case 'whatsapp':
        return 'bg-green-500 hover:bg-green-600';
      case 'messenger':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-pink-500 hover:bg-pink-600';
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Tooltip for first-time users */}
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-3 w-64 p-3 bg-white rounded-lg shadow-xl border border-gray-200 animate-bounce">
          <div className="text-sm text-gray-700 font-medium mb-1">
            Need help? Chat with us! 💬
          </div>
          <div className="text-xs text-gray-500">
            Get instant support via WhatsApp or Messenger
          </div>
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
        </div>
      )}

      {/* Main chat button */}
      <button
        onClick={onToggleChat}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform
          ${getChannelColor(preferredChannel)}
          ${isHovered ? 'scale-110 shadow-2xl' : 'scale-100'}
          ${isOpen ? 'rotate-45' : 'rotate-0'}
          flex items-center justify-center text-white
          focus:outline-none focus:ring-4 focus:ring-opacity-30
          ${preferredChannel === 'whatsapp' ? 'focus:ring-green-300' : 'focus:ring-blue-300'}
        `}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {/* Pulse animation for attention */}
        <div className={`
          absolute inset-0 rounded-full animate-pulse
          ${getChannelColor(preferredChannel)} opacity-75
          ${isHovered ? 'scale-110' : 'scale-100'}
        `} />
        
        {/* Icon */}
        <div className="relative z-10 transition-transform duration-300">
          {isOpen ? (
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          ) : (
            getChannelIcon(preferredChannel)
          )}
        </div>

        {/* Unread count badge */}
        {unreadCount > 0 && !isOpen && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Hover tooltip */}
      {isHovered && !isOpen && !showTooltip && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-md whitespace-nowrap opacity-90">
          {preferredChannel === 'whatsapp' ? 'Chat via WhatsApp' : 'Chat via Messenger'}
          <div className="absolute top-full right-3 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
        </div>
      )}

      {/* Floating particles effect */}
      {isHovered && (
        <>
          <div className="absolute -top-2 -right-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
          <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-white rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-1 -left-2 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-bounce opacity-50"></div>
        </>
      )}
    </div>
  );
}
